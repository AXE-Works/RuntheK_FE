import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Library, Plus, Loader2, Pencil, Trash2, Check } from 'lucide-react';

import {
  PromptType,
  PromptTemplate,
  PROMPT_TYPE_LABELS,
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  activatePrompt,
} from '@/services/promptApi';

export default function PromptManagement() {
  // State
  const [selectedType, setSelectedType] = useState<PromptType>('itinerary');
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [formName, setFormName] = useState('');
  const [formContent, setFormContent] = useState('');

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<PromptTemplate | null>(null);

  // Load prompts when type changes
  useEffect(() => {
    loadPrompts();
  }, [selectedType]);

  async function loadPrompts() {
    setIsLoading(true);
    try {
      const data = await getPrompts(selectedType);
      setPrompts(data);
    } catch (error) {
      console.error('[PromptManagement] Failed to load prompts:', error);
      toast.error('프롬프트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle type change
  function handleTypeChange(value: string) {
    setSelectedType(value as PromptType);
    // Reset form when changing type
    handleCancelEdit();
  }

  // Handle edit button click
  function handleEdit(prompt: PromptTemplate) {
    setEditingPrompt(prompt);
    setFormName(prompt.name);
    setFormContent(prompt.content);
  }

  // Handle cancel edit
  function handleCancelEdit() {
    setEditingPrompt(null);
    setFormName('');
    setFormContent('');
  }

  // Handle save (create or update)
  async function handleSave() {
    if (!formName.trim()) {
      toast.error('프롬프트 이름을 입력해주세요.');
      return;
    }
    if (!formContent.trim()) {
      toast.error('프롬프트 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPrompt) {
        // Update existing prompt
        await updatePrompt(editingPrompt.id, {
          name: formName.trim(),
          content: formContent.trim(),
        });
        toast.success('프롬프트가 수정되었습니다.');
      } else {
        // Create new prompt
        await createPrompt({
          promptType: selectedType,
          name: formName.trim(),
          content: formContent.trim(),
        });
        toast.success('새 프롬프트가 생성되었습니다.');
      }
      handleCancelEdit();
      await loadPrompts();
    } catch (error) {
      console.error('[PromptManagement] Save failed:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  // Handle activate
  async function handleActivate(id: string) {
    setActivatingId(id);
    try {
      await activatePrompt(id);
      toast.success('프롬프트가 활성화되었습니다.');
      await loadPrompts();
    } catch (error) {
      console.error('[PromptManagement] Activate failed:', error);
      toast.error('활성화에 실패했습니다.');
    } finally {
      setActivatingId(null);
    }
  }

  // Handle delete button click (open confirmation dialog)
  function handleDeleteClick(prompt: PromptTemplate) {
    setPromptToDelete(prompt);
    setDeleteDialogOpen(true);
  }

  // Handle delete confirmation
  async function handleDeleteConfirm() {
    if (!promptToDelete) return;

    setDeletingId(promptToDelete.id);
    setDeleteDialogOpen(false);

    try {
      await deletePrompt(promptToDelete.id);
      toast.success('프롬프트가 삭제되었습니다.');
      // If we were editing this prompt, cancel edit
      if (editingPrompt?.id === promptToDelete.id) {
        handleCancelEdit();
      }
      await loadPrompts();
    } catch (error) {
      console.error('[PromptManagement] Delete failed:', error);
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다.';
      toast.error(message);
    } finally {
      setDeletingId(null);
      setPromptToDelete(null);
    }
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="border-2 border-black bg-white p-6 mt-6">
      <h3 className="text-xl font-black uppercase mb-6">AI 프롬프트 관리</h3>

      {/* Prompt Type Selector */}
      <div className="mb-6">
        <Label className="text-xs uppercase text-gray-400 tracking-widest mb-2 block">
          프롬프트 유형
        </Label>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-64 border-2 border-black rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROMPT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Prompts Library */}
        <Card className="border-2 border-black rounded-none shadow-none">
          <CardHeader className="bg-black text-white p-4">
            <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
              <Library className="h-5 w-5" />
              저장된 프롬프트
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>저장된 프롬프트가 없습니다.</p>
                <p className="text-sm mt-1">새 프롬프트를 작성해주세요.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`p-4 transition-colors ${
                      prompt.isActive
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'hover:bg-gray-50'
                    } ${editingPrompt?.id === prompt.id ? 'ring-2 ring-inset ring-black' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold truncate">{prompt.name}</span>
                          {prompt.isActive && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 flex items-center gap-1 shrink-0">
                              <Check className="h-3 w-3" />
                              사용중
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(prompt.updatedAt)}
                        </p>
                        <p className="text-xs text-gray-600 font-mono line-clamp-2 mt-2 break-all">
                          {prompt.content.slice(0, 120)}...
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {!prompt.isActive && (
                          <Button
                            size="sm"
                            className="bg-black text-white rounded-none hover:bg-gray-800 text-xs"
                            onClick={() => handleActivate(prompt.id)}
                            disabled={activatingId === prompt.id}
                          >
                            {activatingId === prompt.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              '활성화'
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-black rounded-none text-xs"
                          onClick={() => handleEdit(prompt)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          수정
                        </Button>
                        {!prompt.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-600 rounded-none hover:bg-red-600 hover:text-white text-xs"
                            onClick={() => handleDeleteClick(prompt)}
                            disabled={deletingId === prompt.id}
                          >
                            {deletingId === prompt.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 mr-1" />
                                삭제
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New/Edit Prompt Form */}
        <Card className="border-2 border-black rounded-none shadow-none">
          <CardHeader className="bg-black text-white p-4">
            <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingPrompt ? '프롬프트 수정' : '새 프롬프트 작성'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-xs uppercase text-gray-400 tracking-widest mb-2 block">
                프롬프트 이름
              </Label>
              <Input
                placeholder="예: 기본 일정 생성, 상세 비용 포함 버전..."
                className="border-2 border-gray-200 rounded-none focus:border-black"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-gray-400 tracking-widest mb-2 block">
                프롬프트 내용
              </Label>
              <Textarea
                className="min-h-[300px] border-2 border-gray-200 rounded-none font-mono text-sm focus:border-black resize-y"
                placeholder="AI에게 전달할 프롬프트 내용을 입력하세요...

예시 변수: {cities}, {duration}, {interests}, {budget}"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2">
                {formContent.length.toLocaleString()} 자
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {editingPrompt && (
                <Button
                  variant="outline"
                  className="border-black rounded-none"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  취소
                </Button>
              )}
              <Button
                className="bg-black text-white rounded-none hover:bg-gray-800"
                onClick={handleSave}
                disabled={isSaving || !formName.trim() || !formContent.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : editingPrompt ? (
                  '수정 저장'
                ) : (
                  '프롬프트 저장'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-2 border-black rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black uppercase">
              프롬프트 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{promptToDelete?.name}" 프롬프트를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black rounded-none">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white rounded-none hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
