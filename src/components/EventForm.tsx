import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface EventFormProps {
  newEvent: any;
  setNewEvent: (event: any) => void;
  editingEvent: any;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EventForm({ newEvent, setNewEvent, editingEvent, onSubmit, onCancel }: EventFormProps) {
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
          {/* Title and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">이벤트 제목</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder="예: K-Pop 콘서트 할인"
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700">이벤트 유형</Label>
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
              <Label htmlFor="startDate" className="text-gray-700">이벤트 기간 - 시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={newEvent.startDate}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, startDate: e.target.value }))}
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-700">이벤트 기간 - 종료일</Label>
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
              <Label htmlFor="location" className="text-gray-700">장소</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, location: e.target.value }))}
                placeholder="예: 여의도 공원"
                className="border-gray-300"
              />
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
            <Label htmlFor="description" className="text-gray-700">이벤트 내용</Label>
            <textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="이벤트에 대한 상세 설명을 입력하세요..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              rows={4}
            />
          </div>

          {/* Event Image */}
          <div className="space-y-2">
            <Label htmlFor="eventImage" className="text-gray-700">이벤트 이미지</Label>
            <div className="flex space-x-2">
              <Input
                id="eventImage"
                value={newEvent.imageUrl}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                className="border-gray-300 flex-1"
              />
              <Button variant="outline" className="border-gray-300">
                <Upload className="h-4 w-4 mr-2" />
                업로드
              </Button>
            </div>
            {newEvent.imageUrl && (
              <div className="mt-2 w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                <ImageWithFallback 
                  src={newEvent.imageUrl}
                  alt="이벤트 미리보기"
                  className="w-full h-full object-cover"
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
              <Label htmlFor="contactEmail" className="text-gray-700">연락처 이메일</Label>
              <Input
                id="contactEmail"
                type="email"
                value={newEvent.contactEmail}
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@event.com"
                className="border-gray-300"
              />
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
            <Button 
              onClick={onSubmit}
              className="bg-black text-white hover:bg-gray-800"
            >
              {editingEvent ? '이벤트 수정' : '이벤트 생성'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
