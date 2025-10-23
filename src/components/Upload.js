import React, { useState, useRef } from 'react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setMessage('Error accessing webcam: ' + err.message);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        setCapturedImage(capturedFile);
        setFile(capturedFile);
        stopWebcam();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setCapturedImage(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setIsLoading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await axios.post('http://<ec2-public-ip>:3000/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('✅ ' + response.data);
    } catch (err) {
      setMessage('❌ Upload failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebcam = () => {
    if (useWebcam) {
      stopWebcam();
      setUseWebcam(false);
      setCapturedImage(null);
      setFile(null);
    } else {
      setUseWebcam(true);
      startWebcam();
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <h2 className="card-title">
          Exam Proctoring Upload
        </h2>
        <p className="card-subtitle">
          Upload exam files or capture photos for proctoring analysis
        </p>
      </div>

      {/* Webcam Toggle */}
      <div className="upload-section">
        <label className="upload-toggle">
          <input
            type="checkbox"
            checked={useWebcam}
            onChange={toggleWebcam}
            className="upload-checkbox"
          />
          <span className="upload-label">
            Use Webcam for Photo Capture
          </span>
        </label>
      </div>

      {/* Webcam Preview */}
      {useWebcam && (
        <div className="upload-section">
          <div className="webcam-preview">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="webcam-video"
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
          </div>
          <div className="capture-btn">
            <button
              onClick={capturePhoto}
            >
              📸 Capture Photo
            </button>
          </div>
        </div>
      )}

      {/* File Input */}
      {!useWebcam && (
        <div className="file-input">
          <label className="form-label">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            className="form-input"
            required
          />
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="image-preview">
          <p>Captured Image:</p>
          <div style={{ border: '2px solid var(--gray-300)', borderRadius: '0.5rem', padding: '0.5rem' }}>
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="Captured"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.5rem' }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="upload-section">
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="btn-spinner"></div>
              Uploading...
            </div>
          ) : (
            '📤 Upload to S3'
          )}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`status-message ${
          message.startsWith('✅') 
            ? 'status-success' 
            : 'status-error'
        }`}>
          <p style={{ fontSize: '0.875rem' }}>{message}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h3>📋 Instructions:</h3>
        <ul>
          <li>• For file upload: Select any image, PDF, or document</li>
          <li>• For webcam: Enable webcam and capture a photo</li>
          <li>• Files are securely uploaded to AWS S3</li>
          <li>• Proctoring analysis will be performed on uploaded content</li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;