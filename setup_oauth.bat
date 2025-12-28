@echo off
echo ========================================
echo   Google OAuth Setup
echo ========================================
echo.

echo Step 1: Rebuilding containers...
docker-compose down
docker-compose up --build -d

echo.
echo Step 2: Waiting for services to start...
timeout /t 10 /nobreak

echo.
echo Step 3: Running migrations...
docker-compose exec backend python manage.py migrate

echo.
echo Step 4: Configuring Google OAuth...
docker-compose exec backend python manage.py shell < setup_oauth.py

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Google OAuth is now configured:
echo   Client ID: 545287780366-rqh9p6bm4b3gaju8fvs2s5ujbffhrn3g.apps.googleusercontent.com
echo.
echo Available endpoints:
echo   POST /api/auth/google/
echo   POST /api/auth/registration/
echo   POST /api/token/
echo.
echo Admin panel: http://localhost:8000/admin
echo.
pause
