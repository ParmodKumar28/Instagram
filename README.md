<div align="center">

# 📸 Instagram Clone — Full-Stack Social Platform

A modern, pixel-perfect, and feature-rich **Instagram Clone** built with **React 18**, **Vite**, **Redux Toolkit**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

## ✨ Features Overview

### 💬 Real-Time Direct Messages & Quick Chat Dock
- **Full Direct Messages Page (`/messages`)**: Two-column layout with search, story notes, and rich chat streams.
- **Floating Messenger Dock**: Expandable bottom-right quick chat drawer matching the official Instagram web interface.
- **Live Typing Indicators**: Animated 3-dot typing bubble and list indicator (`typing...`) when your partner is typing.
- **Real-Time Read Receipts**: Instant `• Seen` receipt when recipient views messages.
- **Online Presence**: Live green dot indicators showing active users across conversation lists and chat headers.
- **Media Attachments & Unsend**: Share photos, videos, or text messages with instant unsend capabilities.

### 🎬 Reels & Short Video Experience
- **Immersive Reels Feed (`/reels`)**: Smooth vertical scrolling video player with autoplay/pause controls.
- **Double-Tap Liking**: Instant double-tap/double-click heart pop animation and optimistic liking.
- **Interactive Sidebar & Comments**: Slide-up comments drawer, like list modal, follow/unfollow author, and audio attribution.

### 📖 24-Hour Ephemeral Stories
- **Stories Carousel**: Interactive top feed bar with Instagram gradient rings indicating unviewed stories.
- **Story Creator Modal**: Upload photo or video stories with custom text captions.
- **Story Viewer**: Fullscreen story player with auto-advancing progress timers, pause-on-hold, story likes, and direct replies.

### 🔔 Live Notifications & Activity System
- **Universal Socket Notifications**: Real-time push alerts for Post Likes, Comments, Follow Requests, Accepts, Story Likes, and Story Replies.
- **Instagram Floating Toasts**: Custom animated toast cards with sender avatar, action badge (❤️, 💬, 👤), and quick navigation on click.
- **Notification Badges**: Instagram red dot pulse badge on sidebar and header icons that clears when opened.

### 📸 Posts, Feed & Social Graph
- **Create Post Modal**: Drag-and-drop media creator with filters, location tagging, and caption editor.
- **Public & Private Accounts**: Full privacy controls with follow requests, approval workflows, and private profile masking.
- **Collections & Bookmarks**: Save posts to private collections accessible via the **SAVED** profile tab.
- **LightBox Post Details**: Modal view with full comments hierarchy, reply threads, and like tracking.

### 🛡️ Enterprise-Grade Security Architecture
- **JWT Handshake Authentication**: Authenticated WebSocket connections and Bearer token API validation.
- **Rate Limiting Protection**:
  - `authLimiter`: 100 attempts / 15 mins on `/signin`, `/signup`, and `/forgotPassword` against brute-force attacks.
  - `contentCreationLimiter`: 300 requests / 15 mins on posts, comments, stories, and messages to prevent spam.
  - `generalApiLimiter`: 3000 requests / 15 mins (~200 req/min) global baseline against scraping and DoS.
- **Security Headers & CORS**: `helmet` HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`) and production origin lock.
- **IDOR Protection**: Strict ownership checks across posts, comments, stories, and messages.
- **Automatic 401 Interceptor**: Clean frontend session expiry handling and redirect.

---

## 🛠️ Tech Stack & Architecture

<div align="center">

### ⚡ Frontend & UI Layer
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router_6-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![React Hot Toast](https://img.shields.io/badge/React_Hot_Toast-FF3E00?style=for-the-badge&logo=buzzfeed&logoColor=white)](https://react-hot-toast.com/)

### ⚙️ Backend & API Engine
[![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js_4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO_4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose_ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

### 🛡️ Security & Defensive Controls
[![Helmet](https://img.shields.io/badge/Helmet.js-000000?style=for-the-badge&logo=shield&logoColor=white)](https://helmetjs.github.io/)
[![Express Rate Limit](https://img.shields.io/badge/Rate_Limit-E34F26?style=for-the-badge&logo=speedtest&logoColor=white)](https://github.com/express-rate-limit/express-rate-limit)
[![JWT](https://img.shields.io/badge/JWT_Bearer-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt_12_Rounds-5A245A?style=for-the-badge&logo=auth0&logoColor=white)](https://github.com/kelektiv/node.bcrypt.js)

</div>

<br/>

| Layer | Technology | Primary Role in System |
| :--- | :--- | :--- |
| **UI Library** | `React 18` + `Vite` | Component-driven SPA with sub-second HMR and optimized production bundling |
| **State Management**| `Redux Toolkit` | Centralized global slices for real-time chat, feed posts, presence, and notifications |
| **Styling & Theme** | `Tailwind CSS 3` | Authentic Instagram design system, custom keyframe animations, glassmorphism |
| **Real-Time Engine**| `Socket.IO 4.8` | Bi-directional WebSocket channels for instant direct messages, typing indicators, and toasts |
| **API Server** | `Express.js` + `Node.js` | RESTful modular micro-architecture with domain-driven controllers and repositories |
| **Database & ODM** | `MongoDB` + `Mongoose` | Scalable NoSQL schema with relational population, indexes, and aggregation pipelines |
| **Media Delivery** | `Cloudinary CDN` | Fast, cloud-optimized video and image storage with automatic format transformations |
| **Security Shield** | `Helmet` + `Rate Limit` | Defense-in-depth HTTP headers, anti-scraping, anti-brute-force, and IDOR protection |
| **Mailing Service** | `Nodemailer` | Automated password reset dispatch and transactional welcome emails |

---

## 📁 Project Structure

```text
Instagram/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── chat/           # QuickChatDrawer floating messenger
│   │   │   ├── common/         # Avatar, InstagramLogo, skeletons
│   │   │   ├── layout/         # LeftSidebar, Header, Footer, MainLayout
│   │   │   ├── notifications/  # NotificationsDrawer, ActivityList
│   │   │   ├── post/           # PostCard, CreatePostModal, PostDetailsModal, VideoPlayer
│   │   │   ├── profile/        # UserPostList, SavedPosts
│   │   │   └── story/          # StoriesList, StoryItem, StoryViewerModal, CreateStoryModal
│   │   ├── context/            # SocketContext (real-time events, toasts, presence)
│   │   ├── pages/              # Application pages (Feed, Reels, Messages, Profile, Auth)
│   │   ├── redux/              # Redux Toolkit slices (chat, posts, followers, users)
│   │   ├── services/           # Axios API client, socketService
│   │   └── index.css           # Tailwind design tokens & custom keyframes
│   └── package.json
│
├── server/                     # Backend REST API & WebSocket Server
│   ├── src/
│   │   ├── config/             # Database connection & Cloudinary setup
│   │   ├── features/           # Modular Domain Architecture
│   │   │   ├── chat/           # Real-time conversations & direct messages
│   │   │   ├── comments/       # Nested comments & reply threads
│   │   │   ├── followers/      # Follow graph, requests, and activity
│   │   │   ├── likes/          # Polymorphic like system (Posts, Stories, Comments)
│   │   │   ├── posts/          # Feed posts, saved posts, video processing
│   │   │   ├── stories/        # 24-hour ephemeral stories & replies
│   │   │   └── user/           # Auth, profile data, avatars, password reset
│   │   ├── middlewares/        # JWT auth, security rate limiters, file uploads
│   │   ├── socket/             # Socket.IO rooms, events, typing, and presence
│   │   └── utils/              # Error handlers, email templates
│   ├── server.js               # HTTP & Socket.IO server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local MongoDB instance or Atlas URI)
- **Cloudinary Account** (for media storage)

---

### 1. Clone the Repository
```bash
git clone https://github.com/ParmodKumar28/Instagram.git
cd Instagram
```

---

### 2. Configure Environment Variables

Create `.env` in the `server/` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/instagram
JWT_Secret=your_strong_jwt_secret_key
JWT_Expire=7d

# Cloudinary Storage
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Optional for Password Reset)
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

Create `.env` in the `client/` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

---

### 3. Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

---

### 4. Run Locally

From the `server/` directory, launch both backend and frontend concurrently:
```bash
cd server
npm run dev
```

Or start them individually in two separate terminals:

```bash
# Terminal 1: Backend Server (http://localhost:8000)
cd server
npm run server

# Terminal 2: Frontend Client (http://localhost:5173)
cd client
npm run dev
```

---

## 📡 API Reference Overview

### 🔐 Authentication & Users (`/api/user`)
| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/api/user/signup` | Register new account | 100 / 15m |
| `POST` | `/api/user/signin` | Log in and receive JWT | 100 / 15m |
| `POST` | `/api/user/forgotPassword` | Request password reset code | 100 / 15m |
| `POST` | `/api/user/resetPassword` | Verify code and set new password | 100 / 15m |
| `GET` | `/api/user/user-data` | Fetch logged-in user profile | Global |
| `PUT` | `/api/user/update-user` | Update bio, profile pic, gender | Global |

### 💬 Messages & Chat (`/api/chat`, `/api/message`)
| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/api/chat/conversations` | Get user's conversation list | Global |
| `GET` | `/api/chat/messages/:id` | Get message history & mark seen | Global |
| `POST` | `/api/chat/send` | Send text or media message | 300 / 15m |
| `DELETE`| `/api/chat/message/:id` | Unsend / delete message | Global |

### 📸 Posts & Reels (`/api/post`)
| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/api/post/all-posts` | Fetch feed posts (privacy filtered) | Global |
| `GET` | `/api/post/reels` | Fetch video reels feed | Global |
| `POST` | `/api/post/create-post` | Create new photo/video post | 300 / 15m |
| `POST` | `/api/post/save/:id` | Bookmark / save post | Global |
| `DELETE`| `/api/post/delete-post/:id` | Delete post (owner only) | Global |

### 📖 Stories (`/api/story`)
| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/api/story/feed` | Get active 24h stories from following | Global |
| `POST` | `/api/story/create` | Upload new photo or video story | 300 / 15m |
| `POST` | `/api/story/like/:id` | Like / unlike story | Global |
| `POST` | `/api/story/reply/:id` | Reply directly to story | 300 / 15m |

---

## 👨‍💻 Author

**Parmod Kumar**
- GitHub: [@ParmodKumar28](https://github.com/ParmodKumar28)

---

## 📄 License

This project is licensed under the ISC License.
