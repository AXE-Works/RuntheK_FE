import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Library, History, Loader2, Pencil, ChevronRight, Check, Plus } from 'lucide-react';

import {
  PromptTemplate,
  getPrompts,
  getPromptHistory,
  updatePrompt,
  createPromptVersion,
} from '@/services/promptApi';

export default function PromptManagement() {
  // State
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Selected prompt and history
  const [selectedPromptName, setSelectedPromptName] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptTemplate[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form state
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [formContent, setFormContent] = useState('');

  // New version modal state
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState('');
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);


  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    setIsLoading(true);
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('[PromptManagement] Failed to load prompts:', error);
      toast.error('프롬프트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  // Get unique prompts by name (latest version only)
  const uniquePrompts = prompts.reduce((acc, prompt) => {
    const existing = acc.find(p => p.name === prompt.name);
    if (!existing || prompt.version > existing.version) {
      return [...acc.filter(p => p.name !== prompt.name), prompt];
    }
    return acc;
  }, [] as PromptTemplate[]);

  // Handle prompt selection - load history
  async function handleSelectPrompt(promptName: string) {
    if (selectedPromptName === promptName) return;

    setSelectedPromptName(promptName);
    setEditingPrompt(null);
    setFormContent('');
    setIsLoadingHistory(true);

    try {
      const historyData = await getPromptHistory(promptName);
      setHistory(historyData);
    } catch (error) {
      console.error('[PromptManagement] Failed to load history:', error);
      toast.error('히스토리를 불러오는데 실패했습니다.');
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  // Handle edit button click (from history)
  function handleEdit(prompt: PromptTemplate) {
    setEditingPrompt(prompt);
    setFormContent(prompt.content);
  }

  // Handle cancel edit
  function handleCancelEdit() {
    setEditingPrompt(null);
    setFormContent('');
  }

  // Handle save (update prompt)
  async function handleSave() {
    if (!formContent.trim()) {
      toast.error('프롬프트 내용을 입력해주세요.');
      return;
    }

    if (!editingPrompt) {
      toast.error('수정할 프롬프트가 선택되지 않았습니다.');
      return;
    }

    setIsSaving(true);
    try {
      // Update existing prompt
      await updatePrompt(editingPrompt.id, {
        content: formContent.trim(),
      });
      toast.success('프롬프트가 수정되었습니다.');
      // Reload history after update
      if (selectedPromptName) {
        const historyData = await getPromptHistory(selectedPromptName);
        setHistory(historyData);
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

  // Handle create new version
  async function handleCreateNewVersion() {
    if (!newVersionContent.trim()) {
      toast.error('프롬프트 내용을 입력해주세요.');
      return;
    }

    if (!selectedPromptName) {
      toast.error('프롬프트가 선택되지 않았습니다.');
      return;
    }

    setIsCreatingVersion(true);
    try {
      await createPromptVersion(selectedPromptName, newVersionContent.trim());
      toast.success('새 버전이 생성되었습니다.');
      setNewVersionModalOpen(false);
      setNewVersionContent('');
      // Reload history
      const historyData = await getPromptHistory(selectedPromptName);
      setHistory(historyData);
      await loadPrompts();
    } catch (error) {
      console.error('[PromptManagement] Create version failed:', error);
      toast.error('새 버전 생성에 실패했습니다.');
    } finally {
      setIsCreatingVersion(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Prompts Library */}
        <Card className="border-2 border-black rounded-none shadow-none !gap-0">
          <CardHeader className="bg-black text-white p-4">
            <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
              <Library className="h-5 w-5" />
              저장된 프롬프트
            </CardTitle>
          </CardHeader>
          <CardContent className="!p-0 !pt-0 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : uniquePrompts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>저장된 프롬프트가 없습니다.</p>
                <p className="text-sm mt-1">새 프롬프트를 작성해주세요.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {uniquePrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`p-4 transition-colors cursor-pointer ${
                      selectedPromptName === prompt.name
                        ? 'bg-gray-100 border-l-4 border-black'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectPrompt(prompt.name)}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold truncate block">{prompt.name}</span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(prompt.updatedAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History / Edit Panel */}
        <Card className="border-2 border-black rounded-none shadow-none !gap-0">
          <CardHeader className="bg-black text-white p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                <History className="h-5 w-5" />
                {editingPrompt
                  ? '프롬프트 수정'
                  : selectedPromptName
                  ? `${selectedPromptName} 히스토리`
                  : '프롬프트를 선택하세요'}
              </CardTitle>
              {selectedPromptName && !editingPrompt && (
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 rounded-none text-xs"
                  onClick={() => setNewVersionModalOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  새 버전
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="!p-0 !pt-0 max-h-[500px] overflow-y-auto">
            {editingPrompt ? (
              // Edit Form
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-xs uppercase text-gray-400 tracking-widest mb-2 block">
                    프롬프트 내용
                  </Label>
                  <Textarea
                    className="min-h-[250px] border-2 border-gray-200 rounded-none font-mono text-sm focus:border-black resize-y"
                    placeholder="AI에게 전달할 프롬프트 내용을 입력하세요..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {formContent.length.toLocaleString()} 자
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="border-black rounded-none"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                  <Button
                    className="bg-black text-white rounded-none hover:bg-gray-800"
                    onClick={handleSave}
                    disabled={isSaving || !formContent.trim()}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      '수정 저장'
                    )}
                  </Button>
                </div>
              </div>
            ) : isLoadingHistory ? (
              // Loading state
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : !selectedPromptName ? (
              // No selection
              <div className="text-center py-12 text-gray-400">
                <p>좌측에서 프롬프트를 선택하세요.</p>
                <p className="text-sm mt-1">버전 히스토리를 확인할 수 있습니다.</p>
              </div>
            ) : history.length === 0 ? (
              // No history
              <div className="text-center py-12 text-gray-400">
                <p>히스토리가 없습니다.</p>
              </div>
            ) : (
              // History list
              <div className="divide-y divide-gray-200">
                {history.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 transition-colors ${
                      version.isActive ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">v{version.version}</span>
                          {version.isActive && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 flex items-center gap-1 shrink-0">
                              <Check className="h-3 w-3" />
                              사용중
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(version.updatedAt)}
                        </p>
                        <p className="text-xs text-gray-600 font-mono line-clamp-2 mt-2 break-all">
                          {version.content.length > 100 ? `${version.content.slice(0, 100)}...` : version.content}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-black rounded-none text-xs shrink-0"
                        onClick={() => handleEdit(version)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        수정
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Version Modal */}
      <Dialog open={newVersionModalOpen} onOpenChange={setNewVersionModalOpen}>
        <DialogContent className="border-2 border-black rounded-none max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase">
              새 버전 작성 - {selectedPromptName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase text-gray-400 tracking-widest mb-2 block">
                프롬프트 내용
              </Label>
              <Textarea
                className="min-h-[300px] border-2 border-gray-200 rounded-none font-mono text-sm focus:border-black resize-y"
                placeholder="새 버전의 프롬프트 내용을 입력하세요..."
                value={newVersionContent}
                onChange={(e) => setNewVersionContent(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2">
                {newVersionContent.length.toLocaleString()} 자
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-black rounded-none"
              onClick={() => {
                setNewVersionModalOpen(false);
                setNewVersionContent('');
              }}
              disabled={isCreatingVersion}
            >
              취소
            </Button>
            <Button
              className="bg-black text-white rounded-none hover:bg-gray-800"
              onClick={handleCreateNewVersion}
              disabled={isCreatingVersion || !newVersionContent.trim()}
            >
              {isCreatingVersion ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                '새 버전 생성'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
