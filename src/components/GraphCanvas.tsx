import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { GraphEdge, StepSnapshot, StudentNode } from '../types/graph';
import { ZoomIn, ZoomOut, RotateCcw, Move, UserCheck } from 'lucide-react';

interface GraphCanvasProps {
  nodes: StudentNode[];
  edges: GraphEdge[];
  currentStep: StepSnapshot | null;
  sourceId: string;
  onSelectSource: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  highlightCandidateId?: string | null;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  currentStep,
  sourceId,
  onSelectSource,
  onUpdateNodePosition,
  highlightCandidateId,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);

  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);
  panRef.current = pan;

  const draggingNodeIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const nodeMap = useMemo(() => {
    const map = new Map<string, StudentNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Danh sách bạn bè trực tiếp của từng người trong đồ thị
  const nodeFriendsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    nodes.forEach((n) => {
      const friends: string[] = [];
      edges.forEach((e) => {
        if (e.source === n.id) {
          const fn = nodeMap.get(e.target);
          if (fn) friends.push(fn.name);
        } else if (e.target === n.id) {
          const fn = nodeMap.get(e.source);
          if (fn) friends.push(fn.name);
        }
      });
      map.set(n.id, friends);
    });
    return map;
  }, [nodes, edges, nodeMap]);

  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) : null;
  const hoveredFriends = hoveredNodeId ? nodeFriendsMap.get(hoveredNodeId) || [] : [];

  // Cô lập cuộn chuột không cho trang ngoài bị cuộn theo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 2.2));
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheelNative);
    };
  }, []);

  // Kéo thả và pan ở cấp window để tránh trôi chuột
  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current) {
        e.preventDefault();
        setPan({
          x: e.clientX - startPanRef.current.x,
          y: e.clientY - startPanRef.current.y,
        });
      } else if (draggingNodeIdRef.current && svgRef.current) {
        e.preventDefault();
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const svgP = pt.matrixTransform(ctm.inverse());
          const nodeX = Math.round(
            (svgP.x - panRef.current.x) / zoomRef.current - dragOffsetRef.current.x
          );
          const nodeY = Math.round(
            (svgP.y - panRef.current.y) / zoomRef.current - dragOffsetRef.current.y
          );
          onUpdateNodePosition(draggingNodeIdRef.current, nodeX, nodeY);
        }
      }
    };

    const onWindowMouseUp = () => {
      if (isPanningRef.current || draggingNodeIdRef.current) {
        isPanningRef.current = false;
        draggingNodeIdRef.current = null;
        setDraggingNodeId(null);
        setIsPanning(false);
      }
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [onUpdateNodePosition]);

  const handleNodeMouseDown = (e: React.MouseEvent, node: StudentNode) => {
    e.preventDefault();
    e.stopPropagation();

    setDraggingNodeId(node.id);
    draggingNodeIdRef.current = node.id;

    if (svgRef.current) {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const svgP = pt.matrixTransform(ctm.inverse());
        const mouseSvgX = (svgP.x - pan.x) / zoom;
        const mouseSvgY = (svgP.y - pan.y) / zoom;
        dragOffsetRef.current = {
          x: mouseSvgX - node.x,
          y: mouseSvgY - node.y,
        };
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    setIsPanning(true);
    isPanningRef.current = true;
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // QUY TẮC MÀU SẮC ĐỈNH CHUẨN XÁC, RÕ RÀNG THEO THUẬT TOÁN
  const getNodeVisual = (node: StudentNode) => {
    const nodeId = node.id;
    const isSource = nodeId === sourceId;
    const isActive = currentStep?.activeNodeId === nodeId;
    const isNeighborActive = currentStep?.activeNeighborId === nodeId;
    const isHighlighted = highlightCandidateId === nodeId;

    const layer = currentStep ? currentStep.layerMap[nodeId] : isSource ? 0 : null;

    let fillColor = '#1e293b';    // Nền mặc định: Slate-800 tối êm mắt
    let ringColor = '#475569';    // Viền mặc định: Slate-600
    let textColor = '#cbd5e1';    // Chữ mặc định: Xám sáng Slate-300
    let ringWidth = 2.5;
    let badgeText = '';

    if (layer === 0 || isSource) {
      // 1. TẦNG 0: BẠN (ĐỈNH NGUỒN) - MÀU XANH DƯƠNG RÕ NÉT
      fillColor = '#2563eb';
      ringColor = '#60a5fa';
      textColor = '#ffffff';
      ringWidth = 4;
      badgeText = 'BẠN';
    } else if (layer === 1) {
      // 2. TẦNG 1: BẠN BÈ TRỰC TIẾP - MÀU XANH LÁ RÕ NÉT
      fillColor = '#059669';
      ringColor = '#34d399';
      textColor = '#ffffff';
      ringWidth = 3.5;
      badgeText = 'BẠN BÈ';
    } else if (layer === 2) {
      // 3. TẦNG 2: GỢI Ý KẾT BẠN (BẠN CỦA BẠN) - MÀU VÀNG CAM NỔI BẬT
      fillColor = '#d97706';
      ringColor = '#fbbf24';
      textColor = '#ffffff';
      ringWidth = 3.5;
      badgeText = 'GỢI Ý';
    } else {
      // 4. CHƯA KẾT NỐI: MÀU TỐI DỊU NHẸ, VIỀN RÕ RÀNG
      fillColor = '#1e293b';
      ringColor = '#475569';
      textColor = '#94a3b8';
      ringWidth = 2;
    }

    if (isHighlighted) {
      ringColor = '#f97316';
      ringWidth = 5;
    }

    if (isActive) {
      ringColor = '#ef4444'; // ĐỎ RỰC KHI ĐANG DEQUEUE XÉT DUYỆT
      ringWidth = 5;
    } else if (isNeighborActive) {
      ringColor = '#38bdf8'; // CYAN SÁNG KHI ĐANG KIỂM TRA LIÊN KẾT
      ringWidth = 4;
    }

    return {
      fillColor,
      ringColor,
      ringWidth,
      textColor,
      badgeText,
      isActive,
      isSource,
      isCandidate: layer === 2,
    };
  };

  // QUY TẮC MÀU SẮC ĐƯỜNG NỐI (EDGES) PHÂN BIỆT RÕ RÀNG
  const getEdgeVisual = (edge: GraphEdge) => {
    const isTraversed =
      currentStep?.activeEdge &&
      ((currentStep.activeEdge[0] === edge.source && currentStep.activeEdge[1] === edge.target) ||
        (currentStep.activeEdge[0] === edge.target && currentStep.activeEdge[1] === edge.source));

    const sourceLayer = currentStep?.layerMap[edge.source];
    const targetLayer = currentStep?.layerMap[edge.target];

    let stroke = '#334155'; // Mặc định: Slate-700 dịu mắt
    let strokeWidth = 2;
    let strokeDasharray = 'none';

    if (isTraversed) {
      stroke = '#3b82f6';   // Cạnh đang duyệt: Xanh dương sáng 4.5px
      strokeWidth = 4.5;
    } else if (
      (sourceLayer === 0 && targetLayer === 1) ||
      (sourceLayer === 1 && targetLayer === 0)
    ) {
      stroke = '#10b981';   // Cạnh Bạn bè: Xanh lá cây đậm
      strokeWidth = 3.2;
    } else if (
      (sourceLayer === 1 && targetLayer === 2) ||
      (sourceLayer === 2 && targetLayer === 1)
    ) {
      stroke = '#f59e0b';   // Cạnh Bạn của bạn: Vàng cam đậm
      strokeWidth = 3;
    } else if (
      (sourceLayer === 2 && targetLayer === null) ||
      (sourceLayer === null && targetLayer === 2)
    ) {
      stroke = '#1e293b';   // Cạnh xa ngoài tầng 2: Nét đứt
      strokeDasharray = '4 4';
      strokeWidth = 1.8;
    }

    return { stroke, strokeWidth, strokeDasharray, isTraversed };
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md flex flex-col select-none overscroll-contain"
      style={{ touchAction: 'none' }}
    >
      {/* 1. THANH CHÚ GIẢI MÀU SẮC GỌN GÀNG (1 DÒNG DUY NHẤT) */}
      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 text-xs shrink-0">
          {/* Nguồn */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-800/60 text-blue-300 font-semibold shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-400/40" />
            <span>Tài khoản bạn chọn (Tầng 0)</span>
          </div>

          {/* Bạn bè */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-semibold shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40" />
            <span>Bạn bè trực tiếp (Tầng 1)</span>
          </div>

          {/* Gợi ý */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-300 font-semibold shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40" />
            <span>Gợi ý kết bạn (Tầng 2)</span>
          </div>

          {/* Chưa kết nối */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 font-medium shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Chưa kết nối</span>
          </div>
        </div>
      </div>

      {/* 2. VÙNG SVG VẼ ĐỒ THỊ MỞ RỘNG */}
      <div className="relative w-full flex-1 min-h-[540px] bg-slate-950 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 880 540"
          className={`w-full h-full ${
            isPanning ? 'cursor-grabbing' : draggingNodeId ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleCanvasMouseDown}
        >
          {/* Lưới nền (Grid Pattern) */}
          <defs>
            <pattern
              id="graph-grid"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="14" cy="14" r="1.5" fill="#334155" opacity="0.4" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Lớp Cạnh (Edges) */}
            <g>
              {edges.map((edge) => {
                const sNode = nodeMap.get(edge.source);
                const tNode = nodeMap.get(edge.target);
                if (!sNode || !tNode) return null;

                const visual = getEdgeVisual(edge);

                return (
                  <line
                    key={edge.id}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke={visual.stroke}
                    strokeWidth={visual.strokeWidth}
                    strokeDasharray={visual.strokeDasharray}
                    strokeLinecap="round"
                    className="transition-colors duration-200"
                  />
                );
              })}
            </g>

            {/* Lớp Đỉnh (Nodes) */}
            <g>
              {nodes.map((node) => {
                const visual = getNodeVisual(node);
                const isSource = node.id === sourceId;
                const mutualInfo = currentStep?.candidateMap[node.id];

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSource) onSelectSource(node.id);
                    }}
                  >
                    {/* Radar nhấp nháy khi đang xét (Active Node) */}
                    {visual.isActive && (
                      <circle
                        r="38"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3.5"
                        className="animate-ping"
                        opacity="0.6"
                      />
                    )}

                    {/* Vòng hào quang nếu là Đỉnh nguồn */}
                    {isSource && (
                      <circle
                        r="34"
                        fill="#3b82f6"
                        opacity="0.25"
                        className="animate-pulse"
                      />
                    )}

                    {/* Vòng tròn chính của Node */}
                    <circle
                      r="24"
                      fill={visual.fillColor}
                      stroke={visual.ringColor}
                      strokeWidth={visual.ringWidth}
                      className="transition-all duration-200 drop-shadow-sm group-hover:scale-105"
                    />

                    {/* Chữ cái viết tắt tên sinh viên */}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill={visual.textColor}
                      fontSize="13"
                      fontWeight="800"
                      pointerEvents="none"
                      className="font-sans"
                    >
                      {node.name.slice(0, 2).toUpperCase()}
                    </text>

                    {/* Badge số bạn chung nếu là người được gợi ý */}
                    {visual.isCandidate && mutualInfo && mutualInfo.mutualFriends.length > 0 && (
                      <g transform="translate(18, -18)">
                        <circle r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                        <text
                          textAnchor="middle"
                          dy="0.35em"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="900"
                        >
                          +{mutualInfo.mutualFriends.length}
                        </text>
                      </g>
                    )}

                    {/* Thẻ Tên sinh viên bên dưới */}
                    <g transform="translate(0, 36)">
                      <rect
                        x="-40"
                        y="-11"
                        width="80"
                        height="22"
                        rx="11"
                        fill="#1e293b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="drop-shadow-xs"
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="700"
                        pointerEvents="none"
                      >
                        {node.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Tooltip hiển thị thông tin bạn bè trực tiếp khi rê chuột vào bất kỳ đỉnh nào */}
        {hoveredNode && (
          <div className="absolute top-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700 shadow-xl text-xs pointer-events-none max-w-xs animate-fade-in text-slate-100">
            <div className="font-extrabold text-white flex items-center justify-between gap-2">
              <span className="text-sm font-black text-blue-300">{hoveredNode.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {hoveredNode.role}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-emerald-400 font-extrabold">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Có {hoveredFriends.length} bạn bè trực tiếp:</span>
            </div>
            <div className="text-[11px] text-emerald-200 font-semibold mt-0.5 leading-relaxed bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/50">
              {hoveredFriends.length > 0 ? hoveredFriends.join(', ') : 'Chưa có bạn bè trong đồ thị'}
            </div>
            {hoveredNode.id === sourceId ? (
              <div className="mt-1.5 text-[10px] text-blue-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Đang là tài khoản gốc được chọn
              </div>
            ) : (
              <div className="mt-1.5 text-[10px] text-slate-400 italic">
                * Nhấp vào đỉnh để đổi làm tài khoản gốc
              </div>
            )}
          </div>
        )}

        {/* Chú thích thao tác nhẹ ở góc dưới bên trái */}
        <div className="absolute bottom-3 left-3 text-xs text-slate-300 bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm flex items-center gap-1.5 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Kéo chuột để di chuyển • Cuộn chuột để phóng to/thu nhỏ</span>
        </div>

        {/* Nút Zoom & Điều khiển View nổi ở góc dưới bên phải đồ thị */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg">
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.15, 2.2))}
            title="Phóng to"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.5))}
            title="Thu nhỏ"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Đặt lại khung nhìn"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
