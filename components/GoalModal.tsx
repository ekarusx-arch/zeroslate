"use client";

import { useEffect, useState } from "react";
import { useTimeboxerStore } from "@/store/useTimeboxerStore";
import { Goal, GoalType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Plus, Trash2, CheckCircle2, Circle, Trophy } from "lucide-react";

export default function GoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { goals, addGoal, deleteGoal, toggleGoal, updateGoal } = useTimeboxerStore();
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<GoalType>("monthly");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-goal-modal", handleOpen);
    return () => window.removeEventListener("open-goal-modal", handleOpen);
  }, []);

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    await addGoal(newGoalTitle, newGoalType, selectedColor);
    setNewGoalTitle("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-zinc-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Long-term Goals</h2>
          </div>
          <p className="text-zinc-400 text-xs font-medium">단기적인 일과를 넘어, 당신이 도달하고 싶은 더 큰 목표를 관리하세요.</p>
        </div>

        <div className="p-8 space-y-8 bg-white">
          {/* 입력 영역 */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">New Goal</span>
              <div className="flex gap-2">
                <input
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="예: 이번 달 독서 4권 하기"
                  className="flex-1 h-12 px-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                />
                <Button onClick={handleAddGoal} className="h-12 w-12 rounded-2xl bg-zinc-900 hover:bg-black p-0 shadow-lg active:scale-95 transition-all">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button
                  onClick={() => setNewGoalType("monthly")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${newGoalType === 'monthly' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
                >
                  MONTHLY
                </button>
                <button
                  onClick={() => setNewGoalType("quarterly")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${newGoalType === 'quarterly' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
                >
                  QUARTERLY
                </button>
              </div>
              <div className="flex gap-1.5">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColor === c ? 'border-zinc-900 scale-110' : 'border-transparent scale-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 리스트 영역 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Goal List ({goals.length})</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {goals.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Target className="w-8 h-8 text-zinc-200 mx-auto" />
                  <p className="text-xs font-bold text-zinc-300">등록된 목표가 없습니다.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${goal.isCompleted ? 'bg-zinc-50 border-zinc-100 opacity-60' : 'bg-white border-zinc-100 hover:border-blue-200 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={() => toggleGoal(goal.id)} className="shrink-0 text-zinc-300 hover:text-blue-500 transition-colors">
                        {goal.isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${goal.type === 'monthly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {goal.type}
                          </span>
                          {goal.isCompleted && <span className="text-[8px] font-bold text-green-600">DONE</span>}
                        </div>
                        <p className={`text-sm font-bold truncate ${goal.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                          {goal.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
