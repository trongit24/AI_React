import React, { useState, useMemo } from 'react';
import type { GraphEdge, StudentNode } from '../types/graph';
import {
  UserCheck,
  UserPlus,
  Play,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Link,
  FastForward,
} from 'lucide-react';

interface FriendshipManagerProps {
  nodes: StudentNode[];
  edges: GraphEdge[];
  selectedSourceId: string;
  onToggleFriend: (sourceId: string, targetId: string) => void;
  onClearFriends: (sourceId: string) => void;
  onResetEdges: () => void;
  onRunDemo: () => void;
  onShowResultsImmediately: () => void;
  isPlaying: boolean;
}

export const FriendshipManager: React.FC<FriendshipManagerProps> = ({
  nodes,
  edges,
  selectedSourceId,
  onToggleFriend,
  onClearFriends,
  onResetEdges,
  onRunDemo,
  onShowResultsImmediately,
  isPlaying,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'friends' | 'non-friends'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Nối quan hệ giữa 2 người bất kỳ (chế độ nâng cao)
  const [customNodeA, setCustomNodeA] = useState<string>('');
  const [customNodeB, setCustomNodeB] = useState<string>('');

  const currentSourceNode = nodes.find((n) => n.id === selectedSourceId);
  const currentSourceName = currentSourceNode ? currentSourceNode.name : selectedSourceId;

  // Tập hợp ID các bạn bè trực tiếp của người đang chọn
  const directFriendIds = useMemo(() => {
    const ids = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === selectedSourceId) {
        ids.add(edge.target);
      } else if (edge.target === selectedSourceId) {
        ids.add(edge.source);
      }
    });
    return ids;
  }, [edges, selectedSourceId]);

  // Các người dùng còn lại (không bao gồm chính người đang chọn)
  const otherNodes = useMemo(() => {
    return nodes.filter((n) => n.id !== selectedSourceId);
  }, [nodes, selectedSourceId]);

  // Lọc theo tìm kiếm và trạng thái kết bạn
  const filteredNodes = useMemo(() => {
    return otherNodes.filter((node) => {
      const isFriend = directFriendIds.has(node.id);
      if (filterMode === 'friends' && !isFriend) return false;
      if (filterMode === 'non-friends' && isFriend) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(query) ||
          node.role.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [otherNodes, directFriendIds, filterMode, searchQuery]);

  // Kiểm tra 2 người trong ô kết nối nâng cao đã là bạn chưa
  const areCustomNodesFriends = useMemo(() => {
    if (!customNodeA || !customNodeB || customNodeA === customNodeB) return false;
    return edges.some(
      (e) =>
        (e.source === customNodeA && e.target === customNodeB) ||
        (e.source === customNodeB && e.target === customNodeA)
    );
  }, [edges, customNodeA, customNodeB]);

  return (
    <div className="app-card bg-slate-900 border border-slate-800 rounded-2xl shadow-lg transition-all overflow-hidden">
      {/* HEADER: Tiêu đề & Nút Thu gọn / Mở rộng */}
      <div
        className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                Thao tác chọn bạn bè cho <span className="text-blue-400">{currentSourceName}</span>
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                Tương tác trực tiếp
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chọn ai để kết bạn với {currentSourceName}, sau đó bấm <strong>Chạy Demo</strong> để tính toán danh sách bạn chung mới.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Huy hiệu số lượng bạn bè */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-300 font-bold">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đã kết bạn: {directFriendIds.size} / {otherNodes.length}</span>
          </div>

          {/* NÚT RUN CHÍNH NỔI BẬT */}
          <button
            onClick={onRunDemo}
            className="px-4 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
            title="Chạy mô phỏng thuật toán BFS để tìm bạn chung"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlaying ? 'Đang chạy demo...' : 'Chạy demo (Run)'}</span>
          </button>

          {/* Nút Xem ngay kết quả */}
          <button
            onClick={onShowResultsImmediately}
            className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Nhảy thẳng đến bước cuối cùng để xem ngay kết quả bạn chung"
          >
            <FastForward className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Xem ngay kết quả</span>
          </button>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* NỘI DUNG THAO TÁC (Có thể thu gọn) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* THANH CÔNG CỤ LỌC & HÀNH ĐỘNG NHANH */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Bộ lọc người dùng */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Hiển thị:</span>
              <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    filterMode === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tất cả ({otherNodes.length})
                </button>
                <button
                  onClick={() => setFilterMode('friends')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    filterMode === 'friends'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bạn của {currentSourceName} ({directFriendIds.size})
                </button>
                <button
                  onClick={() => setFilterMode('non-friends')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    filterMode === 'non-friends'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chưa kết bạn ({otherNodes.length - directFriendIds.size})
                </button>
              </div>

              <input
                type="text"
                placeholder="Tìm tên, lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-44"
              />
            </div>

            {/* Các nút thiết lập mẫu */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onClearFriends(selectedSourceId)}
                disabled={directFriendIds.size === 0}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/60 border border-rose-800/60 flex items-center gap-1 disabled:opacity-40 transition-colors"
                title="Hủy kết bạn tất cả để chọn lại từ danh sách trống"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hủy hết bạn</span>
              </button>

              <button
                onClick={onResetEdges}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 flex items-center gap-1 transition-colors"
                title="Khôi phục lại mạng lưới bạn bè mẫu ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Khôi phục mẫu gốc</span>
              </button>
            </div>
          </div>

          {/* LƯỚI DANH SÁCH NGƯỜI DÙNG ĐỂ CHỌN KẾT BẠN */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">
                Nhấn vào từng người để <strong>Kết bạn</strong> hoặc <strong>Hủy kết bạn</strong>:
              </span>
              <span className="text-[11px] text-slate-500 italic">
                *Đồ thị bên dưới sẽ lập tức cập nhật đường nối tương ứng
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredNodes.map((node) => {
                const isFriend = directFriendIds.has(node.id);

                return (
                  <div
                    key={node.id}
                    onClick={() => onToggleFriend(selectedSourceId, node.id)}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                      isFriend
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm hover:border-emerald-400 hover:bg-emerald-950/60'
                        : 'bg-slate-800/50 border-slate-700/80 hover:border-blue-500/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-tr ${node.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs ring-1 ${
                          isFriend ? 'ring-emerald-400' : 'ring-white/20'
                        }`}
                      >
                        {node.name.slice(0, 1)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-extrabold text-white truncate">{node.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{node.role}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                        isFriend
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-700/70 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-600'
                      }`}
                    >
                      {isFriend ? (
                        <>
                          <UserCheck className="w-3 h-3 text-white" />
                          <span>Bạn bè ✓</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>+ Kết bạn</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MỤC NÂNG CAO: KẾT NỐI 2 NGƯỜI BẤT KỲ ĐỂ TẠO MẠNG BẠN CHUNG */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Link className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Nối quan hệ 2 người bất kỳ (để tạo mạng bạn chung đa dạng):</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={customNodeA}
                onChange={(e) => setCustomNodeA(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="">Chọn người 1...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>

              <span className="text-slate-500 font-bold">và</span>

              <select
                value={customNodeB}
                onChange={(e) => setCustomNodeB(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="">Chọn người 2...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!customNodeA || !customNodeB || customNodeA === customNodeB}
                onClick={() => {
                  if (customNodeA && customNodeB && customNodeA !== customNodeB) {
                    onToggleFriend(customNodeA, customNodeB);
                  }
                }}
                className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-30 ${
                  areCustomNodesFriends
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs'
                }`}
              >
                {areCustomNodesFriends ? 'Hủy nối bạn' : 'Nối bạn bè'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
