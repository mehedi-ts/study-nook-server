# StudyNook – Backend API

StudyNook is a secure and scalable full-stack backend system for a study room booking platform. It handles room listings, user authentication, booking management, and conflict-free scheduling using JWT-based security and MongoDB.

---

## 🚀 Live link : https://study-nook-rouge.vercel.app/


---

## 📌 Project Overview

StudyNook Backend powers a room booking system where:

- Users can register and login securely
- Room owners can create and manage study rooms
- Students can browse, search, and book available rooms
- System prevents **double booking using time conflict detection**
- Each user has a personal dashboard for managing bookings
- JWT authentication is stored in **HTTP-only cookies** for security

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication (HTTP-only cookies)**
- **CORS**
- **dotenv**
- **cookie-parser**

---

## 📁 Main Features

### 🔐 Authentication
- User Registration
- User Login
- Secure JWT stored in HTTP-only cookies
- Protected routes using middleware

### 🏠 Room Management
- Create Study Rooms (Owner only)
- Update Room Details
- Delete Rooms
- Get all rooms / single room
- Search + Filter support

### 📅 Booking System
- Book a room for specific date & time
- Prevent double booking (time conflict detection)
- Cancel booking
- View user-specific bookings

### 👤 User Dashboard
- My Bookings
- My Created Rooms (for owners)

---

## 📦 API Endpoints

### Auth Routes