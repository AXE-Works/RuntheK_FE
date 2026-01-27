import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, Loader2, ImageIcon, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { uploadFile, API_BASE_URL } from '@/utils/api';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  showUrlInput?: boolean;
  height?: string;
  placeholder?: string;
}

/**
 * Reusable image upload component with drag-and-drop support.
 * Supports both file upload and direct URL input.
 */
export function ImageUploadField({
  value,
  onChange,
  label = '이미지',
  showUrlInput: initialShowUrlInput = false,
  height = 'h-48',
  placeholder = 'https://images.unsplash.com/...'
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(initialShowUrlInput);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get full URL for uploaded images
  const getImageUrl = useCallback((url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // For server-uploaded images, prepend API base URL (without /api/v1)
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${url}`;
  }, []);

  const handleUploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      if (response.success && response.data) {
        onChange(response.data.url);
        toast.success('이미지가 업로드되었습니다.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
  }, [handleUploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
  }, [handleUploadFile]);

  const handleRemoveImage = useCallback(() => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      {label && <Label className="text-gray-700">{label}</Label>}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading ? (
        /* Upload in progress */
        <div className={`w-full ${height} rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 bg-gray-50`}>
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-sm text-gray-600">이미지 업로드 중...</p>
        </div>
      ) : value ? (
        /* Image Preview with Remove Button */
        <div className={`relative w-full ${height} rounded-lg overflow-hidden border border-gray-200 group`}>
          <ImageWithFallback
            src={getImageUrl(value)}
            alt="미리보기"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <Upload className="h-4 w-4 mr-1" />
              변경
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemoveImage}
              className="bg-white/90 hover:bg-white text-red-600"
            >
              <X className="h-4 w-4 mr-1" />
              삭제
            </Button>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full ${height} rounded-lg border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3
            transition-all duration-200
            ${isDragging
              ? 'border-black bg-gray-100 scale-[1.02]'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          <div className={`
            p-3 rounded-full transition-colors
            ${isDragging ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}
          `}>
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${isDragging ? 'text-black' : 'text-gray-700'}`}>
              {isDragging ? '여기에 놓으세요' : '이미지를 드래그하여 업로드'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              또는 클릭하여 파일 선택 (최대 10MB)
            </p>
          </div>
        </div>
      )}

      {/* URL Input Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showUrlInput ? 'URL 입력 숨기기' : 'URL로 직접 입력'}
        </Button>
      </div>

      {showUrlInput && (
        <div className="flex space-x-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-gray-300 flex-1 text-sm"
          />
        </div>
      )}
    </div>
  );
}
