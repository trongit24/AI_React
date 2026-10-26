import React, { useState } from 'react';
import type { CandidateScore } from '../types/graph';
import { UserPlus, Check, Users, Sparkles, X, Flame, Search } from 'lucide-react';

interface RecommendationPanelProps {
  recommendations: CandidateScore[];
  sourceName: string;
  onHighlightCandidate: (candidateId: string | null) => void;
  selectedCandidateId: string | null;
  activeCandidateId?: string | null;
  isComplete?: boolean;
  currentStepIndex?: number;
  totalSteps?: number;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  sourceName,
  onHighlightCandidate,
  selectedCandidateId,
  activeCandidateId,
  isComplete,
  currentStepIndex = 0,
  totalSteps = 1,
}) => {
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleSendInvite = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvitedIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  const handleDismiss = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(candidateId));
  };

  const visibleRecommendations = recommendations.filter((r) => !dismissedIds.has(r.candidateId));

  return (
    <div className="app-card p-4 sm:p-5 bg-slate-900 flex flex-col border border-slate-800 shadow-md rounded-2xl">
      {/* Tiêu đề thân thiện & có trạng thái tiến trình */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white leading-tight">
                Những người bạn có thể biết
              </h3>
              {isComplete ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  Hoàn tất tìm kiếm
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  Đang phát hiện theo bước {currentStepIndex + 1}/{totalSteps}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {visibleRecommendations.length === 0 ? (
                <span>Đang duyệt mô phỏng BFS... Chưa phát hiện bạn chung ở bước này.</span>
              ) : (
                <span>
                  Gợi ý kết bạn cho <strong className="text-blue-400">{sourceName}</strong> (tìm thấy{' '}
                  <strong className="text-amber-300">{visibleRecommendations.length}</strong> ứng viên có bạn chung)
                </span>
              )}
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-800/80">
          {visibleRecommendations.length} gợi ý
        </span>
      </div>

      {/* Danh sách người dùng gợi ý hiển thị dần theo từng bước */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {visibleRecommendations.length === 0 ? (
          <div className="col-span-full py-10 px-4 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700/80 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
              <Search className="w-5 h-5 text-amber-400/80 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-300">
              Chưa phát hiện bạn chung ở bước hiện tại ({currentStepIndex + 1} / {totalSteps})
            </p>
            <p className="text-[11px] text-slate-400 max-w-md">
              Khi thuật toán duyệt đến <strong>Tầng 2 (bạn của bạn bè)</strong>, các ứng viên sẽ xuất hiện tại đây theo thời gian thực kèm số lượng bạn chung!
            </p>
          </div>
        ) : (
          visibleRecommendations.map((item) => {
            const isSelected = selectedCandidateId === item.candidateId;
            const isInvited = invitedIds.has(item.candidateId);
            const isTop1 = item.rank === 1;
            const isCurrentlyActive = activeCandidateId === item.candidateId;

            return (
              <div
                key={item.candidateId}
                onClick={() =>
                  onHighlightCandidate(isSelected ? null : item.candidateId)
                }
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/70 shadow-sm ring-2 ring-amber-400/50'
                    : isCurrentlyActive
                    ? 'border-amber-400 bg-amber-950/50 shadow-md ring-2 ring-amber-400/80 animate-pulse'
                    : isTop1
                    ? 'bg-gradient-to-r from-amber-950/50 via-slate-800/90 to-slate-800 border-amber-500/50 shadow-2xs hover:border-amber-400'
                    : 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800 shadow-2xs'
                }`}
              >
                {/* Huy hiệu vừa cập nhật nếu đang ở bước xét người này */}
                {isCurrentlyActive && (
                  <span className="absolute -top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black shadow-xs tracking-tight">
                    ✨ Đang xét duyệt
                  </span>
                )}

                <div className="flex items-start justify-between gap-3">
                  {/* Avatar và thông tin */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 ring-2 ring-amber-400/40 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                        {item.candidateName.slice(0, 1)}
                      </div>
                      {isTop1 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs">
                          <Flame className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        {item.candidateName}
                        {isTop1 && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black tracking-wide flex items-center gap-0.5 shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5" /> TOP 1
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{item.candidateRole}</p>

                      {/* Bạn chung */}
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-800/80">
                          {item.mutualFriendsCount} bạn chung
                        </span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
                          ({item.mutualFriends.join(', ')})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút thao tác */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => handleSendInvite(item.candidateId, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        isInvited
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xs'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Đã gửi
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" /> Thêm bạn
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDismiss(item.candidateId, e)}
                      title="Gỡ gợi ý"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
