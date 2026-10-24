export type NodeLayer = 0 | 1 | 2 | null;

export interface StudentNode {
  id: string;
  name: string;
  role: string;          // Lớp/Khoa (ví dụ: "K65 CNTT", "K66 ATTT")
  avatarColor: string;    // Màu đại diện cho avatar
  bio?: string;
  x: number;             // Tọa độ X trên Canvas/SVG
  y: number;             // Tọa độ Y trên Canvas/SVG
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface QueueItem {
  nodeId: string;
  nodeName: string;
  depth: number;
  path: string[];
  viaFriend?: string;
}

export interface CandidateScore {
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  avatarColor: string;
  mutualFriendsCount: number;
  mutualFriends: string[];       // Danh sách tên các bạn chung
  matchPercentage: number;       // % độ phù hợp (tương đồng bạn bè)
  rank: number;
}

export type ActionType =
  | 'INIT'
  | 'DEQUEUE'
  | 'CHECK_NEIGHBOR'
  | 'DISCOVER_LAYER_1'
  | 'DISCOVER_LAYER_2'
  | 'RECORD_MUTUAL'
  | 'SKIP_SOURCE'
  | 'SKIP_ALREADY_FRIEND'
  | 'SKIP_VISITED'
  | 'SKIP_DEPTH_LIMIT'
  | 'COMPLETE';

export interface StepSnapshot {
  stepIndex: number;
  actionType: ActionType;
  title: string;
  description: string;

  activeNodeId: string | null;
  activeNeighborId: string | null;
  activeEdge: [string, string] | null;

  queue: QueueItem[];
  visited: string[];
  layerMap: Record<string, NodeLayer>;

  candidateMap: Record<string, {
    candidateId: string;
    candidateName: string;
    mutualFriends: string[];
  }>;

  currentDepth: number;

  stats: {
    totalStepsSoFar: number;
    currentQueueLength: number;
    maxQueueSize: number;
    visitedCount: number;
    layer1Count: number;
    layer2CandidateCount: number;
  };
}

export interface BfsExecutionResult {
  steps: StepSnapshot[];
  finalRecommendations: CandidateScore[];
  maxQueueSize: number;
  totalVisited: number;
}
