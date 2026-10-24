import React from 'react';
import type { StudentNode } from '../types/graph';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  User,
  UserCheck,
} from 'lucide-react';

interface ControlBarProps {
  nodes: StudentNode[];
  selectedSourceId: string;
  onSelectSource: (sourceId: string) => void;
  directFriends: string[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onJumpToEnd: () => void;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  onChangeSpeed: (speed: number) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  nodes,
  selectedSourceId,
  onSelectSource,
  directFriends,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  currentStepIndex,
  totalSteps,
  speed,
  onChangeSpeed,
}) => {
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="app-card p-3.5 sm:p-4 bg-slate-900 border-slate-800 text-slate-100 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Chọn người dùng đang xem & Hiển thị số lượng bạn bè trực tiếp */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <User className="w-4 h-4 text-blue-400" />
              <span>Tài khoản đang xem:</span>
            </div>

            <select
              value={selectedSourceId}
              onChange={(e) => onSelectSource(e.target.value)}
              disabled={isPlaying}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name} ({node.role})
                </option>
              ))}
            </select>
          </div>

          {/* Huy hiệu số bạn bè trực tiếp hiển thị rõ ràng */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-200 shadow-2xs">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Có <strong className="text-emerald-300 font-bold">{directFriends.length}</strong> bạn bè trực tiếp:</span>
            <span className="font-bold text-emerald-100">{directFriends.join(', ')}</span>
          </div>
        </div>

        {/* Nút điều khiển quen thuộc */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            disabled={currentStepIndex === 0}
            title="Làm mới lại từ đầu"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevStep}
            disabled={currentStepIndex === 0 || isPlaying}
            title="Lùi 1 bước"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white ring-1 ring-blue-400/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Tự động chạy
              </>
            )}
          </button>

          <button
            onClick={onNextStep}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            title="Tiến 1 bước"
            className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 transition-colors shadow-2xs"
          >
            <span>Tiếp theo</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tốc độ điều chỉnh: Chậm (0.5x), Vừa (0.75x), Nhanh (1x) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium">Tốc độ:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[
              { val: 0.5, label: 'Chậm (0.5x)' },
              { val: 0.75, label: 'Vừa (0.75x)' },
              { val: 1, label: 'Nhanh (1x)' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => onChangeSpeed(val)}
                className={`px-2 py-0.5 rounded-md text-xs font-bold transition-colors ${
                  speed === val
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Thanh tiến trình đơn giản */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60 shrink-0">
          Bước {currentStepIndex + 1} / {totalSteps}
        </span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
          {Math.round(progressPercent)}%
        </span>
      </div>
    </div>
  );
};
