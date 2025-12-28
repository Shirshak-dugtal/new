@echo off
echo 🚀 Starting Sessions Marketplace...
echo.

echo Step 1/5: Starting Docker services...
docker-compose up -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak > nul

echo.
echo Step 2/5: Running database migrations...
docker-compose exec -T backend python manage.py migrate

echo.
echo Step 3/5: Setting up OAuth...
docker-compose exec -T backend python setup_oauth.py

echo.
echo Step 4/5: Initializing MinIO buckets...
python setup_minio.py

echo.
echo Step 5/5: Creating test accounts...
docker-compose exec -T backend python -c "from core.models import User; User.objects.filter(username='student').exists() or User.objects.create_user(username='student', email='student@test.com', password='test123', role='user') and print('✅ Student account created'); User.objects.filter(username='instructor').exists() or User.objects.create_user(username='instructor', email='instructor@test.com', password='test123', role='creator') and print('✅ Instructor account created')"

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ Setup Complete!
echo ═══════════════════════════════════════════════════════
echo.
echo 🌐 Access the application:
echo    Frontend:      http://localhost
echo    MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
echo.
echo 👤 Test Accounts:
echo    Student:    student / test123
echo    Instructor: instructor / test123
echo.
echo 📊 View logs:
echo    docker-compose logs -f
echo.
echo 🛑 Stop services:
echo    docker-compose down
echo.
pause
