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
set deploy_cmd=deploy:dev
set secret_env=dev
set ecosystem_config=ecosystem.dev.config.cjs
if /i "%current_branch%"=="%expected_branch%" goto select_apps
goto warning

:check_staging
set target_env=Staging
set expected_branch=test
set deploy_cmd=deploy:staging
set secret_env=staging
set ecosystem_config=ecosystem.stg.config.cjs
if /i "%current_branch%"=="%expected_branch%" goto select_apps
goto warning

:check_prod
set target_env=Production
set expected_branch=prod
set deploy_cmd=deploy:prod
set secret_env=prod
set ecosystem_config=ecosystem.prod.config.cjs
if /i "%current_branch%"=="%expected_branch%" goto select_apps
goto warning

:warning
echo.
echo [WARNING] Branch Mismatch!
echo You are deploying to %target_env% but current branch is "%current_branch%".
echo Expected branch: "%expected_branch%"
echo.
set /p confirm="Are you sure you want to continue? (y/n): "
if /i "%confirm%"=="y" goto select_apps
echo Deployment cancelled.
goto end

:select_apps
echo.
echo Please select apps to build (comma separated, e.g., 1,2):
echo 1. rd-ai-city
echo 2. product-spec
echo 3. All
echo.
set /p app_choice="Enter your choice: "

set filter_args=
if "%app_choice%"=="1" set filter_args=--filter=rd-ai-city
if "%app_choice%"=="2" set filter_args=--filter=product-spec
if "%app_choice%"=="3" set filter_args=
if "%app_choice%"=="1,2" set filter_args=--filter=rd-ai-city --filter=product-spec
if "%app_choice%"=="2,1" set filter_args=--filter=rd-ai-city --filter=product-spec

echo.
echo Deploying to %target_env% environment...
echo Apps filter: %filter_args%
echo Using ecosystem config: %ecosystem_config%
echo.

:: Execute deployment steps manually to support filtering
call pnpm secrets:decrypt:%secret_env%
call pnpm i
:: Memory optimization for build
set NODE_OPTIONS=--max-old-space-size=4096
call pnpm build %filter_args%
call pm2 startOrReload %ecosystem_config%

goto end

:end
echo.
echo Deployment script finished.
pause
