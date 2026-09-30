# Per-submodule pull/push/status — avoids submodule.recurse rebase failures.
# Usage: scripts/submodules.ps1 [-Command status|pull|push]
param(
    [ValidateSet('status', 'pull', 'push')]
    [string]$Command = 'status'
)

$ErrorActionPreference = 'Continue'
$root = git rev-parse --show-toplevel 2>$null
if (-not $root) { Write-Error 'not inside a git repository'; exit 1 }

function Get-Submodules {
    param([string]$Repo)
    $gitmodules = Join-Path $Repo '.gitmodules'
    if (-not (Test-Path $gitmodules)) { return @() }
    $result = @()
    $lines = git -C $Repo config -f $gitmodules --get-regexp 'submodule\..*\.path' 2>$null
    foreach ($line in $lines) {
        $rel = ($line -split '\s+', 2)[1].Trim()
        $dir = Join-Path $Repo $rel
        $result += [pscustomobject]@{ Name = $rel; Dir = $dir }
        $result += Get-Submodules -Repo $dir
    }
    return $result
}

function Test-Dirty([string]$Dir) {
    return [bool](git -C $Dir status --porcelain 2>$null)
}

function Test-Ahead([string]$Dir) {
    return [bool](git -C $Dir log --oneline '@{u}..HEAD' 2>$null)
}

function Test-Initialized([string]$Dir) {
    return Test-Path (Join-Path $Dir '.git')
}

switch ($Command) {
    'status' {
        foreach ($sm in Get-Submodules -Repo $root) {
            if (-not (Test-Initialized $sm.Dir)) {
                '{0,-30} not initialized' -f $sm.Name; continue
            }
            $state = 'clean'
            if (Test-Dirty $sm.Dir) { $state = 'dirty' }
            if (Test-Ahead $sm.Dir) { $state += ' unpushed' }
            '{0,-30} {1}' -f $sm.Name, $state
        }
    }
    'pull' {
        foreach ($sm in Get-Submodules -Repo $root) {
            if (-not (Test-Initialized $sm.Dir)) {
                "SKIP  $($sm.Name) (not initialized)"; continue
            }
            if (Test-Dirty $sm.Dir) {
                "SKIP  $($sm.Name) (dirty)"; continue
            }
            "PULL  $($sm.Name)"
            git -C $sm.Dir pull --ff-only --tags
            if ($LASTEXITCODE -ne 0) { "FAIL  $($sm.Name)" }
        }
    }
    'push' {
        # deepest first so nested pointers can be committed before parents push
        $sms = Get-Submodules -Repo $root
        [array]::Reverse($sms)
        foreach ($sm in $sms) {
            if (-not (Test-Initialized $sm.Dir)) {
                "SKIP  $($sm.Name) (not initialized)"; continue
            }
            if (Test-Dirty $sm.Dir) {
                "SKIP  $($sm.Name) (dirty - commit it first)"; continue
            }
            if (Test-Ahead $sm.Dir) {
                "PUSH  $($sm.Name)"
                git -C $sm.Dir push
                if ($LASTEXITCODE -ne 0) { "FAIL  $($sm.Name)" }
            } else {
                "OK    $($sm.Name) (nothing to push)"
            }
        }
        if (git -C $root status --porcelain) {
            'NOTE  superproject has uncommitted changes (submodule pointers?)'
        }
    }
}
