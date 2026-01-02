import React, { useState, useRef } from 'react';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { eventsAPI } from '../api/events.api';

interface FileUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  label?: string;
  showPreview?: boolean;
  folder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  multiple = false,
  accept = 'image/*,video/*',
  maxFiles = 10,
  label,
  showPreview = true,
  folder = 'events',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      if (multiple) {
        // Multiple file upload
        const fileArray = Array.from(files).slice(0, maxFiles);
        const uploadedUrls = await eventsAPI.uploadMultipleFiles(fileArray, folder);
        
        // Merge with existing URLs if any
        const existingUrls = Array.isArray(value) ? value : [];
        onChange([...existingUrls, ...uploadedUrls]);
      } else {
        // Single file upload
        const uploadedUrl = await eventsAPI.uploadFile(files[0], folder);
        onChange(uploadedUrl);
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file(s). Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (urlToRemove?: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange(multiple ? [] : '');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const renderPreview = (url: string, index?: number) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isVideo = /\.(mp4|mpeg|mov|avi)$/i.test(url);

    return (
      <div key={url} className="relative group">
        {isImage && (
          <img
            src={url}
            alt="Upload preview"
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          />
        )}
        {isVideo && (
          <video
            src={url}
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            controls={false}
          />
        )}
        {!isImage && !isVideo && (
          <div className="w-24 h-24 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <FileIcon size={32} className="text-gray-400" />
          </div>
        )}
        <button
          type="button"
          onClick={() => handleRemove(url)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  const urls = multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Button */}
      <div
        onClick={triggerFileSelect}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors duration-200
          ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
            {uploadProgress > 0 && (
              <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {multiple ? 'Click to upload files' : 'Click to upload file'}
            </p>
            <p className="text-xs text-gray-400">
              {accept.includes('image') && 'Images, '}
              {accept.includes('video') && 'Videos, '}
              {accept.includes('pdf') && 'PDFs'}
            </p>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {showPreview && urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {urls.map((url, index) => renderPreview(url, index))}
        </div>
      )}

      {multiple && urls.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {urls.length} file{urls.length > 1 ? 's' : ''} uploaded
        </p>
      )}
    </div>
  );
};
