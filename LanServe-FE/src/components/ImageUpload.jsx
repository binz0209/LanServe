import { useState } from 'react';
import api from '../lib/api';
import Button from './ui/button';

export default function ImageUpload({ 
  onUploadSuccess, 
  multiple = false, 
  folder = 'lanserve',
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*'
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);

    // Preview
    if (!multiple) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    // Upload
    handleUpload(files);
  };

  const handleUpload = async (files) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (multiple) {
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', files[0]);
      }
      formData.append('folder', folder);

      const endpoint = multiple ? '/api/images/upload-multiple' : '/api/images/upload';
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (multiple) {
        const newUrls = response.data.urls || [];
        // Nếu onUploadSuccess nhận array, append vào array hiện có
        if (Array.isArray(newUrls) && newUrls.length > 0) {
          onUploadSuccess?.(newUrls);
        }
      } else {
        onUploadSuccess?.(response.data.url);
        setPreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const input = e.target.closest('label')?.querySelector('input[type="file"]');
    if (input && !uploading) {
      input.click();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer inline-block">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
            id={`file-input-${Math.random()}`}
          />
          <Button 
            type="button" 
            variant="outline" 
            disabled={uploading}
            onClick={handleButtonClick}
          >
            {uploading ? 'Uploading...' : multiple ? 'Choose Images' : 'Choose Image'}
          </Button>
        </label>
        {preview && !multiple && (
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded"
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

