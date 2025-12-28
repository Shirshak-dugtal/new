# Sessions Marketplace

A full-stack application for creating and booking online sessions. Built with Django (Backend), React (Frontend), PostgreSQL, and MinIO.

## 🎥 Demo Video

<!-- Replace VIDEO_ID_HERE with your actual YouTube video ID -->
[![Watch the Demo]
(https://github.com/user-attachments/assets/2bf4fb4a-bb7f-4fd6-8165-a4bbe17d2a46)


## 🚀 Setup Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Environment Configuration
Navigate to the backend folder and create your `.env` file:

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and configure the following variables:
- `SECRET_KEY`: Set a secure secret key.
- `DB_PASSWORD`: Ensure it matches `docker-compose.yml` (default: postgres).
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google Login.
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For GitHub Login.
- `RATE_LIMIT_ANON` & `RATE_LIMIT_USER`: Rate limiting settings.

### 3. Run with Docker
Start the entire stack using Docker Compose:

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MinIO Console**: http://localhost:9001

---

## 🔐 OAuth Client Setup

To enable Social Login, you need to set up OAuth apps in Google and GitHub.

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and configure the OAuth consent screen.
3. Create credentials (OAuth Client ID).
4. **Authorized JavaScript Origins**: `http://localhost:3000`
5. **Authorized Redirect URIs**: `http://localhost:3000`
6. Copy Client ID and Secret to `backend/.env`.

### GitHub OAuth
1. Go to GitHub Settings > Developer Settings > OAuth Apps.
2. New OAuth App.
3. **Homepage URL**: `http://localhost:3000`
4. **Authorization callback URL**: `http://localhost:3000`
5. Copy Client ID and Secret to `backend/.env`.

---

## 💡 Example Demo Flow

### 1. Login / Sign Up
1. Open http://localhost:3000.
2. Click **Login**.
3. Choose **"Continue with Google/GitHub"**.
4. Select your role: **Student** or **Teacher** (Creator).

### 2. Create a Session (Teacher)
1. Log in as a **Teacher**.
2. Go to **Manage Classes** (Creator Dashboard).
3. Click **Create New Class**.
4. Fill in details (Title, Description, Date, Price, Image).
5. Click **Create Class**.

### 3. Book a Session (Student)
1. Log in as a **Student**.
2. Browse classes on the Home page.
3. Click on a class to view details.
4. Click **Enroll Now**.
5. View your enrollments in **My Bookings**.

### 4. View Enrollments (Teacher)
1. Go to **Manage Classes**.
2. Find your class card.
3. Click **Students** to see the list of enrolled users.
