"use client";

import { useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2, Repeat, Tag, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeId } from "@/types";

// 서브 컴포넌트 임포트
import TimelineTab from "../settings/TimelineTab";
import RoutinesTab from "../settings/RoutinesTab";
import TagsTab from "../settings/TagsTab";
import ThemeTab from "../settings/ThemeTab";

export default function SettingsModal() {
  const settings = useTimeboxerStore((s) => s.settings);
  const updateSettings = useTimeboxerStore((s) => s.updateSettings);
  const userPlan = useTimeboxerStore((s) => s.userPlan);
  const routines = useTimeboxerStore((s) => s.routines);
  const addRoutine = useTimeboxerStore((s) => s.addRoutine);
  const deleteRoutine = useTimeboxerStore((s) => s.deleteRoutine);
  const updateRoutine = useTimeboxerStore((s) => s.updateRoutine);
  const initialize = useTimeboxerStore((s) => s.initialize);

  const [open, setOpen] = useState(false);
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  // 타임라인 설정 로컬 상태
  const [localStart, setLocalStart] = useState(settings.startTime);
  const [localEnd, setLocalEnd] = useState(settings.endTime);
  const [localStep, setLocalStep] = useState(settings.step);

  const handleOpen = (v: boolean) => {
    if (v) {
      setLocalStart(settings.startTime);
      setLocalEnd(settings.endTime);
      setLocalStep(settings.step);
      setThemeNotice(null);
    }
    setOpen(v);
  };

  const handleSaveSettings = () => {
    if (localStart >= localEnd) return;
    updateSettings({ startTime: localStart, endTime: localEnd, step: localStep });
  };

  const handleSelectTheme = (theme: ThemeId, isPro: boolean) => {
    if (isPro && userPlan !== "pro") {
      setThemeNotice("Premium 테마는 Pro 플랜에서 사용할 수 있습니다.");
      return;
    }
    setThemeNotice(null);
    updateSettings({ theme });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 h-[33px] px-[14px] rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600 hover:bg-zinc-50 font-semibold transition-all active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
        aria-label="설정 열기"
      >
        <Settings2 className="w-3.5 h-3.5" />
        설정
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-lg h-[90vh] sm:h-[680px] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl rounded-t-[28px] sm:rounded-3xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="w-4 h-4 text-zinc-500" />
            앱 설정
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 border-b border-zinc-100 bg-zinc-50/30">
            <TabsList className="w-full bg-zinc-200/50 p-1 rounded-xl h-11 mt-4 mb-3">
              <TabsTrigger value="timeline" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Settings2 className="w-3.5 h-3.5 mr-1" /> 타임라인
              </TabsTrigger>
              <TabsTrigger value="routines" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Repeat className="w-3.5 h-3.5 mr-1" /> 루틴
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Tag className="w-3.5 h-3.5 mr-1" /> 스마트 태그
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> 테마
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <TabsContent value="timeline" className="mt-0">
              <TimelineTab
                localStart={localStart}
                localEnd={localEnd}
                localStep={localStep}
                setLocalStart={setLocalStart}
                setLocalEnd={setLocalEnd}
                setLocalStep={setLocalStep}
                handleSaveSettings={handleSaveSettings}
              />
            </TabsContent>

            <TabsContent value="routines" className="mt-0">
              <RoutinesTab
                routines={routines}
                addRoutine={addRoutine}
                deleteRoutine={deleteRoutine}
                updateRoutine={updateRoutine}
              />
            </TabsContent>

            <TabsContent value="tags" className="mt-0">
              <TagsTab
                customTags={settings.customTags || []}
                userPlan={userPlan}
                updateSettings={updateSettings}
                initialize={initialize}
              />
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <ThemeTab
                currentTheme={settings.theme || "classic"}
                bgMood={settings.bgMood || "none"}
                userPlan={userPlan}
                handleSelectTheme={handleSelectTheme}
                updateSettings={updateSettings}
                themeNotice={themeNotice}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
