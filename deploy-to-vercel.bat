@echo off
echo ===================================================
echo Deploying 3D Human Pose Estimation Demo to Vercel
echo ===================================================
echo.

echo Checking if Vercel CLI is installed...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo Failed to install Vercel CLI. Please install Node.js and npm first.
        echo Visit https://nodejs.org/ to download and install Node.js.
        pause
        exit /b 1
    )
) else (
    echo Vercel CLI is already installed.
)

echo.
echo Starting deployment...
echo.
echo You will be prompted to log in to Vercel if you haven't already.
echo.
echo Press any key to continue...
pause >nul

vercel --prod

if %errorlevel% neq 0 (
    echo.
    echo Deployment failed. Please check the error messages above.
) else (
    echo.
    echo Deployment successful! Your application is now live.
    echo Share the URL with your client.
)

echo.
echo Press any key to exit...
pause >nul
