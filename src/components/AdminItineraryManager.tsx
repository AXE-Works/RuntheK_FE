import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { AdminItineraryEditor } from './AdminItineraryEditor';
import { motion } from 'motion/react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  getRecommendedList,
  getRecommendedDetail,
  updateRecommendedStatus,
  createRecommendedItinerary,
  updateRecommendedItinerary,
  deleteRecommendedItinerary,
  type RecommendedItinerary,
  type RecommendedSummary,
  type PageInfo,
  type CreateRecommendedRequest
} from '../services/recommendedApi';
import { toast } from 'sonner';

interface AdminItineraryManagerProps {
  currentUser?: any;
}

export function AdminItineraryManager({ currentUser }: AdminItineraryManagerProps) {
  // Data state
  const [itineraries, setItineraries] = useState<RecommendedItinerary[]>([]);
  const [summary, setSummary] = useState<RecommendedSummary>({
    totalItineraries: 0,
    activeItineraries: 0,
    totalViewCount: 0,
    totalBookingCount: 0,
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<RecommendedItinerary | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedItineraries, setExpandedItineraries] = useState<Set<string>>(new Set());

  // Loading/Error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch itineraries from API
  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendedList({
        page: 1,
        limit: 100,
        sort: '-createdAt',
      });
      setItineraries(result.itineraries);
      setSummary(result.summary);
    } catch (err) {
      console.error('Failed to fetch recommended itineraries:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  // Client-side filtering (search already loaded data)
  const filteredItineraries = itineraries.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cities.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingItinerary(null);
    setShowEditor(true);
  };

  const handleEdit = (itinerary: RecommendedItinerary) => {
    setEditingItinerary(itinerary);
    setShowEditor(true);
  };

  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 추천 여행 일정을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(id);
    try {
      await deleteRecommendedItinerary(id);
      setItineraries(itineraries.filter(item => item.id !== id));
      // Update summary
      const deletedItem = itineraries.find(i => i.id === id);
      if (deletedItem) {
        setSummary(prev => ({
          ...prev,
          totalItineraries: prev.totalItineraries - 1,
          activeItineraries: deletedItem.active ? prev.activeItineraries - 1 : prev.activeItineraries,
          totalViewCount: prev.totalViewCount - deletedItem.viewCount,
          totalBookingCount: prev.totalBookingCount - deletedItem.bookingCount,
        }));
      }
      toast.success('추천 일정이 삭제되었습니다');
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
      toast.error('삭제에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
    } finally {
      setDeleting(null);
    }
  };

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleToggleActive = async (id: string) => {
    const itinerary = itineraries.find(i => i.id === id);
    if (!itinerary) return;

    setUpdatingStatus(id);
    try {
      const result = await updateRecommendedStatus(id, { isActive: !itinerary.active });
      setItineraries(itineraries.map(item =>
        item.id === id ? { ...item, active: result.isActive, updatedAt: result.updatedAt } : item
      ));
      // Update summary counts
      setSummary(prev => ({
        ...prev,
        activeItineraries: result.isActive
          ? prev.activeItineraries + 1
          : prev.activeItineraries - 1,
      }));
    } catch (err) {
      console.error('Failed to update active status:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const itinerary = itineraries.find(i => i.id === id);
    if (!itinerary) return;

    setUpdatingStatus(id);
    try {
      const result = await updateRecommendedStatus(id, { isFeatured: !itinerary.featured });
      setItineraries(itineraries.map(item =>
        item.id === id ? { ...item, featured: result.isFeatured, updatedAt: result.updatedAt } : item
      ));
    } catch (err) {
      console.error('Failed to update featured status:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const toggleExpanded = async (id: string) => {
    const newExpanded = new Set(expandedItineraries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
      setExpandedItineraries(newExpanded);
    } else {
      // Check if we already have days data
      const itinerary = itineraries.find(i => i.id === id);
      if (itinerary && itinerary.days.length === 0) {
        // Fetch detail to get days
        setLoadingDetail(id);
        try {
          const detail = await getRecommendedDetail(id);
          // Update itinerary with days data
          setItineraries(prev => prev.map(i =>
            i.id === id ? { ...i, days: detail.days, richContent: detail.richContent } : i
          ));
        } catch (err) {
          console.error('Failed to fetch itinerary detail:', err);
        } finally {
          setLoadingDetail(null);
        }
      }
      newExpanded.add(id);
      setExpandedItineraries(newExpanded);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async (itinerary: RecommendedItinerary) => {
    setSaving(true);

    // Convert RecommendedItinerary to CreateRecommendedRequest format
    const request: CreateRecommendedRequest = {
      title: itinerary.title,
      description: itinerary.description,
      imageUrl: itinerary.imageUrl,
      duration: itinerary.duration,
      cities: itinerary.cities,
      budget: itinerary.budget,
      interests: itinerary.interests,
      isActive: itinerary.active,
      isFeatured: itinerary.featured,
      displayOrder: itinerary.displayOrder,
      days: itinerary.days.map(day => ({
        day: day.day,
        title: day.title,
        activities: day.activities.map(act => ({
          time: act.time,
          activity: act.activity,
          location: act.location,
          description: act.description,
          estimatedCost: act.estimatedCost,
        })),
      })),
      richContent: itinerary.richContent ? {
        introduction: itinerary.richContent.introduction,
        contentBlocks: itinerary.richContent.contentBlocks,
      } : undefined,
    };

    try {
      if (editingItinerary) {
        // Update existing
        const updated = await updateRecommendedItinerary(editingItinerary.id, request);
        setItineraries(itineraries.map(item =>
          item.id === editingItinerary.id ? updated : item
        ));
        toast.success('추천 일정이 수정되었습니다');
      } else {
        // Create new
        const created = await createRecommendedItinerary(request);
        setItineraries([created, ...itineraries]);
        // Update summary
        setSummary(prev => ({
          ...prev,
          totalItineraries: prev.totalItineraries + 1,
          activeItineraries: created.active ? prev.activeItineraries + 1 : prev.activeItineraries,
        }));
        toast.success('새 추천 일정이 생성되었습니다');
      }
      setShowEditor(false);
      setEditingItinerary(null);
    } catch (err) {
      console.error('Failed to save itinerary:', err);
      toast.error('저장에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
    } finally {
      setSaving(false);
    }
  };

  if (showEditor) {
    return (
      <AdminItineraryEditor
        itinerary={editingItinerary}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingItinerary(null);
        }}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">추천 일정을 불러오는 중...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-red-300 bg-red-50">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Button
          onClick={fetchItineraries}
          className="bg-black text-white rounded-none hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">추천 여행 일정 관리</h2>
          <p className="text-sm text-gray-600 mt-1">사용자에게 추천할 여행 일정을 생성하고 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchItineraries}
            variant="outline"
            className="border-2 border-black rounded-none hover:bg-gray-100 h-12"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-black text-white rounded-none hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold h-12"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 추천 일정 만들기
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '총 추천 일정', value: summary.totalItineraries, icon: MapPin },
          { label: '활성 일정', value: summary.activeItineraries, icon: Star },
          { label: '총 조회수', value: summary.totalViewCount.toLocaleString(), icon: Eye },
          { label: '총 예약수', value: summary.totalBookingCount.toLocaleString(), icon: TrendingUp }
        ].map((stat) => (
          <Card key={stat.label} className="border-2 border-black shadow-none rounded-none hover:bg-black hover:text-white transition-colors group">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="제목, 도시, 설명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-2 border-black rounded-none h-12 focus-visible:ring-0 focus-visible:border-black"
        />
      </div>

      {/* Itineraries Grid - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItineraries.map((itinerary, index) => (
          <motion.div
            key={itinerary.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group h-full flex flex-col">
              {/* Image */}
              <div className="w-full h-48 border-b-2 border-black overflow-hidden relative">
                {itinerary.imageUrl && !imageErrors.has(itinerary.id) ? (
                  <img
                    src={itinerary.imageUrl}
                    alt={itinerary.title}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(itinerary.id));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">No Image</span>
                  </div>
                )}
                {/* Badges overlay */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                  {itinerary.featured && (
                    <Badge className="bg-yellow-400 text-black border border-black text-xs px-1.5 py-0.5">
                      FEATURED
                    </Badge>
                  )}
                  <Badge
                    className={`border border-black text-xs px-1.5 py-0.5 ${
                      itinerary.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {itinerary.active ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold mb-1 line-clamp-1">{itinerary.title}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>

                {/* Meta info - compact 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="font-medium truncate">{itinerary.cities[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{itinerary.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{itinerary.viewCount}</span>
                  </div>
                </div>

                {/* Interest tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {itinerary.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="text-[10px] bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 uppercase"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>

                {/* Actions - compact horizontal */}
                <div className="mt-auto pt-3 border-t border-gray-200 flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(itinerary)}
                    className="flex-1 h-8 border border-black rounded-none hover:bg-black hover:text-white text-xs font-bold"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFeatured(itinerary.id)}
                    disabled={updatingStatus === itinerary.id}
                    className={`h-8 w-8 p-0 border border-black rounded-none ${
                      itinerary.featured ? 'bg-yellow-400' : 'bg-white hover:bg-yellow-100'
                    }`}
                  >
                    {updatingStatus === itinerary.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(itinerary.id)}
                    disabled={loadingDetail === itinerary.id}
                    className="h-8 w-8 p-0 border border-gray-300 rounded-none hover:bg-gray-100"
                  >
                    {loadingDetail === itinerary.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : expandedItineraries.has(itinerary.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(itinerary.id)}
                    disabled={deleting === itinerary.id}
                    className="h-8 w-8 p-0 border border-red-400 text-red-600 rounded-none hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    {deleting === itinerary.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    활성화
                    {updatingStatus === itinerary.id && (
                      <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                    )}
                  </Label>
                  <Switch
                    checked={itinerary.active}
                    onCheckedChange={() => handleToggleActive(itinerary.id)}
                    disabled={updatingStatus === itinerary.id}
                  />
                </div>
              </div>

              {/* Expanded Schedule - Full width below card */}
              {expandedItineraries.has(itinerary.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t-2 border-black bg-gray-50 p-3 space-y-2"
                >
                  {itinerary.days.map((day) => (
                    <div key={day.day} className="border border-black bg-white p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs">
                          {day.day}
                        </div>
                        <h4 className="font-bold text-xs">{day.title}</h4>
                      </div>
                      <div className="space-y-1">
                        {day.activities.slice(0, 2).map((activity, actIdx) => (
                          <div
                            key={actIdx}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{activity.time}</span>
                            <span className="truncate">{activity.activity}</span>
                          </div>
                        ))}
                        {day.activities.length > 2 && (
                          <p className="text-xs text-gray-400">+{day.activities.length - 2} more activities</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItineraries.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}