"use client";

import { useState } from "react";
import { Plus, Tag, Edit2, X, Lock, RotateCw, ChevronUp, ChevronDown, Palette } from "lucide-react";
import { PRESET_COLORS, Settings } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagsTabProps {
  customTags: { tag: string; color: string }[];
  userPlan: string;
  updateSettings: (s: Partial<Settings>) => void;
  initialize: () => Promise<void>;
}

export default function TagsTab({
  customTags,
  userPlan,
  updateSettings,
  initialize,
}: TagsTabProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[1].value);
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  // 태그 수정 상태
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");

  const handleAddCustomTag = () => {
    if (userPlan !== "pro") {
      setThemeNotice("스마트 태그 추가와 커스텀 색상은 Pro 플랜에서 사용할 수 있습니다.");
      return;
    }

    if (!newTagName.trim()) return;
    const tag = newTagName.startsWith("#") ? newTagName.trim() : `#${newTagName.trim()}`;
    if (customTags?.some(t => t.tag === tag)) return;

    setThemeNotice(null);
    updateSettings({
      customTags: [...(customTags || []), { tag, color: newTagColor }]
    });
    setNewTagName("");
  };

  const handleDeleteCustomTag = (tag: string) => {
    updateSettings({
      customTags: (customTags || []).filter(t => t.tag !== tag)
    });
  };

  const handleMoveCustomTag = (tag: string, direction: 'up' | 'down') => {
    const tags = [...(customTags || [])];
    const index = tags.findIndex(t => t.tag === tag);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tags.length) return;
    
    const temp = tags[index];
    tags[index] = tags[newIndex];
    tags[newIndex] = temp;
    
    updateSettings({ customTags: tags });
  };

  const handleUpdateCustomTag = () => {
    if (!editingTag || !editTagName.trim()) return;
    const tagText = editTagName.startsWith("#") ? editTagName.trim() : `#${editTagName.trim()}`;
    
    const tags = (customTags || []).map(t => 
      t.tag === editingTag ? { tag: tagText, color: editTagColor } : t
    );
    updateSettings({ customTags: tags });
    setEditingTag(null);
  };

  const handleResetTags = () => {
    const defaultTags = [
      { tag: "#개발", color: "#93C5FD" },
      { tag: "#운동", color: "#6EE7B7" },
      { tag: "#중요", color: "#FCA5A5" },
      { tag: "#기획", color: "#FDBA74" },
      { tag: "#작곡", color: "#C4B5FD" },
      { tag: "#휴식", color: "#FCD34D" },
      { tag: "#기타", color: "#F9A8D4" },
    ];
    updateSettings({ customTags: defaultTags });
    setThemeNotice("기본 스마트 태그가 복구되었습니다.");
  };

  return (
    <div className="space-y-6">
      {/* 커스텀 태그 추가 폼 */}
      <div className={`relative overflow-hidden rounded-xl border p-4 space-y-4 ${
        userPlan === "pro" ? "border-zinc-100 bg-zinc-50" : "border-amber-200 bg-amber-50/40"
      }`}>
        {userPlan !== "pro" && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-amber-800">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-xs font-black">스마트 태그 커스터마이징은 Pro 기능입니다.</p>
              <p className="mt-0.5 text-[11px] font-semibold text-amber-700/80">기본 태그 색상은 계속 사용할 수 있어요.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">새 스마트 태그</span>
          </div>
          {userPlan !== "pro" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-black text-white">
              <Lock className="h-3 w-3" />
              PRO
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="예: #공부, #미팅"
            className="h-10 text-sm bg-white flex-1"
            readOnly={userPlan !== "pro"}
            onFocus={() => {
              if (userPlan !== "pro") {
                setThemeNotice("스마트 태그 추가와 커스텀 색상은 Pro 플랜에서 사용할 수 있습니다.");
              }
            }}
          />
          <Button
            onClick={handleAddCustomTag}
            disabled={userPlan === "pro" && !newTagName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-lg text-sm font-bold shrink-0"
          >
            {userPlan === "pro" ? "추가" : <Lock className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">태그 색상</label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.filter(c => c.tag !== "").map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  if (userPlan !== "pro") {
                    setThemeNotice("태그 색상 커스터마이징은 Pro 플랜에서 사용할 수 있습니다.");
                    return;
                  }
                  setThemeNotice(null);
                  setNewTagColor(c.value);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  newTagColor === c.value ? "scale-110 border-zinc-400" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
            {/* 커스텀 컬러 피커 */}
            <div className="relative flex items-center">
              <input
                type="color"
                id="customTagColor"
                value={newTagColor}
                onChange={(e) => {
                  if (userPlan !== "pro") {
                    setThemeNotice("태그 색상 커스터마이징은 Pro 플랜에서 사용할 수 있습니다.");
                    return;
                  }
                  setThemeNotice(null);
                  setNewTagColor(e.target.value);
                }}
                className="sr-only"
              />
              <label
                htmlFor="customTagColor"
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-100 ${
                  !PRESET_COLORS.some(c => c.value === newTagColor) ? "border-blue-500 bg-blue-50 shadow-sm" : "border-zinc-200 bg-white"
                }`}
                title="직접 색상 선택"
              >
                <Palette className="w-4 h-4" style={{ color: newTagColor }} />
              </label>
              {!PRESET_COLORS.some(c => c.value === newTagColor) && (
                <span className="ml-2 text-[10px] font-mono font-bold text-blue-600 uppercase">
                  {newTagColor}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 커스텀 태그 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">스마트 태그 ({customTags.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={initialize}
              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-700 transition-colors flex items-center gap-1"
            >
              <RotateCw className="w-2.5 h-2.5" />
              서버 동기화
            </button>
            <button 
              onClick={handleResetTags}
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1"
            >
              기본값 복원
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {customTags.map((t, index) => {
            const isEditing = editingTag === t.tag;
            
            return (
              <div 
                key={`${t.tag}-${index}`}
                className={`flex flex-col justify-center p-2.5 bg-white border rounded-lg transition-all group ${
                  isEditing 
                    ? "border-blue-500 ring-1 ring-blue-500 shadow-md min-h-[70px]" 
                    : "border-zinc-100 hover:border-blue-200 shadow-sm h-[42px]"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color"
                        value={editTagColor}
                        onChange={(e) => setEditTagColor(e.target.value)}
                        className="w-4 h-4 rounded-full overflow-hidden cursor-pointer shrink-0 border-none p-0"
                      />
                      <Input 
                        value={editTagName}
                        onChange={(e) => setEditTagName(e.target.value)}
                        className="h-6 text-[11px] font-bold py-0 px-1.5 border-zinc-200 focus:border-blue-400"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setEditingTag(null)}
                        className="text-[9px] font-bold text-zinc-400 hover:text-zinc-600 px-1.5 py-0.5"
                      >
                        취소
                      </button>
                      <button 
                        onClick={handleUpdateCustomTag}
                        className="text-[9px] font-bold text-white bg-blue-500 hover:bg-blue-600 px-2 py-0.5 rounded shadow-sm transition-colors"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden pr-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="text-[11px] font-bold text-zinc-700 truncate">{t.tag}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={() => handleMoveCustomTag(t.tag, 'up')}
                        disabled={index === 0}
                        className="p-0.5 text-zinc-300 hover:text-blue-500 disabled:opacity-0"
                        title="위로 이동"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleMoveCustomTag(t.tag, 'down')}
                        disabled={index === customTags.length - 1}
                        className="p-0.5 text-zinc-300 hover:text-blue-500 disabled:opacity-0"
                        title="아래로 이동"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingTag(t.tag);
                          setEditTagName(t.tag);
                          setEditTagColor(t.color);
                        }}
                        className="p-0.5 text-zinc-300 hover:text-blue-500"
                        title="수정"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomTag(t.tag)}
                        className="p-0.5 text-zinc-300 hover:text-red-500"
                        title="삭제"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {customTags.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Tag className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-500">등록된 스마트 태그가 없습니다</p>
              <p className="text-[10px] text-zinc-400 mt-1">기본 태그를 불러오거나 직접 추가해보세요</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetTags}
              className="h-8 text-[11px] font-bold border-zinc-200 hover:bg-white"
            >
              기본 태그 불러오기
            </Button>
          </div>
        )}
      </div>

      {themeNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          {themeNotice}
        </div>
      )}
    </div>
  );
}
