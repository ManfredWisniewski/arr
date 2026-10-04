# Local dev entry point for `make dev`.
# Uses docker compose when Docker is available; otherwise starts a local
# PostgreSQL (installed via scoop on first run) and `npm run dev`.
$ErrorActionPreference = 'Stop'

$useDocker = [bool](Get-Command docker -ErrorAction SilentlyContinue)

# dev-only seed credentials (local@test.com / notapassword + a fixed local
# API key). Override via PAYLOAD_SEED_ADMIN_* env vars.
if (-not $env:PAYLOAD_SEED_ADMIN_EMAIL) {
    $env:PAYLOAD_SEED_ADMIN_EMAIL = 'local@test.com'
    $env:PAYLOAD_SEED_ADMIN_PASSWORD = 'notapassword'
    $env:PAYLOAD_SEED_ADMIN_API_KEY = '6927128c-70b0-4e85-a455-835e4d184afa'
}

# background: wait for the server, force a db query so dev mode pushes the
# schema, seed the dev user, then open the site (up to ~2 min)
Start-Job -ScriptBlock {
    param($root, $docker)
    Set-Location $root
    $up = $false
    foreach ($i in 1..120) {
        try {
            $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/api/health' `
                -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -eq 200) { $up = $true; break }
        } catch {}
        Start-Sleep -Seconds 1
    }
    if (-not $up) { return }
    foreach ($i in 1..30) {
        try {
            Invoke-RestMethod 'http://127.0.0.1:3000/api/pages?limit=1' `
                -TimeoutSec 5 | Out-Null
            break
        } catch { Start-Sleep -Seconds 2 }
    }
    foreach ($i in 1..3) {
        if ($docker) {
            docker compose exec -T `
                -e PAYLOAD_SEED_ADMIN_EMAIL -e PAYLOAD_SEED_ADMIN_PASSWORD `
                -e PAYLOAD_SEED_ADMIN_API_KEY `
                payload npx tsx scripts/seed-admin.ts
        } else {
            npx tsx scripts/seed-admin.ts
        }
        if ($LASTEXITCODE -eq 0) { break }
        Start-Sleep -Seconds 3
    }
    Start-Process 'http://localhost:3000'
} -ArgumentList (Get-Location).Path, $useDocker | Out-Null

if ($useDocker) {
    docker compose up
    exit $LASTEXITCODE
}

# --- native path: PostgreSQL + next dev ---
$pgBin = "$env:USERPROFILE\scoop\apps\postgresql\current\bin"
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    if (Test-Path "$pgBin\psql.exe") {
        # installed via scoop already, just not on this process's PATH
        $env:PATH = "$pgBin;$env:PATH"
    } else {
        if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
            throw 'PostgreSQL not found. Install it first: scoop install postgresql'
        }
        scoop install postgresql
        $env:PATH = "$pgBin;$env:PATH"
        if (-not (Test-Path "$pgBin\psql.exe")) {
            throw 'PostgreSQL install failed. Retry: scoop install postgresql'
        }
    }
}

$dataDir = "$env:USERPROFILE\scoop\persist\postgresql\data"
if (-not (Test-Path "$dataDir\PG_VERSION")) {
    # scoop's post_install normally does this; fallback for other installs
    & "$pgBin\initdb.exe" -D $dataDir -U postgres -E UTF8 --auth=trust | Out-Null
}

$pgService = Get-Service -Name 'PostgreSQL' -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne 'Running') { Start-Service PostgreSQL }
} else {
    & "$pgBin\pg_ctl.exe" -D $dataDir status *>$null
    if ($LASTEXITCODE -ne 0) {
        # console-detached so the postmaster outlives this shell; for a
        # durable setup run once elevated:
        #   pg_ctl register -N PostgreSQL -D <dataDir>
        Invoke-CimMethod -ClassName Win32_Process -MethodName Create `
            -Arguments @{ CommandLine = "`"$pgBin\pg_ctl.exe`" -D `"$dataDir`" -l `"$dataDir\server.log`" start" } |
            Out-Null
        # wait for the server to accept connections
        foreach ($i in 1..30) {
            & "$pgBin\psql.exe" -U postgres -d postgres -w -tAc 'select 1' `
                *>$null
            if ($LASTEXITCODE -eq 0) { break }
            Start-Sleep -Seconds 1
        }
    }
}

# same credentials as docker-compose.yml
$psql = @('-U', 'postgres', '-d', 'postgres', '-w')
$role = psql @psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='payload_test'"
if ($role -ne '1') {
    psql @psql -c "CREATE ROLE payload_test LOGIN PASSWORD 'payload_test'" | Out-Null
}
$db = psql @psql -tAc "SELECT 1 FROM pg_database WHERE datname='payload_test'"
if ($db -ne '1') {
    psql @psql -c "CREATE DATABASE payload_test OWNER payload_test" | Out-Null
}

npm run dev
