# Code CrazeHub - Blog Application

Welcome to **Code CrazeHub**, a sleek, modern, and feature-rich blog application designed for developers and tech enthusiasts to share knowledge, ask questions, and interact with a thriving community.

## 🚀 Features

### 1. **Robust Authentication**

- **Secure Sign-In/Up**: Powered by Firebase Authentication.
- **User Profiles**: Personalized profiles that store your username and display your initials as high-contrast avatars.
- **Persistent Sessions**: Stay logged in across page refreshes with Firestore-backed user data.

### 2. **Dynamic Blog Management**

- **Write & Ask**: Create blog posts with titles, categories, images, and detailed descriptions.
- **Rich Content**: Support for image uploads and multi-column layouts.
- **Auto-Navigation**: Seamless redirection after saving or canceling your work.

### 3. **Interactive Comment System**

- **Community Engagement**: Share your thoughts on any blog post.
- **Like/Dislike Voting**: Upvote or downvote comments to highlight the best content.
- **Real-Time Updates**: See comment counts and votes refresh instantly.
- **Persistence**: Your comments and votes are safely stored in Firebase Firestore.

### 4. **Smart Real-Time Search**

- **Dynamic Filtering**: Instantly search for blogs on the landing page.
- **Full-Text Matching**: Filters by both **headings** and **descriptions** as you type.

### 5. **Premium Responsive UI**

- **Modern Aesthetics**: Built with a curated color palette (#12372A, #ADBC9F, #FBFADA).
- **Sticky Navbar**: A robust, high-z-index navigation bar that stays accessible while you scroll.
- **DaisyUI & Tailwind**: Leverages modern CSS frameworks for a polished, responsive experience on mobile and desktop.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS (ES6+), JavaScript Modules.
- **Backend & Database**:
  - Firebase Authentication
  - Cloud Firestore (Real-time Database)
  - Firebase Storage (Media Assets)
- **Styling**: Tailwind CSS CDN, DaisyUI, FontAwesome 6.

## ⚙️ Setup & Installation

1. **Clone the Project**:
   ```bash
   git clone https://github.com/RaeezAli/Code-Craze-Blog-App.git
   ```
2. **Configuration**:
   Ensure your `firebase.js` is correctly configured with your Firebase Project credentials.
3. **Run Locally**:
   Simply open `public/index.html` in your browser (preferably through a local server like Live Server).

## 📄 License

This project is part of the Saylani Web Development course.

---

_Built with ❤️ by Muhammad Ali._
