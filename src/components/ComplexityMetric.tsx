import React from 'react';
import type { StepSnapshot } from '../types/graph';
import { Users, UserCheck, Layers, Eye, BarChart3 } from 'lucide-react';

interface ComplexityMetricProps {
  currentStep: StepSnapshot | null;
  totalNodes: number;
  directFriends: string[];
  className?: string;
}

export const ComplexityMetric: React.FC<ComplexityMetricProps> = ({
  currentStep,
  totalNodes,
  directFriends,
  className = '',
}) => {
  const stats = currentStep?.stats || {
    totalStepsSoFar: 0,
    currentQueueLength: 0,
    maxQueueSize: 0,
    visitedCount: 0,
    layer1Count: 0,
    layer2CandidateCount: 0,
  };

  return (
    <div className={`app-card p-4 bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3 shadow-md ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Thống kê tiến trình tìm kiếm</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Tổng mạng lưới: <strong className="text-slate-200">{totalNodes} người</strong>
        </span>
      </div>

      {/* Lưới 2x2 cân đối, chữ và số to rõ ràng, không bị chèn ép */}
      <div className="grid grid-cols-2 gap-2.5 flex-1 items-stretch">
        {/* 1. Bạn bè trực tiếp (Emerald) */}
        <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <span>Bạn bè trực tiếp</span>
          </div>
          <div className="text-2xl font-black text-emerald-200 my-0.5">
            {directFriends.length} <span className="text-xs font-normal text-emerald-400">người</span>
          </div>
          <div className="text-[11px] text-emerald-300/90 font-semibold truncate">
            {directFriends.join(', ')}
          </div>
        </div>

        {/* 2. Người được gợi ý (Amber) */}
        <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/60 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span>Gợi ý (Tầng 2)</span>
          </div>
          <div className="text-2xl font-black text-amber-200 my-0.5">
            {stats.layer2CandidateCount} <span className="text-xs font-normal text-amber-400">người</span>
          </div>
          <div className="text-[11px] text-amber-300/80 font-medium">
            Có bạn chung chưa kết nối
          </div>
        </div>

        {/* 3. Đã kiểm tra (Blue) */}
        <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-800/60 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span>Đã kiểm tra</span>
          </div>
          <div className="text-2xl font-black text-blue-200 my-0.5">
            {stats.visitedCount} <span className="text-xs font-normal text-blue-400">/ {totalNodes}</span>
          </div>
          <div className="text-[11px] text-blue-300/80 font-medium">
            Đỉnh đã duyệt qua BFS
          </div>
        </div>

        {/* 4. Hàng đợi (Indigo / Purple) */}
        <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/60 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>Hàng đợi chờ</span>
          </div>
          <div className="text-2xl font-black text-indigo-200 my-0.5">
            {stats.currentQueueLength} <span className="text-xs font-normal text-indigo-400">người</span>
          </div>
          <div className="text-[11px] text-indigo-300/80 font-medium">
            Chờ lấy ra duyệt tiếp
          </div>
        </div>
      </div>
    </div>
  );
};
