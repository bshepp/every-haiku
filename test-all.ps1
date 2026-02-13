# Every Haiku Test Runner Script (PowerShell)
# This script runs all tests for the Every Haiku application

$ErrorActionPreference = "Continue"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Every Haiku - Comprehensive Test Suite"   -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Track overall test status
$AllPassed = $true

function Invoke-TestSuite {
    param(
        [string]$SuiteName,
        [scriptblock]$Command
    )
    Write-Host "Running $SuiteName..." -ForegroundColor Yellow
    try {
        & $Command
        if ($LASTEXITCODE -ne 0) { throw "Non-zero exit code: $LASTEXITCODE" }
        Write-Host "`u{2713} $SuiteName passed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "`u{2717} $SuiteName failed" -ForegroundColor Red
        return $false
    }
}

# Check if Firebase CLI is available
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Firebase CLI not found. Install with: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# -----------------------------------------------
# 1. Unit Tests
# -----------------------------------------------
Write-Host "1. UNIT TESTS" -ForegroundColor Cyan
Write-Host "============="

Push-Location functions
$result = Invoke-TestSuite "Cloud Functions Unit Tests" { npm test -- --passWithNoTests }
if (-not $result) { $AllPassed = $false }
Write-Host ""
Pop-Location

# -----------------------------------------------
# 2. Integration Tests
# -----------------------------------------------
Write-Host "2. INTEGRATION TESTS" -ForegroundColor Cyan
Write-Host "===================="

Write-Host "Starting Firebase emulators..."
$emulatorJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    firebase emulators:start --only firestore,auth --project test-project 2>&1
}

# Wait for emulators to start (poll with timeout)
$maxWait = 60  # seconds
$waited = 0
$emulatorReady = $false
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $emulatorReady = $true
        break
    }
    catch {
        # Not ready yet
    }
}

if (-not $emulatorReady) {
    Write-Host "Error: Firebase emulators failed to start within ${maxWait}s" -ForegroundColor Red
    Stop-Job $emulatorJob -ErrorAction SilentlyContinue
    Remove-Job $emulatorJob -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Emulators are ready." -ForegroundColor Green

Push-Location functions
$result = Invoke-TestSuite "Firestore Security Rules Tests" { npm test -- integration/firestore.test.js }
if (-not $result) { $AllPassed = $false }
Write-Host ""
Pop-Location

# Stop emulators
Write-Host "Stopping Firebase emulators..."
Stop-Job $emulatorJob -ErrorAction SilentlyContinue
Remove-Job $emulatorJob -Force -ErrorAction SilentlyContinue
# Also kill any lingering java processes from the emulators
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "cloud-firestore-emulator|firebase"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# -----------------------------------------------
# 3. E2E Tests
# -----------------------------------------------
if (Test-Path "node_modules\.bin\cypress.cmd") {
    Write-Host "3. END-TO-END TESTS" -ForegroundColor Cyan
    Write-Host "==================="

    Write-Host "Starting Firebase emulators for E2E tests..."
    $emulatorJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        firebase emulators:start 2>&1
    }

    # Wait for emulators
    $waited = 0
    $emulatorReady = $false
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            $emulatorReady = $true
            break
        }
        catch { }
    }

    if ($emulatorReady) {
        $result = Invoke-TestSuite "Cypress E2E Tests" { npx cypress run --headless }
        if (-not $result) { $AllPassed = $false }
    }
    else {
        Write-Host "Error: Firebase emulators failed to start for E2E tests" -ForegroundColor Red
        $AllPassed = $false
    }

    Write-Host "Stopping Firebase emulators..."
    Stop-Job $emulatorJob -ErrorAction SilentlyContinue
    Remove-Job $emulatorJob -Force -ErrorAction SilentlyContinue
}
else {
    Write-Host "Skipping E2E tests - Cypress not installed" -ForegroundColor Yellow
    Write-Host "To install Cypress, run: npm install"
    Write-Host ""
}

# -----------------------------------------------
# 4. Coverage Report
# -----------------------------------------------
Write-Host ""
Write-Host "4. TEST COVERAGE" -ForegroundColor Cyan
Write-Host "================"

$coverageDir = "functions\coverage"
if (Test-Path $coverageDir) {
    Write-Host "Coverage report available at: functions\coverage\lcov-report\index.html"

    $summaryFile = "functions\coverage\coverage-summary.json"
    if (Test-Path $summaryFile) {
        Write-Host ""
        Write-Host "Coverage Summary:"
        $coverage = Get-Content $summaryFile | ConvertFrom-Json
        $total = $coverage.total
        Write-Host "  Lines:      $($total.lines.pct)%"
        Write-Host "  Statements: $($total.statements.pct)%"
        Write-Host "  Functions:  $($total.functions.pct)%"
        Write-Host "  Branches:   $($total.branches.pct)%"
    }
}
else {
    Write-Host "No coverage report found. Run 'npm run test:coverage' to generate."
}

# -----------------------------------------------
# Summary
# -----------------------------------------------
Write-Host ""
Write-Host "========================================="
if ($AllPassed) {
    Write-Host "`u{2713} ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`u{2717} SOME TESTS FAILED" -ForegroundColor Red
    exit 1
}
