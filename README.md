# Virtual Deal Room - MERN Stack Developer Assignment

Welcome to the **Virtual Deal Room** project! This platform simulates secure business transactions between buyers and sellers, allowing real-time negotiation, secure document exchange, and deal finalization. Built using the **MERN Stack** with real-time features and scalable deployment.

---

## 📌 Objective

Develop a **Virtual Deal Room** platform where:
- Buyers and sellers can **negotiate deals in real-time**
- Securely **upload documents**
- **Finalize transactions** with optional payment integration

---

## 🚀 Features & Requirements

### ✅ Part 1: Core Features

#### 1. User Management & Authentication
- JWT-based authentication
- Roles:
  - **Buyer**: Can create and negotiate deals
  - **Seller**: Can accept or reject deals

#### 2. Secure Deal Creation & Negotiation
- Deal creation fields: `Title`, `Description`, `Price`
- Deal status: `Pending`, `In Progress`, `Completed`, `Cancelled`
- Real-time negotiation using **Socket.io**

#### 3. Real-time Chat & Notifications
- One-to-one instant messaging inside deal rooms
- Typing indicators
- Read receipts
- Live notifications for:
  - New messages
  - Deal updates
  - New deals

---

### ⚙️ Part 2: Advanced Features

#### 1. Secure Document Upload & Storage
- Upload support: `PDF`, `DOCX`, `PNG`
- Document access control (Buyers can restrict access)

#### 2. Performance Optimization with Redis
- Cache active deals and frequently accessed messages
- Store user sessions in Redis for faster auth flow

#### 3. Analytics Dashboard
- Admin panel with visual stats:
  - Completed vs Pending deals
  - User activity tracking
- Built with **Chart.js** or **Recharts**

---

### ☁️ Deployment

- Frontend & Backend deployed via **Google Cloud Run**
- **MongoDB Atlas** for cloud-hosted database

---

### 💳 Bonus: Payment Integration (Optional)
- Integrate **Stripe** or **Razorpay** for secure transactions between buyers and sellers

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS (optional)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io
- **Caching**: Redis
- **Deployment**: Google Cloud Run
- **Charts**: Chart.js / Recharts
- **Authentication**: JWT

---

## 🧑‍💻 Developer Notes

- Ensure secure handling of JWT and document access permissions
- Use environment variables for credentials and secrets
- Follow modular code structure (controllers, services, routes, etc.)
- Optimize for scalability and performance

---

## 📫 Connect with Us

📄 **LinkedIn**: [Follow VertxAI on LinkedIn](https://www.linkedin.com/company/govertx/?viewAsMember=true)

---

## 📁 Folder Structure (Suggested)

