# Local dev entry point for `make dev`.
# Uses docker compose when Docker is available; otherwise starts a local
# PostgreSQL (installed via scoop on first run) and `npm run dev`.
$ErrorActionPreference = 'Stop'

# open the site once the dev server answers (up to ~2 min)
Start-Job -ScriptBlock {
    foreach ($i in 1..120) {
        try {
            $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/api/health' `
                -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -eq 200) {
                Start-Process 'http://localhost:3000'
                return
            }
        } catch {}
        Start-Sleep -Seconds 1
    }
} | Out-Null

if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose up
    exit $LASTEXITCODE
}

# --- native path: PostgreSQL + next dev ---
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
        throw 'PostgreSQL not found. Install it first: scoop install postgresql'
    }
    scoop install postgresql
    # scoop adds <app>/bin to the user PATH — refresh this process
    $env:PATH = [Environment]::GetEnvironmentVariable('PATH', 'User') + ';' +
                [Environment]::GetEnvironmentVariable('PATH', 'Machine')
    if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
        throw 'PostgreSQL install failed. Retry: scoop install postgresql'
    }
}

$dataDir = "$env:USERPROFILE\scoop\persist\postgresql\data"
if (-not (Test-Path "$dataDir\PG_VERSION")) {
    # scoop's post_install normally does this; fallback for other installs
    initdb -D $dataDir -U postgres -E UTF8 --auth=trust | Out-Null
}

pg_ctl -D $dataDir status *>$null
if ($LASTEXITCODE -ne 0) {
    pg_ctl -D $dataDir -l "$dataDir\server.log" start
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

# apply schema + seed a local admin/API-key user (env-overridable)
npx payload migrate
if (-not $env:PAYLOAD_SEED_ADMIN_EMAIL) {
    $env:PAYLOAD_SEED_ADMIN_EMAIL = 'local@test.com'
    $env:PAYLOAD_SEED_ADMIN_PASSWORD = 'notapassword'
    $env:PAYLOAD_SEED_ADMIN_API_KEY = '6927128c-70b0-4e85-a455-835e4d184afa'
}
npx tsx scripts/seed-admin.ts

npm run dev
