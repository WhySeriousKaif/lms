# API Request Body Examples

## Base URL: `http://localhost:8000/api/v1`

---

## 🔐 USER ROUTES (`/api/v1/...`)

### 1. **POST** `/register`
**No Auth Required**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

### 2. **POST** `/activate-user`
**No Auth Required**

```json
{
  "activation_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "activation_code": "123456"
}
```

---

### 3. **POST** `/login`
**No Auth Required**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### 4. **POST/GET** `/logout`
**Auth Required**

```json
// No body required
```

---

### 5. **POST/GET** `/refresh`
**Auth Required (Refresh Token)**

```json
// No body required
```

---

### 6. **GET** `/me`
**Auth Required**

```json
// No body required
```

---

### 7. **POST** `/social-auth`
**No Auth Required**

```json
{
  "email": "user@gmail.com",
  "name": "John Doe",
  "avatar": {
    "public_id": "avatars/xyz123",
    "url": "https://example.com/avatar.jpg"
  }
}
```

---

### 8. **PUT** `/update-user-info`
**Auth Required**

```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "avatar": {
    "public_id": "avatars/new123",
    "url": "https://example.com/new-avatar.jpg"
  }
}
```
*Note: All fields are optional*

---

### 9. **PUT** `/update-user-password`
**Auth Required**

```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

### 10. **PUT** `/update-avatar`
**Auth Required**

```json
{
  "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```
*Note: `avatar` should be a base64 string or data URL*

---

### 11. **GET** `/get-all-users`
**Auth Required + Admin Role**

```json
// No body required
```

---

### 12. **PUT** `/update-user-role`
**Auth Required + Admin Role**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "admin"
}
```
*Valid roles: `"admin"` or `"user"`*

---

### 13. **DELETE** `/delete-user/:userId`
**Auth Required + Admin Role**

```json
// No body required
// userId is in URL parameter
```

---

## 📚 COURSE ROUTES (`/api/v1/...`)

### 1. **POST** `/create-course`
**Auth Required + Admin Role**

```json
{
  "name": "Complete React Course",
  "description": "Learn React from scratch",
  "price": 99.99,
  "estimatedPrice": 149.99,
  "tags": "react, javascript, frontend",
  "level": "beginner",
  "demoUrl": "https://example.com/demo",
  "benefits": [
    {
      "title": "Learn React Hooks",
      "description": "Master useState, useEffect, and more"
    },
    {
      "title": "Build Real Projects",
      "description": "Create 5+ real-world applications"
    }
  ],
  "prerequisites": [
    {
      "title": "JavaScript Basics",
      "description": "Basic knowledge of JavaScript"
    }
  ],
  "courseData": [
    {
      "title": "Introduction",
      "description": "Course introduction",
      "videoUrl": "https://example.com/video1.mp4",
      "videoSection": "Section 1",
      "videoLength": 600,
      "videoPlayerUrl": "https://player.example.com/video1",
      "links": [
        {
          "title": "Resource 1",
          "url": "https://example.com/resource1"
        }
      ],
      "suggestions": "Watch this video carefully"
    }
  ],
  "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```
*Note: `thumbnail` can be base64 string or already uploaded object with `public_id` and `url`*

---

### 2. **PUT** `/edit-course/:id`
**Auth Required + Admin Role**

```json
{
  "name": "Updated Course Name",
  "description": "Updated description",
  "price": 79.99,
  "thumbnail": "data:image/png;base64,..." // Optional: only if updating thumbnail
}
```
*Note: Include only fields you want to update. `id` is in URL parameter*

---

### 3. **GET** `/get-course/:id`
**No Auth Required**

```json
// No body required
// id is in URL parameter
```

---

### 4. **GET** `/get-courses`
**No Auth Required**

```json
// No body required
```

---

### 5. **GET** `/get-course-content/:id`
**Auth Required**

```json
// No body required
// id is in URL parameter
```

---

### 6. **PUT** `/add-question`
**Auth Required**

```json
{
  "question": "What is React?",
  "courseId": "507f1f77bcf86cd799439011",
  "contentId": "507f1f77bcf86cd799439012"
}
```
*Alternative: `"questions"` field also accepted*

---

### 7. **PUT** `/add-answer`
**Auth Required**

```json
{
  "answer": "React is a JavaScript library for building user interfaces",
  "questionId": "507f1f77bcf86cd799439013",
  "courseId": "507f1f77bcf86cd799439011",
  "contentId": "507f1f77bcf86cd799439012"
}
```

---

### 8. **PUT** `/add-review/:id`
**Auth Required**

```json
{
  "review": "Great course! Very comprehensive.",
  "rating": 5
}
```
*Note: `rating` must be between 1-5. `id` (courseId) is in URL parameter*

---

### 9. **PUT** `/add-reply-to-review`
**Auth Required + Admin Role**

```json
{
  "comment": "Thank you for your review!",
  "courseId": "507f1f77bcf86cd799439011",
  "reviewId": "507f1f77bcf86cd799439014"
}
```

---

### 10. **GET** `/get-all-courses`
**Auth Required + Admin Role**

```json
// No body required
```

---

### 11. **DELETE** `/delete-course/:courseId`
**Auth Required + Admin Role**

```json
// No body required
// courseId is in URL parameter
```

---

## 🛒 ORDER ROUTES (`/api/v1/...`)

### 1. **POST** `/create-order`
**Auth Required**

```json
{
  "courseId": "507f1f77bcf86cd799439011"
}
```
*Note: `userId` is automatically taken from authenticated user*

---

### 2. **GET** `/get-all-orders`
**Auth Required + Admin Role**

```json
// No body required
```

---

## 📊 ANALYTICS ROUTES (`/api/v1/...`)

### 1. **GET** `/get-users-analytics`
**Auth Required + Admin Role**

```json
// No body required
```

---

### 2. **GET** `/get-courses-analytics`
**Auth Required + Admin Role**

```json
// No body required
```

---

### 3. **GET** `/get-orders-analytics`
**Auth Required + Admin Role**

```json
// No body required
```

---

## 🔔 NOTIFICATION ROUTES (`/api/v1/...`)

### 1. **GET** `/get-all-notifications`
**Auth Required + Admin Role**

```json
// No body required
```

---

### 2. **PUT** `/update-notification/:id`
**Auth Required + Admin Role**

```json
// No body required
// id is in URL parameter
// Automatically sets status to "read"
```

---

### 3. **DELETE** `/delete-all-notifications`
**Auth Required + Admin Role**

```json
// No body required
// Deletes all notifications with status "read"
```

---

## 🎨 LAYOUT ROUTES (`/api/v1/...`)

### 1. **POST** `/create-layout`
**Auth Required + Admin Role**

#### For **Banner** type:
```json
{
  "type": "Banner",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "title": "Welcome to Our Platform",
  "subtitle": "Start learning today!"
}
```

#### For **Faq** type:
```json
{
  "type": "Faq",
  "faq": [
    {
      "question": "What is this course about?",
      "answer": "This course teaches you React from scratch."
    },
    {
      "question": "How long is the course?",
      "answer": "The course is approximately 20 hours long."
    }
  ]
}
```

#### For **Category** type:
```json
{
  "type": "Category",
  "title": "Web Development"
}
```

#### For **Layout** type (complete layout):
```json
{
  "type": "Layout",
  "faq": [
    {
      "question": "Question 1?",
      "answer": "Answer 1"
    }
  ],
  "categories": [
    {
      "title": "Category 1"
    },
    {
      "title": "Category 2"
    }
  ],
  "banner": {
    "image": {
      "public_id": "layout/xyz123",
      "url": "https://example.com/banner.jpg"
    },
    "title": "Banner Title",
    "subtitle": "Banner Subtitle"
  }
}
```

---

## 📝 Notes:

1. **Authentication**: 
   - Routes marked "Auth Required" need a valid access token in cookies or Authorization header
   - Routes marked "Admin Role" require the user to have `role: "admin"`

2. **Base64 Images**: 
   - For image uploads, use base64 encoded strings or data URLs
   - Format: `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."`

3. **ObjectIds**: 
   - MongoDB ObjectIds are 24-character hex strings
   - Example: `"507f1f77bcf86cd799439011"`

4. **URL Parameters**: 
   - Parameters in URL (e.g., `:id`, `:userId`) should be replaced with actual values
   - Example: `/delete-user/507f1f77bcf86cd799439011`

5. **Optional Fields**: 
   - Fields marked as optional can be omitted from the request body
   - Some endpoints accept partial updates (only send fields you want to change)

