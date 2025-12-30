@echo off
setlocal

echo ==========================================
echo      Monorepo Deployment Script
echo ==========================================
echo.

:: Get current git branch
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i
echo Current Git Branch: %current_branch%
echo.

echo Please select the environment to deploy:
echo 1. Development (dev)   [Expected Branch: dev]
echo 2. Staging (staging)   [Expected Branch: test]
echo 3. Production (prod)   [Expected Branch: prod]
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto check_dev
if "%choice%"=="2" goto check_staging
if "%choice%"=="3" goto check_prod

echo Invalid choice. Exiting.
goto end

:check_dev
set target_env=Development
set expected_branch=dev
if /i "%current_branch%"=="%expected_branch%" goto deploy_dev
goto warning

:check_staging
set target_env=Staging
set expected_branch=test
if /i "%current_branch%"=="%expected_branch%" goto deploy_staging
goto warning

:check_prod
set target_env=Production
set expected_branch=prod
if /i "%current_branch%"=="%expected_branch%" goto deploy_prod
goto warning

:warning
echo.
echo [WARNING] Branch Mismatch!
echo You are deploying to %target_env% but current branch is "%current_branch%".
echo Expected branch: "%expected_branch%"
echo.
set /p confirm="Are you sure you want to continue? (y/n): "
if /i "%confirm%"=="y" (
    if "%choice%"=="1" goto deploy_dev
    if "%choice%"=="2" goto deploy_staging
    if "%choice%"=="3" goto deploy_prod
)
echo Deployment cancelled.
goto end

:deploy_dev
echo.
echo Deploying to Development environment...
call pnpm deploy:dev
goto end

:deploy_staging
echo.
echo Deploying to Staging environment...
call pnpm deploy:staging
goto end

:deploy_prod
echo.
echo Deploying to Production environment...
call pnpm deploy:prod
goto end

:end
echo.
echo Deployment script finished.
pause
