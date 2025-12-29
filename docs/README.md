# LMS Backend Documentation

## 📚 Documentation Index

This documentation is organized into multiple files for easy navigation:

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, folder structure, and design patterns
2. **[API_FLOW.md](./API_FLOW.md)** - Complete request flow from client to database
3. **[CONCEPTS.md](./CONCEPTS.md)** - Detailed explanation of all concepts with code examples

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- TypeScript
- npm or yarn

### Installation

```bash
cd server
npm install
```

### Environment Setup

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lms
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (Frontend)
CLIENT_URL=http://localhost:3000

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:8000`

## 📁 Project Structure

```
server/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── controllers/           # Request handlers
│   └── user.controller.ts
├── models/                # Mongoose schemas
│   └── user.model.ts
├── routes/                # API routes
│   └── user.route.ts
├── middleware/            # Custom middleware
│   ├── error.ts
│   └── catchAsyncError.ts
├── utils/                 # Utility functions
│   ├── db.ts
│   ├── sendMail.ts
│   ├── ErrorHandler.ts
│   └── redis.ts
├── mails/                 # Email templates
│   └── activation-mail.ejs
└── .env                   # Environment variables
```

## 🔑 Key Features

- ✅ User Registration with Email Activation
- ✅ Password Hashing with bcrypt
- ✅ JWT Token Generation
- ✅ Email Sending with Nodemailer
- ✅ Error Handling Middleware
- ✅ MongoDB Integration
- ✅ TypeScript Support
- ✅ CORS Configuration
- ✅ Input Validation

## 📖 What We've Built

### 1. User Registration System
- Complete user registration flow
- Email validation
- Password hashing
- Activation code generation
- Email notifications

### 2. Security Features
- Password encryption (bcrypt)
- JWT token generation
- Input validation
- Error handling

### 3. Email System
- SMTP configuration
- Template-based emails (EJS)
- Activation email sending
- Error handling for email failures

### 4. Database Integration
- MongoDB connection
- Mongoose ODM
- Schema validation
- Pre-save hooks

## 🎯 Next Steps

After reading this overview, explore:
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Understand the system design
2. **[API_FLOW.md](./API_FLOW.md)** - See how requests flow through the system
3. **[CONCEPTS.md](./CONCEPTS.md)** - Deep dive into each concept

## 📝 API Endpoints

### POST `/api/v1/register`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for activation",
  "activationCode": 894736
}
```

## 🛠️ Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **EJS** - Email templates
- **dotenv** - Environment variables

## 📞 Support

For detailed explanations, refer to the other documentation files in this folder.

