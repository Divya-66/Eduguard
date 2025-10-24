# EduGuard Backend Setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# AWS Region (optional, defaults to us-east-1)
AWS_REGION=us-east-1

# Server Configuration
PORT=4000
NODE_ENV=development
```

## Getting AWS Credentials

1. Go to AWS Console -> IAM -> Users
2. Select your user or create a new one
3. Go to Security Credentials tab
4. Create Access Key
5. Copy the Access Key ID and Secret Access Key

## Required AWS Permissions

Your AWS user needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::eduguard-student-uploads-755746343900/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:DetectLabels",
                "rekognition:DetectText"
            ],
            "Resource": "*"
        }
    ]
}
```

## Running the Server

### Install Dependencies
```bash
npm install
```

### Start Backend Only
```bash
npm run server
```

### Start Both Frontend and Backend
```bash
npm run dev
```

## API Endpoints

- `GET /` - Server information
- `GET /health` - Health check
- `POST /upload` - Upload file with S3 and Rekognition analysis

## Features

- ✅ File upload to S3 bucket
- ✅ AWS Rekognition for image analysis
- ✅ Text detection in images
- ✅ Label detection (objects, scenes, etc.)
- ✅ CORS enabled for frontend communication
- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ Error handling and logging
