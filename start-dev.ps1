# Start both development servers and keep them running

$ErrorActionPreference = "Continue"

Write-Host "🚀 Starting Fanah Fragances Development Environment..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Paths
$rootDir = Split-Path -Parent $MyInvocation.MyCommandPath
$apiServerDir = Join-Path $rootDir "artifacts\api-server"
$frontendDir = Join-Path $rootDir "artifacts\decants-shop"

# Kill any existing node processes on ports 3000 and 5173
Write-Host "🧹 Cleaning up old processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

# Start API Server
Write-Host "`n📦 Starting API Server (port 3000)..." -ForegroundColor Cyan
$apiJob = Start-Job -ScriptBlock {
    Set-Location $args[0]
    & pnpm dev
} -ArgumentList $apiServerDir -Name "api-server"

# Wait for API server to be ready
$apiReady = $false
$attempts = 0
while (-not $apiReady -and $attempts -lt 30) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Host "✅ API Server is ready!" -ForegroundColor Green
        }
    }
    catch {}
    
    if (-not $apiReady) {
        Start-Sleep -Seconds 1
        $attempts++
    }
}

if (-not $apiReady) {
    Write-Host "⚠️  API Server might not be responding, but continuing..." -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "`n🎨 Starting Frontend Server (port 5173)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $args[0]
    & pnpm dev
} -ArgumentList $frontendDir -Name "frontend"

# Wait for Frontend server to be ready
$frontendReady = $false
$attempts = 0
while (-not $frontendReady -and $attempts -lt 30) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173/" -Method GET -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $null -ne $response) {
            $frontendReady = $true
            Write-Host "✅ Frontend Server is ready!" -ForegroundColor Green
        }
    }
    catch {}
    
    if (-not $frontendReady) {
        Start-Sleep -Seconds 1
        $attempts++
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "🎉 Development Environment Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n📍 Access the application at:" -ForegroundColor Cyan
Write-Host "   🏪 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   🔐 Admin Panel: http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "   🔑 Admin Password: Lujo14" -ForegroundColor Yellow
Write-Host "   🛠️  API: http://localhost:3000" -ForegroundColor White
Write-Host "`n💡 Keep this window open. Servers will continue running." -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop all servers." -ForegroundColor Gray
Write-Host "`n"

# Keep script running and restart servers if they crash
while ($true) {
    $apiJobState = Get-Job -Name "api-server" -ErrorAction SilentlyContinue
    $frontendJobState = Get-Job -Name "frontend" -ErrorAction SilentlyContinue
    
    if ($null -eq $apiJobState -or $apiJobState.State -ne "Running") {
        Write-Host "⚠️  API Server crashed! Restarting..." -ForegroundColor Yellow
        $apiJob = Start-Job -ScriptBlock {
            Set-Location $args[0]
            & pnpm dev
        } -ArgumentList $apiServerDir -Name "api-server-restart-$(Get-Random)"
    }
    
    if ($null -eq $frontendJobState -or $frontendJobState.State -ne "Running") {
        Write-Host "⚠️  Frontend Server crashed! Restarting..." -ForegroundColor Yellow
        $frontendJob = Start-Job -ScriptBlock {
            Set-Location $args[0]
            & pnpm dev
        } -ArgumentList $frontendDir -Name "frontend-restart-$(Get-Random)"
    }
    
    Start-Sleep -Seconds 5
}
