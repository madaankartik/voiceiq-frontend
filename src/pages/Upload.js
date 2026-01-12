
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadCall } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Upload as UploadIcon, File, X } from 'lucide-react';
import toast from 'react-hot-toast';

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedExtensions = ['mp3', 'wav', 'mp4', 'm4a', 'webm', 'ogg'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error('Please select an audio or video file (mp3, wav, mp4, m4a, webm, ogg)');
        setFile(null);
        return;
      }

      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      toast.success('File selected');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);

    try {
      const response = await uploadCall(file);

      if (response && (response.success || response.callId)) {
        toast.success('Call uploaded successfully! Processing in background.');
        
        setFile(null);
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
          fileInput.value = '';
        }
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Unexpected response from server');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      
      if (err.response) {
        toast.error(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Upload failed. Please try again.'
        );
      } else if (err.message && !err.message.includes('navigation')) {
        toast.error('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeFile = () => {
    setFile(null);
    document.getElementById('file-input').value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Call Recording</h1>
        <p className="text-muted-foreground">
          Upload an audio or video file to analyze call quality, generate transcript, 
          score the call, and create a summary.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select File</CardTitle>
          <CardDescription>
            Choose an audio or video file to upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  MP3, WAV, MP4, M4A, WEBM, OGG (MAX. 100MB)
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-accent">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload & Analyze
              </>
            )}
          </Button>

          {uploading && (
            <p className="text-sm text-muted-foreground text-center">
              Uploading file... After upload, the file will be processed in the background. 
              You can check the dashboard for status updates.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Upload;
