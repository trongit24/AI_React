import { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_EDGES, INITIAL_NODES } from './utils/graphData';
import { runBfsFriendRecommendation } from './algorithms/bfsRecommendation';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlBar } from './components/ControlBar';
import { QueueViewer } from './components/QueueViewer';
import { RecommendationPanel } from './components/RecommendationPanel';
import { ComplexityMetric } from './components/ComplexityMetric';
import { FriendshipManager } from './components/FriendshipManager';
import type { GraphEdge, StudentNode } from './types/graph';
import { Users } from 'lucide-react';

export function App() {
  const [nodes, setNodes] = useState<StudentNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);

  const [selectedSourceId, setSelectedSourceId] = useState<string>('an');

  const executionResult = useMemo(() => {
    return runBfsFriendRecommendation(nodes, edges, selectedSourceId);
  }, [nodes, edges, selectedSourceId]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(0.75);

  const [highlightCandidateId, setHighlightCandidateId] = useState<string | null>(null);

  const totalSteps = executionResult.steps.length;
  const currentStep = executionResult.steps[currentStepIndex] || null;

  const handleSelectSource = (newSourceId: string) => {
    setIsPlaying(false);
    setSelectedSourceId(newSourceId);
    setCurrentStepIndex(0);
    setHighlightCandidateId(null);
  };

  const handleUpdateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n))
    );
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [totalSteps]);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const handleJumpToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  }, [totalSteps]);

  // Thao tác kết bạn / hủy bạn động
  const handleToggleFriendship = useCallback((sourceId: string, targetId: string) => {
    setIsPlaying(false);
    setEdges((prevEdges) => {
      const existingIndex = prevEdges.findIndex(
        (e) =>
          (e.source === sourceId && e.target === targetId) ||
          (e.source === targetId && e.target === sourceId)
      );

      if (existingIndex >= 0) {
        return prevEdges.filter((_, idx) => idx !== existingIndex);
      } else {
        const newEdge: GraphEdge = {
          id: `e-${sourceId}-${targetId}-${Date.now()}`,
          source: sourceId,
          target: targetId,
          label: 'Bạn bè mới',
        };
        return [...prevEdges, newEdge];
      }
    });
    setCurrentStepIndex(0);
    setHighlightCandidateId(null);
  }, []);

  // Xóa toàn bộ bạn bè của tài khoản được chỉ định
  const handleClearFriends = useCallback((sourceId: string) => {
    setIsPlaying(false);
    setEdges((prevEdges) =>
      prevEdges.filter((e) => e.source !== sourceId && e.target !== sourceId)
    );
    setCurrentStepIndex(0);
    setHighlightCandidateId(null);
  }, []);

  // Khôi phục đồ thị gốc
  const handleResetEdges = useCallback(() => {
    setIsPlaying(false);
    setEdges(INITIAL_EDGES);
    setCurrentStepIndex(0);
    setHighlightCandidateId(null);
  }, []);

  // Nút Run demo: Bắt đầu từ đầu và tự động phát từng bước duyệt BFS
  const handleRunDemo = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(100, Math.round(900 / speed));
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed, totalSteps]);

  const currentSourceName =
    nodes.find((n) => n.id === selectedSourceId)?.name || selectedSourceId;

  // Tính danh sách bạn bè trực tiếp của tài khoản đang chọn
  const directFriendsOfSource = useMemo(() => {
    const friendNames: string[] = [];
    edges.forEach((edge) => {
      if (edge.source === selectedSourceId) {
        const friend = nodes.find((n) => n.id === edge.target);
        if (friend) friendNames.push(friend.name);
      } else if (edge.target === selectedSourceId) {
        const friend = nodes.find((n) => n.id === edge.source);
        if (friend) friendNames.push(friend.name);
      }
    });
    return friendNames;
  }, [edges, selectedSourceId, nodes]);

  // Danh sách gợi ý bạn bè tăng dần theo từng bước duyệt BFS (chỉ hiển thị những ai đã được duyệt tới ở bước hiện tại)
  const progressiveRecommendations = useMemo(() => {
    if (!currentStep || !currentStep.candidateMap) return [];
    const sourceFriendsCount = Math.max(directFriendsOfSource.length, 1);

    const list = Object.values(currentStep.candidateMap).map((cand) => {
      const candidateNode = nodes.find((n) => n.id === cand.candidateId);
      const candidateName = cand.candidateName;
      const candidateRole = candidateNode ? candidateNode.role : 'Sinh viên';
      const avatarColor = candidateNode ? candidateNode.avatarColor : 'from-amber-500 to-orange-600';
      const mutualFriendsCount = cand.mutualFriends.length;
      const matchPercentage = Math.min(
        Math.round((mutualFriendsCount / sourceFriendsCount) * 100),
        100
      );

      return {
        candidateId: cand.candidateId,
        candidateName,
        candidateRole,
        avatarColor,
        mutualFriendsCount,
        mutualFriends: cand.mutualFriends,
        matchPercentage,
        rank: 0,
      };
    });

    list.sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount);
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }, [currentStep, nodes, directFriendsOfSource.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* THANH ĐIỀU HƯỚNG HIỆN ĐẠI, MÀU SẮC ĐẬM NÉT */}
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight flex items-center gap-2">
                Hệ thống gợi ý kết bạn
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-semibold uppercase tracking-wider">
                  Thuật toán BFS
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span>Đang xem: <strong className="text-blue-200 font-bold">{currentSourceName}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH RỘNG RÃI */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* THANH ĐIỀU KHIỂN NÚT CHẠY */}
        <ControlBar
          nodes={nodes}
          selectedSourceId={selectedSourceId}
          onSelectSource={handleSelectSource}
          directFriends={directFriendsOfSource}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onReset={handleReset}
          onJumpToEnd={handleJumpToEnd}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          speed={speed}
          onChangeSpeed={setSpeed}
        />

        {/* BẢNG TÙY CHỌN & THAO TÁC KẾT BẠN TRỰC TIẾP */}
        <FriendshipManager
          nodes={nodes}
          edges={edges}
          selectedSourceId={selectedSourceId}
          onToggleFriend={handleToggleFriendship}
          onClearFriends={handleClearFriends}
          onResetEdges={handleResetEdges}
          onRunDemo={handleRunDemo}
          onShowResultsImmediately={handleJumpToEnd}
          isPlaying={isPlaying}
        />

        {/* KHU VỰC CHÍNH: ĐỒ THỊ BÊN TRÁI (8/12) & TIẾN TRÌNH DUYỆT BFS BÊN PHẢI (4/12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* CỘT TRÁI (8/12): Đồ thị trực quan mở rộng */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              currentStep={currentStep}
              sourceId={selectedSourceId}
              onSelectSource={handleSelectSource}
              onUpdateNodePosition={handleUpdateNodePosition}
              highlightCandidateId={highlightCandidateId}
            />
          </div>

          {/* CỘT PHẢI (4/12): Rút gọn bề ngang tới vạch đỏ, nội dung đậm đà cân đối */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 h-full">
            <QueueViewer currentStep={currentStep} className="flex-1" />

            <ComplexityMetric
              currentStep={currentStep}
              totalNodes={nodes.length}
              directFriends={directFriendsOfSource}
            />
          </div>
        </div>

        {/* HÀNG DƯỚI: Danh sách kết quả Gợi ý Bạn bè (Những người bạn có thể biết - Tầng 2) */}
        <RecommendationPanel
          recommendations={progressiveRecommendations}
          sourceName={currentSourceName}
          onHighlightCandidate={setHighlightCandidateId}
          selectedCandidateId={highlightCandidateId}
          activeCandidateId={currentStep?.activeNeighborId}
          isComplete={currentStep?.actionType === 'COMPLETE' || currentStepIndex >= totalSteps - 1}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
        />
      </main>
    </div>
  );
}

export default App;
