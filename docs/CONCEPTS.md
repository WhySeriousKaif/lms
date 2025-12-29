# Core Concepts Explained

## 📚 Detailed Explanation of All Concepts

This document explains every concept, technology, and pattern used in the LMS backend with code examples and explanations.

---

## 1. 🚀 Express.js & Node.js

### What is Express.js?

Express.js is a minimal web framework for Node.js that simplifies building web servers and APIs.

**Why Express?**
- Fast and lightweight
- Large ecosystem
- Easy routing
- Middleware support
- Great for REST APIs

### Basic Express Server

```typescript
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**What happens:**
- `express()` creates an Express application
- `app.get()` defines a route handler
- `req` = request object (incoming data)
- `res` = response object (outgoing data)
- `app.listen()` starts the server

---

## 2. 🔄 Middleware

### What is Middleware?

Middleware functions are functions that have access to the request (`req`), response (`res`), and `next` function. They execute in sequence and can modify the request/response.

### Middleware Execution Order

```typescript
app.use(middleware1);  // Executes first
app.use(middleware2);  // Executes second
app.use(middleware3);  // Executes third
```

### Built-in Middleware Examples

#### **express.json()** - Parse JSON Bodies
```typescript
app.use(express.json());

// Before: req.body = undefined
// After:  req.body = { name: "John", email: "john@example.com" }
```

**What it does:**
- Parses incoming JSON strings
- Converts to JavaScript objects
- Makes data available in `req.body`

**Example:**
```typescript
// Client sends:
POST /register
Content-Type: application/json
{"name": "John", "email": "john@example.com"}

// After express.json() middleware:
req.body = {
  name: "John",
  email: "john@example.com"
}
```

#### **express.urlencoded()** - Parse Form Data
```typescript
app.use(express.urlencoded({ extended: true }));

// Parses: name=John&email=john@example.com
// Into:   { name: "John", email: "john@example.com" }
```

#### **cors()** - Cross-Origin Resource Sharing
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

**What it does:**
- Allows requests from different origins (domains)
- Adds CORS headers to responses
- Prevents browser blocking cross-origin requests

**Why needed:**
- Frontend (localhost:3000) → Backend (localhost:8000)
- Different ports = different origins
- Browser blocks by default without CORS

#### **cookieParser()** - Parse Cookies
```typescript
app.use(cookieParser());

// Makes cookies available in req.cookies
// Example: req.cookies.token = "jwt-token-here"
```

---

## 3. 🗄️ MongoDB & Mongoose

### What is MongoDB?

MongoDB is a NoSQL database that stores data in JSON-like documents.

**Why MongoDB?**
- Flexible schema
- Easy to scale
- JSON-like structure
- Great for Node.js

### What is Mongoose?

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.

**Why Mongoose?**
- Schema validation
- Type casting
- Middleware (hooks)
- Easy queries
- Relationships

### MongoDB Connection

```typescript
// utils/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};
```

**What happens:**
- `mongoose.connect()` establishes connection
- Connection string format: `mongodb://host:port/database`
- Mongoose manages connection pool automatically

### Mongoose Schema

```typescript
// models/user.model.ts
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [30, 'Name must be at most 30 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true, // Creates unique index
    validate: {
      validator: function(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Please enter a valid email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't return password by default
  },
}, { timestamps: true }); // Auto-adds createdAt, updatedAt
```

**Schema Features Explained:**

1. **Type Validation:**
```typescript
type: String  // Only strings allowed
```

2. **Required Fields:**
```typescript
required: [true, 'Error message']
// Throws error if field is missing
```

3. **Custom Validators:**
```typescript
validate: {
  validator: function(value) {
    return emailRegex.test(value);
  },
  message: 'Custom error message',
}
```

4. **Unique Index:**
```typescript
unique: true
// Creates database index
// Prevents duplicate values
```

5. **Select: false:**
```typescript
select: false
// Password not returned in queries by default
// Must explicitly select: userModel.findOne().select('+password')
```

6. **Timestamps:**
```typescript
{ timestamps: true }
// Automatically adds:
// - createdAt: Date
// - updatedAt: Date
```

### Mongoose Hooks (Middleware)

#### Pre-Save Hook

```typescript
userSchema.pre('save', async function () {
  // 'this' refers to the document being saved
  if (!this.isModified('password')) {
    return; // Skip if password unchanged
  }
  
  // Hash password before saving
  this.password = await bcrypt.hash(this.password, 10);
});
```

**When it executes:**
- Before document is saved to database
- Only if password field was modified
- Automatically hashes password

**Flow:**
```
User.create({ password: "plaintext" })
       │
       ▼
Pre-save hook executes
       │
       ▼
Password hashed: "$2a$10$hashed..."
       │
       ▼
Document saved to MongoDB
```

### Mongoose Methods

```typescript
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Usage:
const user = await userModel.findOne({ email });
const isMatch = await user.comparePassword('inputPassword');
```

**What it does:**
- Instance method on user documents
- Compares plain password with hashed password
- Returns true/false

---

## 4. 🔐 Password Security with bcrypt

### What is bcrypt?

bcrypt is a password hashing function that uses a salt to protect against rainbow table attacks.

### Why Hash Passwords?

**Never store plain passwords!**

```
❌ Bad: password: "mypassword123"  (stored as-is)
✅ Good: password: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."  (hashed)
```

**Benefits:**
- Even if database is compromised, passwords are safe
- One-way hashing (can't reverse)
- Salt prevents rainbow table attacks

### How bcrypt Works

```typescript
import bcrypt from 'bcryptjs';

// Hashing
const saltRounds = 10;
const hashedPassword = await bcrypt.hash('plainpassword', saltRounds);
// Result: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// Verifying
const isMatch = await bcrypt.compare('plainpassword', hashedPassword);
// Returns: true or false
```

**Salt Rounds Explained:**
- Higher = more secure but slower
- 10 rounds = good balance
- Each round = 2^rounds iterations

**Hash Structure:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMye...
│  │  │
│  │  └─ Salt (22 chars)
│  └─ Rounds (10)
└─ Algorithm (2a = bcrypt)
```

### Implementation in Our Code

```typescript
// Pre-save hook automatically hashes password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare method verifies password
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
```

---

## 5. 🎫 JWT (JSON Web Tokens)

### What is JWT?

JWT is a compact, URL-safe token format for securely transmitting information between parties.

### JWT Structure

```
Header.Payload.Signature

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJhY3RpdmF0aW9uQ29kZSI6ODk0NzM2LCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDMwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Parts:**

1. **Header:**
```json
{
  "alg": "HS256",  // Algorithm
  "typ": "JWT"     // Type
}
```

2. **Payload:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "activationCode": 894736,
  "iat": 1600000000,  // Issued at
  "exp": 1600000300   // Expires at
}
```

3. **Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Creating JWT Tokens

```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    userId: user._id,
    activationCode: 894736,
  },
  process.env.JWT_SECRET,  // Secret key
  { expiresIn: '5m' }          // Expiration
);
```

**What happens:**
- Payload data is encoded
- Signed with secret key
- Expiration time added
- Returns token string

### Verifying JWT Tokens

```typescript
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded = { userId: "...", activationCode: 894736, iat: ..., exp: ... }
} catch (error) {
  // Token invalid or expired
}
```

### Why JWT?

- **Stateless:** No need to store sessions
- **Secure:** Signed with secret key
- **Compact:** Small size
- **Self-contained:** All info in token

### Use Cases in Our Code

1. **Activation Tokens:**
```typescript
const token = jwt.sign(
  { userId: user._id, activationCode: 894736 },
  JWT_SECRET,
  { expiresIn: '5m' }
);
```

2. **Future: Authentication Tokens:**
```typescript
// After login
const token = jwt.sign(
  { userId: user._id },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

## 6. 📧 Email Sending with Nodemailer

### What is Nodemailer?

Nodemailer is a module for Node.js to send emails easily.

### SMTP Configuration

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',      // SMTP server
  port: 587,                    // Port (587 for TLS, 465 for SSL)
  secure: false,                // true for 465, false for other ports
  auth: {
    user: 'your-email@gmail.com',
    pass: 'app-password',       // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // For development
  },
});
```

### Sending Email

```typescript
await transporter.sendMail({
  from: '"LMS Support" <your-email@gmail.com>',
  to: 'user@example.com',
  subject: 'Activate your account',
  html: '<h1>Welcome!</h1><p>Your code is 894736</p>',
});
```

### Template Rendering with EJS

```typescript
import ejs from 'ejs';

const html = await ejs.renderFile(
  path.join(__dirname, '../mails/activation-mail.ejs'),
  {
    user: 'John Doe',
    activationCode: 894736,
  }
);
```

**Template (activation-mail.ejs):**
```ejs
<h1>Welcome <%= user %>!</h1>
<p>Your activation code is: <strong><%= activationCode %></strong></p>
```

**Rendered HTML:**
```html
<h1>Welcome John Doe!</h1>
<p>Your activation code is: <strong>894736</strong></p>
```

### Gmail App Password Setup

**Why App Password?**
- Gmail requires 2FA for security
- Regular password won't work
- App Password is specific to apps

**Steps:**
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use generated password in SMTP_PASSWORD

---

## 7. 🛡️ Error Handling

### Custom Error Class

```typescript
// utils/ErrorHandler.ts
class ErrorHandler extends Error {
  statusCode: number;
  
  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Why Custom Error?**
- Adds statusCode property
- Consistent error format
- Better error messages

### Async Error Wrapper

```typescript
// middleware/catchAsyncError.ts
export const catchAsyncError = (theFunc: any) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };
```

**What it does:**
- Wraps async functions
- Automatically catches errors
- Passes errors to error middleware

**Usage:**
```typescript
// Without wrapper (manual):
export const registerUser = async (req, res, next) => {
  try {
    // code
  } catch (error) {
    next(error);
  }
};

// With wrapper (automatic):
export const registerUser = catchAsyncError(async (req, res, next) => {
  // code - errors automatically caught
});
```

### Error Middleware

```typescript
// middleware/error.ts
const errorMiddleware = (err: ErrorHandler, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';
  
  // Handle specific errors
  if (err.name === 'CastError') {
    // MongoDB invalid ID
    err = new ErrorHandler('Resource not found', 400);
  }
  
  if (err.code === 11000) {
    // Duplicate key
    err = new ErrorHandler('Duplicate entry', 400);
  }
  
  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
```

**Error Flow:**
```
Error occurs
    │
    ▼
catchAsyncError catches it
    │
    ▼
next(error) called
    │
    ▼
Error middleware handles it
    │
    ▼
Error response sent
```

---

## 8. 🔄 Async/Await

### What is Async/Await?

Async/await is a modern way to handle asynchronous operations in JavaScript.

### Without Async/Await (Callbacks)

```typescript
// Old way - Callback hell
userModel.findOne({ email }, (err, user) => {
  if (err) {
    // handle error
  } else {
    userModel.create({ name, email }, (err, newUser) => {
      if (err) {
        // handle error
      } else {
        // success
      }
    });
  }
});
```

### With Async/Await

```typescript
// Modern way - Clean and readable
const user = await userModel.findOne({ email });
const newUser = await userModel.create({ name, email });
```

**Benefits:**
- Cleaner code
- Easier error handling
- More readable
- Sequential execution

### How It Works

```typescript
// async function always returns a Promise
async function getData() {
  const result = await someAsyncOperation();
  return result;
}

// await pauses execution until Promise resolves
const data = await getData();
```

### In Our Code

```typescript
export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // All these are async operations
    const userExists = await userModel.findOne({ email });
    const user = await userModel.create({ name, email, password });
    await sendMail({ email, subject, template, data });
    
    res.status(201).json({ success: true });
  }
);
```

---

## 9. 📝 TypeScript

### What is TypeScript?

TypeScript is JavaScript with type annotations. It compiles to JavaScript.

### Why TypeScript?

- **Type Safety:** Catch errors before runtime
- **Better IDE Support:** Autocomplete, refactoring
- **Documentation:** Types serve as documentation
- **Refactoring:** Easier to refactor code

### Type Annotations

```typescript
// JavaScript
function add(a, b) {
  return a + b;
}

// TypeScript
function add(a: number, b: number): number {
  return a + b;
}
```

### Interfaces

```typescript
interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;  // Optional
}

const body: RegisterUserBody = req.body;
```

### In Our Code

```typescript
// Model Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword: (password: string) => Promise<boolean>;
}

// Request Body Interface
interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
}
```

---

## 10. 🌍 Environment Variables

### What are Environment Variables?

Environment variables are configuration values stored outside the code.

### Why Use .env?

- **Security:** Secrets not in code
- **Flexibility:** Different configs for dev/prod
- **Version Control:** .env in .gitignore

### Using dotenv

```typescript
import dotenv from 'dotenv';

dotenv.config(); // Loads .env file

const port = process.env.PORT; // Access variables
```

### .env File

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
```

### Accessing Variables

```typescript
// TypeScript with type assertion
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI as string;
```

---

## 11. 🎯 Request/Response Cycle

### Complete Cycle

```
1. Client sends request
   ↓
2. Express receives request
   ↓
3. Middleware processes request
   ↓
4. Route matches URL
   ↓
5. Controller handles logic
   ↓
6. Model interacts with database
   ↓
7. Response sent to client
```

### Request Object (req)

```typescript
req.body      // Parsed request body
req.params    // URL parameters (/users/:id)
req.query     // Query string (?name=John)
req.headers   // HTTP headers
req.cookies   // Cookies
```

### Response Object (res)

```typescript
res.status(201)           // Set status code
res.json({ data })        // Send JSON response
res.send('text')          // Send text response
res.cookie('token', jwt)  // Set cookie
```

---

## 12. 🔒 Security Best Practices

### 1. Password Hashing
```typescript
// ✅ Good
this.password = await bcrypt.hash(this.password, 10);

// ❌ Bad
this.password = password; // Plain text
```

### 2. Password Selection
```typescript
// ✅ Good
password: { select: false } // Don't return by default

// ❌ Bad
password: String // Returned in queries
```

### 3. Environment Variables
```typescript
// ✅ Good
const secret = process.env.JWT_SECRET;

// ❌ Bad
const secret = 'hardcoded-secret';
```

### 4. Input Validation
```typescript
// ✅ Good
if (!name || !email || !password) {
  return next(new ErrorHandler('All fields required', 400));
}

// ❌ Bad
// No validation
```

### 5. Error Messages
```typescript
// ✅ Good
message: 'Invalid credentials' // Generic

// ❌ Bad
message: 'Password is wrong' // Too specific
```

---

## 📝 Summary

**Key Concepts:**
1. **Express.js** - Web framework for APIs
2. **Middleware** - Functions that process requests
3. **MongoDB/Mongoose** - Database and ODM
4. **bcrypt** - Password hashing
5. **JWT** - Token-based authentication
6. **Nodemailer** - Email sending
7. **Error Handling** - Centralized error management
8. **Async/Await** - Modern async programming
9. **TypeScript** - Type-safe JavaScript
10. **Environment Variables** - Configuration management

**Security:**
- Passwords hashed with bcrypt
- JWT tokens for authentication
- Input validation
- Error handling

**Architecture:**
- MVC pattern
- Separation of concerns
- Reusable utilities
- Scalable structure

This foundation supports building a complete LMS system!

