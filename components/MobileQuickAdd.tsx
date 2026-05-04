"use client";

import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ListTodo, Plus, Check } from "lucide-react";
import { BrainDumpItem } from "@/types";

interface MobileQuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTime: { hour: number; minute: number } | null;
}

export default function MobileQuickAdd({ open, onOpenChange, selectedTime }: MobileQuickAddProps) {
  const { brainDump, addTimeBlock } = useTimeboxerStore();
  
  // 미완료된 브레인 덤프 항목들
  const activeDumps = brainDump.filter(item => !item.isCompleted);

  const handleSelectTask = (item: BrainDumpItem) => {
    if (!selectedTime) return;

    const startTime = `${String(selectedTime.hour).padStart(2, "0")}:${String(selectedTime.minute).padStart(2, "0")}`;
    
    // 기본 30분 할당
    const endTotalMin = selectedTime.hour * 60 + selectedTime.minute + 30;
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    addTimeBlock({
      taskId: item.id,
      content: item.content,
      startTime,
      endTime,
      date: useTimeboxerStore.getState().selectedDate,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-t-[32px] sm:rounded-[32px] fixed bottom-0 sm:bottom-auto translate-y-0">
        <div className="bg-zinc-900 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-lg font-black tracking-tight text-white">
              {selectedTime ? `${String(selectedTime.hour).padStart(2, "0")}:${String(selectedTime.minute).padStart(2, "0")}에 작업 배치` : "작업 배치"}
            </DialogTitle>
          </div>
          <p className="text-zinc-400 text-[11px] font-medium">배치할 할 일을 선택해 주세요.</p>
        </div>

        <div className="p-4 bg-zinc-50 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {activeDumps.length === 0 ? (
              <div className="py-12 text-center">
                <ListTodo className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-400">배치할 미완료 할 일이 없습니다.</p>
              </div>
            ) : (
              activeDumps.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTask(item)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || '#94a3b8' }} />
                    <span className="text-sm font-bold text-zinc-800 truncate">{item.content}</span>
                  </div>
                  <Check className="w-4 h-4 text-zinc-300" />
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
