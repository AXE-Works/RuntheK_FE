import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock, 
  DollarSign,
  User,
  Mail,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ItineraryDetailModalProps {
  itinerary: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ItineraryDetailModal({ itinerary, isOpen, onClose }: ItineraryDetailModalProps) {
  if (!itinerary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {itinerary.title}
              </DialogTitle>
              <div className="flex items-center space-x-4">
                <Badge variant={itinerary.status === '완료' ? 'default' : 'secondary'} className={
                  itinerary.status === '완료' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }>
                  {itinerary.status}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  <Calendar className="h-3 w-3 mr-1" />
                  {itinerary.duration}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {itinerary.totalCost}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">사용자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="font-medium">{itinerary.userName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium">{itinerary.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">국가</p>
                    <p className="font-medium">{itinerary.userCountry}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">여행 개요</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">생성일</p>
                    <p className="font-medium">{itinerary.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">예산 범위</p>
                    <p className="font-medium">{itinerary.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">방문 도시</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {itinerary.cities.map((city: string) => (
                        <Badge key={city} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">관심사</h3>
                <div className="flex flex-wrap gap-2">
                  {itinerary.interests.map((interest: string) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                {itinerary.rating && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">평점</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(itinerary.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{itinerary.rating}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Feedback */}
          {itinerary.feedback && (
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">사용자 피드백</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 italic">"{itinerary.feedback}"</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Itinerary */}
          {itinerary.itineraryData && itinerary.itineraryData.days ? (
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">상세 일정</h3>
                <div className="space-y-3">
                  {itinerary.itineraryData.days.map((day: any) => (
                    <Card key={day.day} className="border border-gray-100 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">Day {day.day}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-3">{day.title}</h4>
                            <div className="space-y-3">
                              {day.activities.map((activity: any, idx: number) => (
                                <div key={idx} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                  <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="font-medium text-gray-900">{activity.time}</p>
                                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{activity.estimatedCost}</span>
                                    </div>
                                    <p className="font-medium text-gray-800 mb-1">{activity.activity}</p>
                                    <p className="text-sm text-gray-600 mb-1">
                                      <MapPin className="h-3 w-3 inline mr-1" />
                                      {activity.location}
                                    </p>
                                    <p className="text-sm text-gray-500">{activity.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-200 bg-gray-50">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">세부 일정 데이터가 없습니다</h3>
                <p className="text-sm text-gray-500">
                  이 여행은 확정되었지만 상세 일정이 저장되지 않았습니다.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  새로운 데이터를 보려면 관리자 대시보드에서 "전체 삭제" 후 새로고침하세요.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ThumbsDown className="h-4 w-4 mr-2" />
              피드백 요청
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800">
              <ThumbsUp className="h-4 w-4 mr-2" />
              추천 승인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}