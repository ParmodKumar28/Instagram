<div align="center">

# 📸 Instagram Clone — Full-Stack Social Platform

A pixel-perfect, feature-rich, full-stack **Instagram Clone** built with **React 18**, **Vite**, **Redux Toolkit**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

## ✨ Features

### 🎨 Modern & Authentic Instagram UI
- **Desktop Sidebar Navigation**: Border-free, sleek vertical layout with centered icons and smooth expandable rail.
- **Mobile Responsive Design**: Fixed top header with live notifications badge and bottom navigation bar matching official iOS/Android layouts.
- **Vector Icons**: Standardized with high-fidelity vector icons (`react-icons/io5`, `react-icons/go`, `react-icons/ri`).

### 🎬 Media & Post Engine
- **Photo & Video Support**: Native support for high-resolution images and videos with Cloudinary media storage.
- **Instagram-Style Video Controls**: Tap anywhere to toggle play/pause with centered animation badge, audio/mute button, and in-view autoplay via `IntersectionObserver`.
- **Double-Tap Heart Animation**: Centered floating heart like effect on desktop double-click and mobile double-tap.
- **Create Post Modal**: Two-column interactive post creator with drag-and-drop media upload, live preview, caption editor, and location tagging.

### 👤 Profile & Social Graph
- **Dynamic Profile Management**: View posts count, followers, following, bio, external links, and avatar preview.
- **Public vs. Private Accounts**: Full privacy enforcement with locked profile states, follow requests, and instant post reveal upon approval.
- **Save Post Feature**: One-tap bookmarking to save posts to a private **SAVED** tab collection.
- **Post Details Modal**: Split-view lightbox displaying full media, live like counter, chronologically ordered comments, and delete permissions.

### 🔔 Live Notifications & Activity Feed
- **Live Sync Polling**: Real-time updates for follow requests, accepted followers, and likes.
- **Overlapping Drawer**: Slide-over notifications panel directly on top of navigation rail.

### 🔐 Authentication & Security
- **JWT & HTTP-Only Cookies**: Secure session management.
- **Password Reset Flow**: Email verification tokens via Nodemailer.
- **Password Hashing**: Bcrypt encryption with salt rounds.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Redux Toolkit, Tailwind CSS, React Router v6, React Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ODM |
| **Storage & CDN** | Cloudinary (Images & Videos), Multer |
| **Auth & Security** | JSON Web Tokens (JWT), Bcrypt, Cookie-Parser, CORS |
| **Communication** | Axios, Nodemailer |

---

## 📁 Project Structure

```text
Instagram/
├── client/                     # Frontend Single Page Application (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Logos, skeletons, loaders
│   │   │   ├── layout/         # LeftSidebar, Header, Footer, MainLayout
│   │   │   ├── notifications/  # NotificationsDrawer, ActivityList
│   │   │   ├── post/           # PostCard, CreatePostModal, PostDetailsModal, InstagramVideoPlayer
│   │   │   ├── profile/        # UserPostList
│   │   │   └── story/          # StoriesList, StoryItem
│   │   ├── pages/              # Application views (Auth, Feed, Profile, Settings)
│   │   ├── redux/              # Redux Toolkit store & slices (posts, users, followers)
│   │   ├── services/           # Axios API client modules
│   │   └── index.css           # Tailwind design tokens & custom keyframes
│   └── package.json
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # MongoDB connection & Cloudinary setup
│   │   ├── features/           # Modular domain-driven architecture
│   │   │   ├── comments/       # Comment controller, routes, repository, schema
│   │   │   ├── followers/      # Follow requests, status, activity streams
│   │   │   ├── likes/          # Like/Unlike polymorphic system
│   │   │   ├── posts/          # Post CRUD, saved posts, video processing
│   │   │   └── user/           # Auth, registration, profile data
│   │   ├── middlewares/        # JWT auth, error handlers, file upload
│   │   └── utils/              # Error handling classes, mailers
│   ├── server.js               # Entry point
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas connection URI)
- **Cloudinary Account** (for media uploads)

---

### 1. Clone the Repository
```bash
git clone https://github.com/ParmodKumar28/Instagram.git
cd Instagram
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/instagram
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary Config
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Email / Nodemailer (Optional for password reset)
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

Create a `.env` file in the `client/` directory (optional if using default proxy):

```env
VITE_API_URL=http://localhost:8000/api
```

---

### 3. Install Dependencies

**Install Backend Dependencies:**
```bash
cd server
npm install
```

**Install Frontend Dependencies:**
```bash
cd ../client
npm install
```

---

### 4. Run the Application

From the `server/` folder, run both client and server concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend Server (http://localhost:8000)
cd server
npm run server

# Terminal 2: Frontend Client (http://localhost:5173)
cd client
npm run dev
```

---

## 📡 API Overview

### 🔐 Authentication (`/api/user`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/user/signup` | Register a new user |
| `POST` | `/api/user/login` | Log in and receive auth cookie |
| `GET` | `/api/user/logout` | Clear session cookie |
| `GET` | `/api/user/user-data` | Get logged-in user profile |
| `GET` | `/api/user/user-data/:userId` | Get public profile by user ID |
| `PUT` | `/api/user/update-user` | Update profile info & avatar |

### 📸 Posts & Saves (`/api/post`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/post/all-posts` | Fetch all feed posts |
| `GET` | `/api/post/:postId` | Fetch single post details |
| `GET` | `/api/post/user-posts/:userId` | Get posts by user |
| `POST` | `/api/post/create-post` | Create new photo/video post |
| `POST` | `/api/post/save/:postId` | Toggle save/bookmark post |
| `GET` | `/api/post/saved/all` | Get user's saved posts |
| `DELETE`| `/api/post/delete-post/:postId` | Delete post by ID |

### 💬 Comments & Likes (`/api/comment`, `/api/like`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/comment/:postId` | Get comments for post |
| `POST` | `/api/comment/:postId` | Post comment |
| `DELETE`| `/api/comment/:commentId` | Delete comment |
| `GET` | `/api/like/toggle/:id?type=Post` | Toggle like on post |
| `GET` | `/api/like/all-likes/:id?type=Post`| Get all likes on post |

### 👥 Followers & Requests (`/api/follower`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/follower/toggle-follow/:userId` | Follow / send follow request |
| `GET` | `/api/follower/requests` | Get incoming follow requests |
| `PUT` | `/api/follower/accept-request/:userId`| Accept follow request |
| `GET` | `/api/follower/activity` | Get real-time notification events |

---

## 👨‍💻 Author

**Parmod Kumar**
- GitHub: [@ParmodKumar28](https://github.com/ParmodKumar28)

---

## 📄 License

This project is licensed under the ISC License.
