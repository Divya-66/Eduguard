const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Configure AWS
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// Check if AWS credentials are provided
if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
  console.warn('⚠️  AWS credentials not found in environment variables.');
  console.warn('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
  console.warn('   The server will start but uploads will fail without proper credentials.');
}

AWS.config.update(awsConfig);

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

// S3 bucket name
const BUCKET_NAME = 'eduguard-student-uploads-755746343900';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Upload file to S3
const uploadToS3 = async (file, key) => {
  // Check if AWS credentials are available
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private' // Keep files private
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    if (error.code === 'CredentialsError') {
      throw new Error('Invalid AWS credentials. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
    } else if (error.code === 'NoSuchBucket') {
      throw new Error(`S3 bucket '${BUCKET_NAME}' does not exist or you don't have access to it.`);
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to S3 bucket. Please check your AWS permissions.');
    } else {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }
};

// Analyze image with Rekognition
const analyzeWithRekognition = async (bucketName, key) => {
  // Check if AWS credentials are available
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured for Rekognition analysis.');
  }

  try {
    const params = {
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: key
        }
      },
      MaxLabels: 10,
      MinConfidence: 70
    };

    const result = await rekognition.detectLabels(params).promise();
    
    // Also detect text in the image
    const textParams = {
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: key
        }
      }
    };

    const textResult = await rekognition.detectText(textParams).promise();
    
    return {
      labels: result.Labels,
      text: textResult.TextDetections
    };
  } catch (error) {
    console.error('Rekognition error:', error);
    if (error.code === 'CredentialsError') {
      throw new Error('Invalid AWS credentials for Rekognition. Please check your AWS credentials.');
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to Rekognition. Please check your AWS permissions.');
    } else {
      throw new Error(`Rekognition analysis failed: ${error.message}`);
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'EduGuard Backend Server is running!',
    endpoints: {
      upload: 'POST /upload',
      health: 'GET /health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      s3: 'configured',
      rekognition: 'configured'
    }
  });
});

app.get('/dashboard', (req, res) => {
  // Mock dashboard data for now
  const mockData = [
    {
      id: 'STU001',
      name: 'John Smith',
      performance_score: 85
    },
    {
      id: 'STU002', 
      name: 'Sarah Johnson',
      performance_score: 92
    },
    {
      id: 'STU003',
      name: 'Mike Davis',
      performance_score: 78
    },
    {
      id: 'STU004',
      name: 'Emily Wilson',
      performance_score: 88
    },
    {
      id: 'STU005',
      name: 'David Brown',
      performance_score: 95
    }
  ];
  
  res.json(mockData);
});

// Test endpoint that doesn't require AWS credentials
app.post('/test-upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Test upload received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    res.json({
      message: 'Test upload successful (no AWS operations)',
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      },
      note: 'This is a test endpoint. For full functionality, configure AWS credentials.'
    });

  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ 
      error: 'Test upload failed',
      details: error.message 
    });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Generate unique key for S3
    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname);
    const key = `uploads/${timestamp}-${req.file.originalname}`;

    // Upload to S3
    const s3Location = await uploadToS3(req.file, key);
    console.log('File uploaded to S3:', s3Location);

    // Analyze with Rekognition (only for images)
    let analysisResult = null;
    if (req.file.mimetype.startsWith('image/')) {
      try {
        analysisResult = await analyzeWithRekognition(BUCKET_NAME, key);
        console.log('Rekognition analysis completed');
      } catch (rekognitionError) {
        console.warn('Rekognition analysis failed:', rekognitionError.message);
        // Continue without analysis if Rekognition fails
      }
    }

    // Prepare response
    const response = {
      message: 'File uploaded successfully',
      s3Location: s3Location,
      key: key,
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    };

    // Add analysis results if available
    if (analysisResult) {
      response.analysis = {
        labels: analysisResult.labels.map(label => ({
          name: label.Name,
          confidence: label.Confidence
        })),
        detectedText: analysisResult.text.map(text => ({
          text: text.DetectedText,
          confidence: text.Confidence
        }))
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Test AWS connectivity on startup
const testAWSConnection = async () => {
  try {
    console.log('🔍 Testing AWS connectivity...');
    console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`   Access Key: ${process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set'}`);
    console.log(`   Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set'}`);
    
    // Test S3 access
    const s3Params = {
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    };
    
    await s3.listObjectsV2(s3Params).promise();
    console.log(`✅ S3 bucket '${BUCKET_NAME}' is accessible`);
    
  } catch (error) {
    console.error(`❌ AWS connection test failed:`, error.message);
    console.error(`   This might cause upload failures.`);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 EduGuard Backend Server running on port ${PORT}`);
  console.log(`📁 S3 Bucket: ${BUCKET_NAME}`);
  console.log(`🔍 Rekognition: Enabled`);
  console.log(`🌐 CORS: Enabled`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  / - Server info`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /upload - File upload with analysis`);
  
  // Test AWS connection
  await testAWSConnection();
});

module.exports = app;
