import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Loader2, ImageIcon, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { uploadFile, API_BASE_URL } from '@/utils/api';
import { toast } from 'sonner';

interface EventFormProps {
  newEvent: any;
  setNewEvent: (event: any) => void;
  editingEvent: any;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EventForm({ newEvent, setNewEvent, editingEvent, onSubmit, onCancel, isSubmitting = false }: EventFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get full URL for uploaded images
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // For server-uploaded images, prepend API base URL (without /api/v1)
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${url}`;
  };

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
        setNewEvent((prev: any) => ({ ...prev, imageUrl: response.data.url }));
        toast.success('이미지가 업로드되었습니다.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [setNewEvent]);

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
    setNewEvent((prev: any) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setNewEvent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-900">
            {editingEvent ? '이벤트 수정' : '새 이벤트 생성'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required fields notice */}
          <p className="text-sm text-gray-500"><span className="text-red-500">*</span> 표시는 필수 입력 항목입니다</p>

          {/* Title and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">이벤트 제목 <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder="예: K-Pop 콘서트 할인"
                className={`border-gray-300 ${newEvent.title && (newEvent.title.length < 5 || newEvent.title.length > 100) ? 'border-red-500 focus:ring-red-500' : ''}`}
                maxLength={100}
              />
              <div className="flex justify-between text-xs">
                <span className={newEvent.title && newEvent.title.length < 5 ? 'text-red-500' : 'text-gray-500'}>
                  {newEvent.title && newEvent.title.length < 5 ? '최소 5자 이상 입력해주세요' : ''}
                </span>
                <span className={`${newEvent.title?.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {newEvent.title?.length || 0}/100
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700">이벤트 유형 <span className="text-red-500">*</span></Label>
              <Select value={newEvent.type} onValueChange={(value) => setNewEvent((prev: any) => ({ ...prev, type: value }))}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="시즌 이벤트">시즌 이벤트</SelectItem>
                  <SelectItem value="프로모션">프로모션</SelectItem>
                  <SelectItem value="문화 이벤트">문화 이벤트</SelectItem>
                  <SelectItem value="특별 혜택">특별 혜택</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-gray-700">이벤트 기간 - 시작일 <span className="text-red-500">*</span></Label>
              <Input
                id="startDate"
                type="date"
                value={newEvent.startDate}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, startDate: e.target.value }))}
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-700">이벤트 기간 - 종료일 <span className="text-red-500">*</span></Label>
              <Input
                id="endDate"
                type="date"
                value={newEvent.endDate}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, endDate: e.target.value }))}
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Location and Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-700">장소 <span className="text-red-500">*</span></Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, location: e.target.value }))}
                placeholder="예: 여의도 공원"
                className={`border-gray-300 ${newEvent.location && (newEvent.location.length < 5 || newEvent.location.length > 200) ? 'border-red-500 focus:ring-red-500' : ''}`}
                maxLength={200}
              />
              <div className="flex justify-between text-xs">
                <span className={newEvent.location && newEvent.location.length < 5 ? 'text-red-500' : 'text-gray-500'}>
                  {newEvent.location && newEvent.location.length < 5 ? '최소 5자 이상 입력해주세요' : ''}
                </span>
                <span className={`${newEvent.location?.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                  {newEvent.location?.length || 0}/200
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer" className="text-gray-700">주최자</Label>
              <Input
                id="organizer"
                value={newEvent.organizer}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, organizer: e.target.value }))}
                placeholder="예: 서울시청"
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700">이벤트 내용 <span className="text-red-500">*</span></Label>
            <textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="이벤트에 대한 상세 설명을 입력하세요... (최소 20자)"
              className={`w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                newEvent.description && newEvent.description.length < 20 ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            <div className="flex justify-between text-xs">
              <span className={newEvent.description && newEvent.description.length < 20 ? 'text-red-500' : 'text-gray-500'}>
                {newEvent.description && newEvent.description.length < 20 ? '최소 20자 이상 입력해주세요' : ''}
              </span>
              <span className="text-gray-400">
                {newEvent.description?.length || 0}/2000
              </span>
            </div>
          </div>

          {/* Event Image */}
          <div className="space-y-2">
            <Label className="text-gray-700">이벤트 이미지</Label>

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
              <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="text-sm text-gray-600">이미지 업로드 중...</p>
              </div>
            ) : newEvent.imageUrl ? (
              /* Image Preview with Remove Button */
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                <ImageWithFallback
                  src={getImageUrl(newEvent.imageUrl)}
                  alt="이벤트 미리보기"
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
                  w-full h-48 rounded-lg border-2 border-dashed cursor-pointer
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
                  value={newEvent.imageUrl}
                  onChange={(e) => setNewEvent((prev: any) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="border-gray-300 flex-1 text-sm"
                />
              </div>
            )}
          </div>

          {/* Target Audience and Age Restriction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-gray-700">대상 연령</Label>
              <Input
                id="targetAudience"
                value={newEvent.targetAudience}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="예: 모든 연령, 10-30대"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRestriction" className="text-gray-700">연령 제한</Label>
              <Input
                id="ageRestriction"
                value={newEvent.ageRestriction}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, ageRestriction: e.target.value }))}
                placeholder="예: 없음, 전연령 관람가"
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Contact Email and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-gray-700">연락처 이메일 <span className="text-red-500">*</span></Label>
              <Input
                id="contactEmail"
                type="email"
                value={newEvent.contactEmail}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@event.com"
                className={`${
                  newEvent.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEvent.contactEmail)
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {newEvent.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEvent.contactEmail) && (
                <p className="text-xs text-red-500">올바른 이메일 형식을 입력해주세요 (예: contact@event.com)</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-gray-700">웹사이트</Label>
              <Input
                id="website"
                value={newEvent.website}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, website: e.target.value }))}
                placeholder="https://event-website.com"
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Budget and Expected Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-gray-700">예산 (원)</Label>
              <Input
                id="budget"
                type="number"
                value={newEvent.budget}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, budget: Number(e.target.value) }))}
                placeholder="50000"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedParticipants" className="text-gray-700">예상 참여자 수</Label>
              <Input
                id="expectedParticipants"
                type="number"
                value={newEvent.expectedParticipants}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, expectedParticipants: Number(e.target.value) }))}
                placeholder="1000"
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-gray-700">참여 조건</Label>
            <Input
              id="requirements"
              value={newEvent.requirements}
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, requirements: e.target.value }))}
              placeholder="예: 사전 예약 필요, 멤버십 가입 필요"
              className="border-gray-300"
            />
          </div>

          {/* Weather Dependency */}
          <div className="space-y-2">
            <Label htmlFor="weatherDependency" className="text-gray-700">날씨 영향</Label>
            <Input
              id="weatherDependency"
              value={newEvent.weatherDependency}
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, weatherDependency: e.target.value }))}
              placeholder="예: 우천시 취소, 실내 공연"
              className="border-gray-300"
            />
          </div>

          {/* Conditions for AI Matching */}
          <div className="space-y-2">
            <Label htmlFor="conditions" className="text-gray-700">적용 조건 (AI 매칭용)</Label>
            <Input
              id="conditions"
              value={newEvent.conditions}
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, conditions: e.target.value }))}
              placeholder="예: K-Culture 관심사, 서울"
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">여행 계획 시 이 이벤트를 자동으로 추천하기 위한 조건을 입력하세요</p>
          </div>

          {/* Exposure Frequency & Relevance Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700">노출 빈도 (Exposure Frequency)</Label>
                <span className="text-sm font-bold text-black">{newEvent.frequency || 50}%</span>
              </div>
              <Slider 
                value={[newEvent.frequency || 50]} 
                max={100} 
                step={1} 
                onValueChange={(value) => setNewEvent((prev: any) => ({ ...prev, frequency: value[0] }))}
                className="py-2"
              />
              <p className="text-xs text-gray-500">사용자에게 이 이벤트가 노출되는 빈도를 조절합니다.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700">관련도 (Relevance)</Label>
                <span className="text-sm font-bold text-black">{newEvent.relevance || 50}%</span>
              </div>
              <Slider 
                value={[newEvent.relevance || 50]} 
                max={100} 
                step={1} 
                onValueChange={(value) => setNewEvent((prev: any) => ({ ...prev, relevance: value[0] }))}
                className="py-2"
              />
              <p className="text-xs text-gray-500">추천 알고리즘에서 이 이벤트의 우선순위를 조절합니다.</p>
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              checked={newEvent.active}
              onCheckedChange={(checked) => setNewEvent((prev: any) => ({ ...prev, active: checked }))}
            />
            <Label className="text-gray-700">이벤트 활성화</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                editingEvent ? '이벤트 수정' : '이벤트 생성'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
