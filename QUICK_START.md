# 🚀 EduGuard Quick Start Guide

## Current Status
✅ **Backend server is running on port 4000**  
✅ **Frontend is configured to use localhost:4000**  
✅ **Test endpoint is working (no AWS required)**  

## Next Steps

### 1. Test the Current Setup
The server is running with a test endpoint that doesn't require AWS credentials. You can:
- Upload files to test the basic functionality
- Check the dashboard for mock data
- Verify the server is responding

### 2. Configure AWS Credentials (Optional)
To enable S3 uploads and Rekognition analysis:

1. **Create a `.env` file** in the project root:
```env
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
AWS_REGION=us-east-1
PORT=4000
```

2. **Get AWS Credentials**:
   - Go to AWS Console → IAM → Users
   - Create a new user or use existing
   - Attach policies: `AmazonS3FullAccess` and `AmazonRekognitionFullAccess`
   - Create access key and copy the credentials

3. **Restart the server** after adding credentials:
```bash
npm run server
```

### 3. Switch to Full Upload Endpoint
Once AWS is configured, change the endpoint in `Upload.js`:
```javascript
// Change from:
const response = await axios.post('http://localhost:4000/test-upload', formData, {

// To:
const response = await axios.post('http://localhost:4000/upload', formData, {
```

## Available Endpoints

- `GET /` - Server info
- `GET /health` - Health check
- `GET /dashboard` - Mock dashboard data
- `POST /test-upload` - Test upload (no AWS)
- `POST /upload` - Full upload with S3 + Rekognition

## Troubleshooting

### Server Not Starting
```bash
cd "C:\Users\divya\OneDrive\Desktop\eduguard\Eduguard"
npm run server
```

### Connection Refused
- Make sure server is running on port 4000
- Check firewall settings
- Verify you're using `localhost:4000` not `127.0.0.1:4000`

### AWS Errors
- Check your `.env` file has correct credentials
- Verify AWS permissions for S3 and Rekognition
- Ensure the S3 bucket exists: `eduguard-student-uploads-755746343900`

## Current Features Working
- ✅ File upload (test mode)
- ✅ Dashboard with mock data
- ✅ Webcam photo capture
- ✅ File type validation
- ✅ Error handling and logging
