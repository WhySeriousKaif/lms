# API Request Flow - Complete Journey

## 🔄 Complete Request Flow: Registration Example

This document traces a complete user registration request from the client to the database and back.

---

## 📍 Step-by-Step Flow

### Step 1: Client Sends Request

**Client Code (Frontend/Postman):**
```javascript
POST http://localhost:8000/api/v1/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**What happens:**
- HTTP POST request sent to server
- JSON body contains user data
- Headers include content-type

---

### Step 2: Server Receives Request (`server.ts`)

```typescript
// server.ts
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
```

**What happens:**
- Express server is listening on port 8000
- Request arrives at the server
- Express starts processing the request

---

### Step 3: Express App Configuration (`app.ts`)

```typescript
// app.ts - Middleware Stack (executes in order)

// 1. Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
// ✅ Parses JSON body → req.body = { name, email, password }

// 2. URL Encoded Parser
app.use(express.urlencoded({ extended: true }));
// ✅ Parses form data if any

// 3. Cookie Parser
app.use(cookieParser());
// ✅ Parses cookies → req.cookies

// 4. CORS Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
// ✅ Allows requests from frontend
// ✅ Sets CORS headers in response

// 5. Routes
app.use('/api/v1/', userRoutes);
// ✅ Matches /api/v1/register → routes to userRoutes
```

**What happens:**
1. Request body is parsed from JSON string to JavaScript object
2. CORS headers are added to allow cross-origin requests
3. Request is routed to `/api/v1/` prefix
4. Express matches the route pattern

---

### Step 4: Route Matching (`routes/user.route.ts`)

```typescript
// routes/user.route.ts
const router = express.Router();

router.post('/register', registerUser);
// ✅ POST /api/v1/register → calls registerUser controller
```

**What happens:**
- Express matches `POST /api/v1/register`
- Route handler `registerUser` is identified
- Request is passed to the controller

---

### Step 5: Controller Execution (`controllers/user.controller.ts`)

```typescript
// controllers/user.controller.ts

export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // req.body now contains: { name, email, password }
    
    // Step 5.1: Input Validation
    const { name, email, password } = req.body as RegisterUserBody;
    
    if (!name || !email || !password) {
      return next(new ErrorHandler('All fields are required', 400));
      // ✅ Error passed to error middleware
    }
    
    // Step 5.2: Check if User Exists
    const userExists = await userModel.findOne({ email });
    // ✅ Database query executed
    
    if (userExists) {
      return next(new ErrorHandler('User already exists', 400));
    }
    
    // Step 5.3: Create New User
    const user = await userModel.create({
      name,
      email,
      password, // Will be hashed by pre-save hook
    });
    // ✅ Triggers Mongoose pre-save hook
    // ✅ Password is hashed before saving
    // ✅ User document saved to MongoDB
    
    // Step 5.4: Generate Activation Token
    const activationData = createActivationToken(user);
    // ✅ JWT token created
    // ✅ 6-digit activation code generated
    
    // Step 5.5: Send Activation Email (Non-blocking)
    sendMail({
      email: user.email,
      subject: 'Activate your account',
      template: 'activation-mail.ejs',
      data: {
        user: user.name,
        activationCode: activationData.activationCode,
      },
    }).catch((error) => {
      console.error('Failed to send activation email:', error.message);
      // ✅ Email error doesn't block registration
    });
    
    // Step 5.6: Send Success Response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for activation',
      activationCode: activationData.activationCode,
    });
    // ✅ Response sent to client
  }
);
```

**Detailed Breakdown:**

#### 5.1: Input Validation
```typescript
if (!name || !email || !password) {
  return next(new ErrorHandler('All fields are required', 400));
}
```
- Checks if required fields are present
- If missing, creates ErrorHandler instance
- Passes to error middleware via `next()`

#### 5.2: Duplicate Check
```typescript
const userExists = await userModel.findOne({ email });
```
**Behind the scenes:**
- Mongoose converts to MongoDB query: `db.users.findOne({ email: "john@example.com" })`
- MongoDB searches the `users` collection
- Returns document if found, null if not

#### 5.3: User Creation
```typescript
const user = await userModel.create({ name, email, password });
```

**What happens internally:**

1. **Mongoose Validation:**
```typescript
// From user.model.ts
name: {
  type: String,
  required: [true, 'Name is required'],
  minlength: [3, 'Name must be at least 3 characters long'],
  maxlength: [30, 'Name must be at most 30 characters long'],
}
```
- Validates name length (3-30 characters)
- Validates email format with regex
- Validates password length (8-32 characters)

2. **Pre-Save Hook Execution:**
```typescript
// From user.model.ts
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // Skip if password unchanged
  }
  
  // Hash password with bcrypt
  this.password = await bcrypt.hash(this.password, 10);
  // ✅ "securepass123" → "$2a$10$hashed...string"
});
```
- Checks if password was modified
- Hashes password using bcrypt (10 salt rounds)
- Replaces plain password with hash

3. **Database Insert:**
```typescript
// Mongoose converts to:
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$hashed...", // Hashed, not plain text
  role: "user", // Default value
  isVerified: false, // Default value
  courses: [], // Default empty array
  createdAt: new Date(), // Auto-added by timestamps
  updatedAt: new Date(), // Auto-added by timestamps
})
```
- Document inserted into MongoDB
- `_id` automatically generated
- Timestamps added automatically

#### 5.4: Activation Token Generation
```typescript
const activationData = createActivationToken(user);

// Inside createActivationToken:
const activationCode = Math.floor(100000 + Math.random() * 900000);
// ✅ Generates random 6-digit number (100000-999999)

const token = jwt.sign(
  {
    userId: user._id,
    activationCode,
  },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
);
// ✅ Creates JWT token with user ID and activation code
// ✅ Token expires in 5 minutes
```

**JWT Token Structure:**
```
Header.Payload.Signature

Payload contains:
{
  userId: "507f1f77bcf86cd799439011",
  activationCode: 894736,
  iat: 1234567890,  // Issued at
  exp: 1234568190   // Expires at (5 min later)
}
```

#### 5.5: Email Sending (Non-Blocking)
```typescript
sendMail({...}).catch((error) => {
  console.error('Failed to send activation email:', error.message);
});
```

**Email Sending Flow:**

1. **SMTP Configuration Check:**
```typescript
// From sendMail.ts
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || 
    !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.warn('⚠️  SMTP credentials not configured');
  return; // Skip email sending
}
```

2. **Create Email Transporter:**
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'your-email@gmail.com',
    pass: 'app-password',
  },
});
```

3. **Verify Connection:**
```typescript
await transporter.verify();
// ✅ Tests SMTP connection
// ✅ Validates credentials
```

4. **Render Email Template:**
```typescript
const templatePath = path.join(__dirname, '../mails/activation-mail.ejs');
const html = await ejs.renderFile(templatePath, {
  user: "John Doe",
  activationCode: 894736,
});
// ✅ EJS template rendered with data
// ✅ HTML email generated
```

5. **Send Email:**
```typescript
await transporter.sendMail({
  from: '"LMS Support" <your-email@gmail.com>',
  to: 'john@example.com',
  subject: 'Activate your account',
  html: '<html>...</html>', // Rendered template
});
// ✅ Email sent via SMTP
// ✅ Non-blocking (doesn't wait for delivery)
```

#### 5.6: Response Sent
```typescript
res.status(201).json({
  success: true,
  message: 'User registered successfully...',
  activationCode: 894736,
});
```

**Response Structure:**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "User registered successfully. Please check your email for activation",
  "activationCode": 894736
}
```

---

### Step 6: Error Handling (If Any Error Occurs)

If an error occurs at any step:

```typescript
// catchAsyncError wrapper catches the error
catchAsyncError(async (req, res, next) => {
  // If error thrown here...
}).catch(next); // ✅ Automatically calls next(error)

// Error passed to error middleware
const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'CastError') {
    // MongoDB invalid ID
  }
  if (err.code === 11000) {
    // Duplicate key error
  }
  
  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
```

---

## 🔍 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT                                                    │
│    POST /api/v1/register                                     │
│    Body: { name, email, password }                           │
└────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EXPRESS SERVER (server.ts)                               │
│    - Receives HTTP request                                   │
│    - Starts request processing                              │
└────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE STACK (app.ts)                                │
│    ├─ express.json()        → Parse JSON body               │
│    ├─ cors()                → Add CORS headers              │
│    ├─ cookieParser()        → Parse cookies                 │
│    └─ Routes                → Match route pattern           │
└────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ROUTE HANDLER (user.route.ts)                            │
│    POST /register → registerUser controller                 │
└────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CONTROLLER (user.controller.ts)                          │
│    ├─ Validate input                                        │
│    ├─ Check duplicate email                                 │
│    │   └─ MongoDB Query: findOne({ email })                 │
│    ├─ Create user                                           │
│    │   ├─ Mongoose Validation                               │
│    │   ├─ Pre-save Hook → Hash Password                     │
│    │   └─ MongoDB Insert                                    │
│    ├─ Generate JWT Token                                    │
│    ├─ Send Email (async, non-blocking)                      │
│    │   ├─ Check SMTP config                                 │
│    │   ├─ Create transporter                                │
│    │   ├─ Render EJS template                               │
│    │   └─ Send via SMTP                                    │
│    └─ Send Response                                         │
└────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. RESPONSE                                                 │
│    Status: 201 Created                                      │
│    Body: { success, message, activationCode }              │
└────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. CLIENT RECEIVES RESPONSE                                 │
│    - User registered successfully                           │
│    - Activation code received                              │
│    - Email sent (if SMTP configured)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Operations Flow

### MongoDB Operations During Registration

1. **Check Duplicate:**
```javascript
// MongoDB Query
db.users.findOne({ email: "john@example.com" })
// Returns: null (not found) or document (found)
```

2. **Insert New User:**
```javascript
// MongoDB Insert
db.users.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMye...", // Hashed
  role: "user",
  isVerified: false,
  courses: [],
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
})
```

---

## 🔐 Security Flow

### Password Hashing Journey

```
User Input: "securepass123"
       │
       ▼
┌──────────────────┐
│ Pre-save Hook    │
│ (Mongoose)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ bcrypt.hash()    │
│ Salt Rounds: 10  │
└────────┬─────────┘
         │
         ▼
Hashed: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
       │
       ▼
Stored in MongoDB
```

### JWT Token Flow

```
User Created
       │
       ▼
┌──────────────────┐
│ JWT Sign         │
│ Payload:         │
│ - userId         │
│ - activationCode │
│ Expires: 5 min   │
└────────┬─────────┘
         │
         ▼
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       │
       ▼
Returned in Response (for future use)
```

---

## 📧 Email Flow

### Email Sending Process

```
Registration Success
       │
       ▼
┌──────────────────┐
│ sendMail()       │
│ Called           │
└────────┬─────────┘
         │
         ├─ Check SMTP Config
         │  └─ If missing → Skip, log warning
         │
         ├─ Create Transporter
         │  └─ Nodemailer SMTP config
         │
         ├─ Verify Connection
         │  └─ Test SMTP auth
         │
         ├─ Render Template
         │  └─ EJS: activation-mail.ejs
         │  └─ Data: { user, activationCode }
         │
         └─ Send Email
            └─ SMTP: Gmail server
            └─ To: user.email
            └─ Subject: "Activate your account"
```

**Email Template Rendering:**
```ejs
<!-- activation-mail.ejs -->
<h1>Welcome <%= user %>!</h1>
<p>Your activation code is: <%= activationCode %></p>
```

**Rendered HTML:**
```html
<h1>Welcome John Doe!</h1>
<p>Your activation code is: 894736</p>
```

---

## ⚡ Performance Considerations

### Non-Blocking Operations

1. **Email Sending:**
   - Doesn't wait for email delivery
   - User gets response immediately
   - Email errors logged but don't fail request

2. **Database Operations:**
   - All database calls are async/await
   - Non-blocking I/O operations
   - Connection pooling handled by Mongoose

3. **Error Handling:**
   - Errors caught and handled gracefully
   - User always gets a response
   - Errors logged for debugging

---

## 📝 Summary

**Complete Request Journey:**
1. Client sends POST request with user data
2. Express parses request through middleware
3. Route matches and calls controller
4. Controller validates, checks duplicates
5. User created with hashed password
6. Activation token generated
7. Email sent (non-blocking)
8. Success response returned

**Key Points:**
- ✅ All operations are asynchronous
- ✅ Errors are handled gracefully
- ✅ Security: passwords hashed, JWT tokens
- ✅ Non-blocking email sending
- ✅ Proper error responses

This architecture ensures fast, secure, and reliable user registration!

