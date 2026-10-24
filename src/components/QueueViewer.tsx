import React from 'react';
import type { StepSnapshot } from '../types/graph';
import { Layers, ArrowRight, CheckCircle2, User, Activity } from 'lucide-react';

interface QueueViewerProps {
  currentStep: StepSnapshot | null;
  className?: string;
}

export const QueueViewer: React.FC<QueueViewerProps> = ({ currentStep, className = '' }) => {
  if (!currentStep) return null;

  const queue = currentStep.queue;
  const visited = currentStep.visited;

  const getActionBadge = (action: StepSnapshot['actionType']) => {
    switch (action) {
      case 'INIT':
        return 'bg-blue-600 text-white';
      case 'DEQUEUE':
        return 'bg-red-500 text-white animate-pulse';
      case 'DISCOVER_LAYER_1':
        return 'bg-emerald-600 text-white';
      case 'DISCOVER_LAYER_2':
        return 'bg-amber-500 text-white';
      case 'RECORD_MUTUAL':
        return 'bg-orange-600 text-white';
      case 'COMPLETE':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className={`flex flex-col justify-between gap-3 ${className}`}>
      {/* 1. THÔNG BÁO BƯỚC ĐANG XỬ LÝ (ĐẬM ĐÀ, RÕ RÀNG) */}
      <div className="app-card p-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 border border-blue-900/50 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getActionBadge(
                currentStep.actionType
              )}`}
            >
              {currentStep.actionType}
            </span>
            <span className="text-xs font-bold text-blue-300">
              Bước #{currentStep.stepIndex + 1}
            </span>
          </div>

          <div className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-blue-300 font-semibold shadow-2xs">
            Phạm vi:{' '}
            <strong className="text-blue-400">
              {currentStep.currentDepth === 0
                ? 'Tài khoản gốc'
                : currentStep.currentDepth === 1
                ? 'Tầng 1 (Bạn bè)'
                : 'Tầng 2 (Gợi ý)'}
            </strong>
          </div>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{currentStep.title}</span>
          </h3>
          <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
            {currentStep.description}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Hành động:{' '}
            <strong className="text-slate-200">
              {currentStep.actionType === 'DEQUEUE'
                ? 'Lấy đỉnh ra từ Queue'
                : currentStep.actionType === 'DISCOVER_LAYER_1'
                ? 'Tìm thấy bạn trực tiếp'
                : currentStep.actionType === 'DISCOVER_LAYER_2'
                ? 'Ghi nhận ứng viên đề xuất'
                : currentStep.actionType === 'COMPLETE'
                ? 'Đã duyệt xong'
                : 'Khởi tạo hàng đợi'}
            </strong>
          </span>
          <span className="text-blue-400 font-semibold">Tầng d={currentStep.currentDepth}</span>
        </div>
      </div>

      {/* 2. HÀNG ĐỢI BFS (FIFO QUEUE) - NỘI DUNG ĐẦY ĐẶN */}
      <div className="app-card p-4 bg-slate-900 border border-slate-800 shadow-md flex-1 flex flex-col justify-between min-h-[120px]">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>Hàng đợi chờ duyệt (FIFO Queue)</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80 font-bold">
                {queue.length}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Vào trước ra trước (FIFO)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
            {queue.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 italic w-full text-center bg-slate-800/50 rounded-lg border border-slate-700/60">
                Hàng đợi đang rỗng (Đã duyệt xong các tầng)
              </div>
            ) : (
              queue.map((item, idx) => {
                const isFront = idx === 0;
                const depthColor =
                  item.depth === 0
                    ? 'bg-blue-600'
                    : item.depth === 1
                    ? 'bg-emerald-600'
                    : 'bg-amber-600';

                return (
                  <div
                    key={`${item.nodeId}-${idx}`}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                      isFront
                        ? 'bg-red-950/70 border-red-800 text-red-200 font-bold ring-2 ring-red-500/40 shadow-xs'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200 font-semibold'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${depthColor}`}
                    >
                      {item.nodeName.slice(0, 1)}
                    </div>
                    <span className="font-bold">{item.nodeName}</span>
                    {isFront ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black tracking-wider uppercase">
                        Đang xét
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-semibold">
                        d={item.depth}
                      </span>
                    )}
                    {idx < queue.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 font-medium">
          👉 Đỉnh ở đầu hàng đợi (Front) sẽ được Dequeue ra để kiểm tra danh sách bạn bè tiếp theo.
        </p>
      </div>

      {/* 3. DANH SÁCH ĐÃ KIỂM TRA (VISITED SET) - KÈM TIẾN ĐỘ */}
      <div className="app-card p-4 bg-slate-900 border border-slate-800 shadow-md flex-1 flex flex-col justify-between min-h-[115px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Danh sách đã kiểm tra (Visited)</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold">
                {visited.length} đỉnh
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Chống kiểm tra lặp vô tận</span>
          </div>

          <div className="flex flex-wrap gap-1.5 py-0.5">
            {visited.map((vId) => {
              const layer = currentStep.layerMap[vId];
              const badgeClass =
                layer === 0
                  ? 'bg-blue-950/70 text-blue-300 border-blue-800/70 font-bold'
                  : layer === 1
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70 font-bold'
                  : layer === 2
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/70 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <span
                  key={vId}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${badgeClass} shadow-2xs`}
                >
                  <User className="w-3 h-3 opacity-70" />
                  {vId.charAt(0).toUpperCase() + vId.slice(1)}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tiến độ bao phủ mạng lưới:</span>
          <span className="font-bold text-emerald-400">
            {visited.length} / 14 sinh viên ({Math.round((visited.length / 14) * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
