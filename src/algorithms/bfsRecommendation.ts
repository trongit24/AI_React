import type {
  BfsExecutionResult,
  CandidateScore,
  GraphEdge,
  NodeLayer,
  QueueItem,
  StepSnapshot,
  StudentNode,
} from '../types/graph';
import { buildAdjacencyList, findNodeById, getNodeName } from '../utils/graphData';

export function runBfsFriendRecommendation(
  nodes: StudentNode[],
  edges: GraphEdge[],
  sourceId: string
): BfsExecutionResult {
  const adj = buildAdjacencyList(edges);
  const steps: StepSnapshot[] = [];

  const sourceNode = findNodeById(nodes, sourceId);
  const sourceName = sourceNode ? sourceNode.name : sourceId;

  const queue: QueueItem[] = [];
  const visited = new Set<string>();
  const layerMap: Record<string, NodeLayer> = {};
  const candidateMutuals: Record<string, Set<string>> = {};

  let stepCounter = 0;
  let maxQueueSize = 0;

  const sourceDirectFriends = new Set<string>(adj.get(sourceId) || []);

  const createSnapshot = (
    actionType: StepSnapshot['actionType'],
    title: string,
    description: string,
    activeNodeId: string | null = null,
    activeNeighborId: string | null = null,
    activeEdge: [string, string] | null = null,
    currentDepth: number = 0
  ) => {
    maxQueueSize = Math.max(maxQueueSize, queue.length);

    const candidateSnapshot: StepSnapshot['candidateMap'] = {};
    for (const [candId, mutualSet] of Object.entries(candidateMutuals)) {
      candidateSnapshot[candId] = {
        candidateId: candId,
        candidateName: getNodeName(nodes, candId),
        mutualFriends: Array.from(mutualSet).map((fid) => getNodeName(nodes, fid)),
      };
    }

    steps.push({
      stepIndex: stepCounter++,
      actionType,
      title,
      description,
      activeNodeId,
      activeNeighborId,
      activeEdge,
      queue: queue.map((item) => ({ ...item })),
      visited: Array.from(visited),
      layerMap: { ...layerMap },
      candidateMap: candidateSnapshot,
      currentDepth,
      stats: {
        totalStepsSoFar: stepCounter,
        currentQueueLength: queue.length,
        maxQueueSize,
        visitedCount: visited.size,
        layer1Count: Object.values(layerMap).filter((l) => l === 1).length,
        layer2CandidateCount: Object.keys(candidateMutuals).length,
      },
    });
  };

  // 1. Khởi tạo
  visited.add(sourceId);
  layerMap[sourceId] = 0;
  queue.push({
    nodeId: sourceId,
    nodeName: sourceName,
    depth: 0,
    path: [sourceId],
  });

  createSnapshot(
    'INIT',
    `Bắt đầu tìm gợi ý cho ${sourceName}`,
    `Đưa ${sourceName} vào hàng đợi xử lý để bắt đầu tìm kiếm bạn bè.`,
    sourceId,
    null,
    null,
    0
  );

  // 2. Vòng lặp BFS
  while (queue.length > 0) {
    const current = queue.shift()!;
    const u = current.nodeId;
    const uName = getNodeName(nodes, u);
    const uDepth = current.depth;

    createSnapshot(
      'DEQUEUE',
      `Đang xem xét: ${uName}`,
      `Lấy ${uName} ra khỏi hàng đợi để kiểm tra danh sách bạn bè của người này.`,
      u,
      null,
      null,
      uDepth
    );

    // Dừng ở độ sâu 2 (chỉ tìm bạn của bạn)
    if (uDepth >= 2) {
      continue;
    }

    const neighbors = adj.get(u) || [];

    for (const v of neighbors) {
      const vName = getNodeName(nodes, v);
      const edgeKey: [string, string] = [u, v];

      // Bỏ qua nếu quay lại chính người đang xét
      if (v === sourceId) {
        continue;
      }

      // Đang ở người dùng gốc (Tầng 0) -> Tìm bạn bè trực tiếp (Tầng 1)
      if (uDepth === 0) {
        if (!visited.has(v)) {
          visited.add(v);
          layerMap[v] = 1;

          queue.push({
            nodeId: v,
            nodeName: vName,
            depth: 1,
            path: [...current.path, v],
          });

          createSnapshot(
            'DISCOVER_LAYER_1',
            `Bạn hiện tại: ${vName}`,
            `${vName} là bạn bè hiện tại của ${sourceName}. Thêm vào hàng đợi để tiếp tục tìm bạn của ${vName}.`,
            u,
            v,
            edgeKey,
            1
          );
        }
      }
      // Đang ở bạn bè của người dùng (Tầng 1) -> Tìm bạn của bạn (Tầng 2)
      else if (uDepth === 1) {
        // Nếu người này đã là bạn trực tiếp của source thì không gợi ý nữa
        if (sourceDirectFriends.has(v)) {
          continue;
        }

        if (!candidateMutuals[v]) {
          candidateMutuals[v] = new Set<string>();
        }

        candidateMutuals[v].add(u);

        if (!visited.has(v)) {
          visited.add(v);
          layerMap[v] = 2;

          queue.push({
            nodeId: v,
            nodeName: vName,
            depth: 2,
            path: [...current.path, v],
            viaFriend: u,
          });

          createSnapshot(
            'DISCOVER_LAYER_2',
            `Gợi ý mới: ${vName}`,
            `Tìm thấy ${vName} (là bạn của ${uName}). Có bạn chung đầu tiên là ${uName}.`,
            u,
            v,
            edgeKey,
            2
          );
        } else {
          createSnapshot(
            'RECORD_MUTUAL',
            `Thêm bạn chung cho ${vName}`,
            `${vName} cũng là bạn của ${uName}! Hiện tại có ${candidateMutuals[v].size} bạn chung với ${sourceName}.`,
            u,
            v,
            edgeKey,
            2
          );
        }
      }
    }
  }

  // 3. Tính điểm gợi ý & sắp xếp
  const sourceFriendsCount = Math.max(sourceDirectFriends.size, 1);

  const finalRecommendations: CandidateScore[] = Object.keys(candidateMutuals).map((candidateId) => {
    const candidateNode = findNodeById(nodes, candidateId);
    const candidateName = candidateNode ? candidateNode.name : candidateId;
    const candidateRole = candidateNode ? candidateNode.role : 'Sinh viên';
    const avatarColor = candidateNode ? candidateNode.avatarColor : 'from-blue-500 to-indigo-600';

    const mutualSet = candidateMutuals[candidateId];
    const mutualFriendsNames = Array.from(mutualSet).map((fid) => getNodeName(nodes, fid));
    const mutualFriendsCount = mutualSet.size;

    // Tính phần trăm phù hợp đơn giản, dễ hiểu
    const matchPercentage = Math.min(
      Math.round((mutualFriendsCount / sourceFriendsCount) * 100),
      100
    );

    return {
      candidateId,
      candidateName,
      candidateRole,
      avatarColor,
      mutualFriendsCount,
      mutualFriends: mutualFriendsNames,
      matchPercentage,
      rank: 0,
    };
  });

  // Ưu tiên người có nhiều bạn chung nhất
  finalRecommendations.sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount);

  finalRecommendations.forEach((item, index) => {
    item.rank = index + 1;
  });

  createSnapshot(
    'COMPLETE',
    `Hoàn tất tìm kiếm gợi ý`,
    `Đã tìm được ${finalRecommendations.length} người có bạn chung phù hợp nhất cho ${sourceName}.`,
    null,
    null,
    null,
    2
  );

  return {
    steps,
    finalRecommendations,
    maxQueueSize,
    totalVisited: visited.size,
  };
}
