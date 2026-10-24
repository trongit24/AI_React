import { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_EDGES, INITIAL_NODES } from './utils/graphData';
import { runBfsFriendRecommendation } from './algorithms/bfsRecommendation';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlBar } from './components/ControlBar';
import { QueueViewer } from './components/QueueViewer';
import { RecommendationPanel } from './components/RecommendationPanel';
import { ComplexityMetric } from './components/ComplexityMetric';
import type { StudentNode } from './types/graph';
import { Users } from 'lucide-react';

export function App() {
  const [nodes, setNodes] = useState<StudentNode[]>(INITIAL_NODES);
  const edges = INITIAL_EDGES;

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
          recommendations={executionResult.finalRecommendations}
          sourceName={currentSourceName}
          onHighlightCandidate={setHighlightCandidateId}
          selectedCandidateId={highlightCandidateId}
        />
      </main>
    </div>
  );
}

export default App;
