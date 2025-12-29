# System Architecture

## 🏗️ Architecture Overview

This document explains the architecture, design patterns, and folder structure of the LMS backend.

## 📂 Folder Structure & Responsibilities

### Entry Points

#### `server.ts` - Application Entry Point
```typescript
import { app } from './app';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // Connect to MongoDB
});
```

**What happens here:**
1. Loads environment variables from `.env` file
2. Starts the Express server on specified port
3. Connects to MongoDB database
4. Server is now ready to accept requests

---

#### `app.ts` - Express Application Configuration
```typescript
export const app = express();

// Middleware Stack
app.use(express.json({ limit: '50mb' }));        // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(cookieParser());                          // Parse cookies
app.use(cors({ origin: process.env.CLIENT_URL })); // CORS configuration

// Routes
app.use('/api/v1/', userRoutes);                 // API routes

// Error Handling
app.use(errorMiddleware);                         // Global error handler
```

**Middleware Order Matters:**
1. **Body Parsers** - Must come first to parse request bodies
2. **CORS** - Handles cross-origin requests
3. **Routes** - Handle specific endpoints
4. **Error Handler** - Must be last to catch all errors

---

## 🎯 Design Patterns Used

### 1. MVC (Model-View-Controller) Pattern

```
Request → Route → Controller → Model → Database
                ↓
            Response
```

#### **Routes** (`routes/user.route.ts`)
```typescript
const router = express.Router();
router.post('/register', registerUser);
```
- Defines URL endpoints
- Maps URLs to controller functions
- Minimal logic, just routing

#### **Controllers** (`controllers/user.controller.ts`)
```typescript
export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Business logic here
    const user = await userModel.create({ name, email, password });
    // Send response
  }
);
```
- Contains business logic
- Handles request/response
- Calls models for data operations

#### **Models** (`models/user.model.ts`)
```typescript
const userModel = model<IUser>('User', userSchema);
```
- Defines data structure
- Database operations
- Validation rules

---

### 2. Middleware Pattern

Middleware functions execute in sequence, modifying requests/responses.

#### **Custom Middleware Examples:**

**Error Handling Middleware:**
```typescript
const errorMiddleware = (err, req, res, next) => {
  // Centralized error handling
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
```

**Async Error Wrapper:**
```typescript
export const catchAsyncError = (theFunc) => 
  (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };
```
- Wraps async functions
- Automatically catches errors
- Passes errors to error middleware

---

### 3. Utility Pattern

Reusable functions organized in `utils/` folder:

#### `utils/db.ts` - Database Connection
```typescript
export const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};
```

#### `utils/ErrorHandler.ts` - Custom Error Class
```typescript
class ErrorHandler extends Error {
  statusCode: number;
  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

#### `utils/sendMail.ts` - Email Service
```typescript
const sendMail = async (options: EmailOptions) => {
  // SMTP configuration
  // Template rendering
  // Email sending
};
```

---

## 🔄 Request Flow Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐
│   Express App   │
│    (app.ts)     │
└──────┬──────────┘
       │
       ├──► Middleware Stack
       │    ├── Body Parser
       │    ├── CORS
       │    └── Cookie Parser
       │
       ▼
┌─────────────────┐
│     Routes      │
│ (user.route.ts) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Controllers   │
│(user.controller)│
└──────┬──────────┘
       │
       ├──► Models (Mongoose)
       │    └──► MongoDB
       │
       ├──► Utils (sendMail, etc.)
       │
       ▼
┌─────────────────┐
│   Response      │
│  (JSON/Error)   │
└─────────────────┘
```

---

## 🗄️ Database Architecture

### Mongoose Schema Structure

```typescript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, select: false }, // Hidden by default
  // ... other fields
}, { timestamps: true }); // Auto-adds createdAt, updatedAt
```

### Schema Features:
- **Validation** - Built-in and custom validators
- **Hooks** - Pre/post save hooks for password hashing
- **Methods** - Instance methods like `comparePassword()`
- **Indexes** - Unique indexes on email

---

## 🔐 Security Architecture

### Password Security Flow

```
User Input Password
       │
       ▼
┌──────────────┐
│ Pre-save Hook│ (Mongoose Middleware)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   bcrypt     │ (Hashing with salt rounds: 10)
└──────┬───────┘
       │
       ▼
Hashed Password Stored in DB
```

### JWT Token Architecture

```
User Registration
       │
       ▼
┌──────────────┐
│ Generate JWT │
│  (5 min exp) │
└──────┬───────┘
       │
       ├──► Token (stored in response)
       └──► Activation Code (6 digits)
```

---

## 📧 Email Architecture

### Email Sending Flow

```
Registration Request
       │
       ▼
┌──────────────┐
│ Generate     │
│ Activation   │
│   Data       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  sendMail()  │
│   Utility    │
└──────┬───────┘
       │
       ├──► Check SMTP Config
       ├──► Create Transporter
       ├──► Render EJS Template
       └──► Send Email
```

### Non-Blocking Email
- Email sending doesn't block user registration
- Errors are logged but don't fail the request
- User gets response immediately

---

## 🛡️ Error Handling Architecture

### Error Flow

```
Any Error Occurs
       │
       ▼
┌──────────────┐
│ catchAsync   │ (Catches async errors)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ ErrorHandler │ (Custom error class)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ errorMiddleware│ (Global handler)
└──────┬───────┘
       │
       ▼
JSON Error Response
```

### Error Types Handled:
- **Validation Errors** - Mongoose validation
- **Duplicate Keys** - MongoDB duplicate key errors
- **JWT Errors** - Invalid/expired tokens
- **Cast Errors** - Invalid MongoDB IDs

---

## 🔧 Configuration Architecture

### Environment Variables

All configuration is externalized using `.env`:

```env
PORT=8000                    # Server port
MONGODB_URI=...              # Database connection
JWT_SECRET=...               # Token signing key
SMTP_HOST=...                # Email server
```

### Why This Pattern?
- **Security** - Secrets not in code
- **Flexibility** - Different configs for dev/prod
- **Version Control** - `.env` in `.gitignore`

---

## 📦 Module Organization

### Separation of Concerns

```
controllers/  → Business Logic
models/       → Data Layer
routes/       → URL Mapping
middleware/   → Request Processing
utils/        → Reusable Functions
mails/        → Email Templates
```

Each module has a single responsibility, making the code:
- **Maintainable** - Easy to find and modify
- **Testable** - Can test each part independently
- **Scalable** - Easy to add new features

---

## 🚀 Scalability Considerations

### Current Architecture Supports:
- ✅ Adding new routes easily
- ✅ Adding new models
- ✅ Adding new middleware
- ✅ Horizontal scaling (stateless)
- ✅ Database connection pooling (Mongoose)

### Future Enhancements:
- Add Redis caching layer
- Add authentication middleware
- Add rate limiting
- Add request logging
- Add API versioning

---

## 📝 Summary

This architecture follows:
- **Separation of Concerns** - Each file has one job
- **DRY Principle** - Reusable utilities
- **Error Handling** - Centralized error management
- **Security First** - Password hashing, JWT, validation
- **Scalability** - Easy to extend and maintain

