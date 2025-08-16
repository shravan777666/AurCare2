# Postman Testing Guide for Salon Registration API

## Setup Instructions

### 1. Start the Server
```bash
cd backend
node start-server.js
```

### 2. Test Health Endpoint First
**URL:** `GET http://localhost:5000/health`

This should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Salon Registration API Testing

### Endpoint Details
- **URL:** `POST http://localhost:5000/api/auth/register-salon-owner`
- **Content-Type:** `multipart/form-data`

### Required Fields
1. **name** (text) - Salon owner's name
2. **email** (text) - Valid email address
3. **password** (text) - Minimum 8 characters
4. **salonName** (text) - Name of the salon
5. **contactNumber** (text) - Phone number (10-15 digits)
6. **logo** (file) - Image file (JPEG, JPG, PNG, GIF) - Max 2MB
7. **license** (file) - Document file (PDF, DOC, DOCX) - Max 5MB

### Optional Fields
- **description** (text) - Salon description
- **address** (text) - JSON string with address details

### Postman Setup Steps

1. **Create New Request**
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/register-salon-owner`

2. **Set Headers**
   - Remove any `Content-Type` header (Postman will set it automatically for form-data)

3. **Set Body**
   - Select `form-data`
   - Add the following key-value pairs:

#### Text Fields:
```
name: John Doe
email: john@salon.com
password: password123
salonName: Beautiful Salon
contactNumber: 1234567890
description: A beautiful salon for all your beauty needs
address: {"street":"123 Main St","city":"New York","state":"NY","zipCode":"10001"}
```

#### File Fields:
```
logo: [Select File] (Choose a .jpg, .png, or .gif file under 2MB)
license: [Select File] (Choose a .pdf, .doc, or .docx file under 5MB)
```

### Expected Success Response
```json
{
  "success": true,
  "message": "Salon registration submitted for approval",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@salon.com",
    "role": "salonowner",
    "salonName": "Beautiful Salon",
    "isApproved": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Common Error Responses

#### 1. Missing Required Fields (400)
```json
{
  "success": false,
  "status": 400,
  "message": "Missing required fields: name, email"
}
```

#### 2. Invalid Email Format (400)
```json
{
  "success": false,
  "status": 400,
  "message": "Invalid email format"
}
```

#### 3. Password Too Short (400)
```json
{
  "success": false,
  "status": 400,
  "message": "Password must be at least 8 characters long"
}
```

#### 4. Invalid Phone Number (400)
```json
{
  "success": false,
  "status": 400,
  "message": "Phone number must be between 10-15 digits"
}
```

#### 5. Missing Files (400)
```json
{
  "success": false,
  "status": 400,
  "message": "Both logo and license files are required"
}
```

#### 6. File Too Large (413)
```json
{
  "success": false,
  "error": "File too large. Max 2MB for logo, 5MB for license"
}
```

#### 7. Invalid File Type (400)
```json
{
  "success": false,
  "error": "File type not allowed. Allowed types: JPEG, JPG, PNG, GIF, PDF, DOC, DOCX. Received: test.txt"
}
```

#### 8. Email Already Exists (409)
```json
{
  "success": false,
  "status": 409,
  "message": "Email already registered"
}
```

## Troubleshooting

### 1. Server Not Starting
- Check if MongoDB is running
- Check if port 5000 is available
- Look for error messages in console

### 2. Connection Refused
- Make sure server is running on port 5000
- Check if firewall is blocking the connection

### 3. File Upload Issues
- Ensure files are under size limits
- Check file extensions are allowed
- Make sure field names are exactly "logo" and "license"

### 4. Database Issues
- Ensure MongoDB is running
- Check connection string in environment variables
- Look for database connection errors in console

## Test Files
You can create test files for testing:
- Create a small JPEG image for logo
- Create a small PDF file for license
- Or use any existing image/document files under the size limits

