import type { GraphEdge, StudentNode } from '../types/graph';

/**
 * Mạng xã hội sinh viên mẫu G = (V, E)
 * Thiết kế bài bản với các cụm sinh viên, bạn chung và các tầng khoảng cách:
 * - Đỉnh nguồn mặc định: "an" (An - K65 CNTT)
 * - Tầng 1 (Bạn trực tiếp): Bình, Châu, Dũng
 * - Tầng 2 (Ứng viên đề xuất):
 *    + Minh: Bạn chung với cả Bình, Châu, Dũng (3 bạn chung -> Top 1)
 *    + Giang: Bạn chung với Bình, Dũng (2 bạn chung)
 *    + Hương: Bạn chung với Châu, Dũng (2 bạn chung)
 *    + Khánh: Bạn chung với Bình (1 bạn chung)
 *    + Linh: Bạn chung với Châu (1 bạn chung)
 *    + Nam: Bạn chung với Dũng (1 bạn chung)
 * - Tầng 3 (Dừng thuật toán, không đề xuất): Oanh, Phúc, Tâm (cách An 3 bước)
 * - Tầng 4 (Không thể duyệt tới): Quân (cách An 4 bước)
 */

export const INITIAL_NODES: StudentNode[] = [
  // --- TẦNG 0 (ĐỈNH GỐC TIÊU BIỂU) ---
  {
    id: 'an',
    name: 'An',
    role: 'K65 CNTT 1',
    avatarColor: 'from-blue-600 to-indigo-600',
    bio: 'Đam mê Lập trình Web & Thuật toán',
    x: 450,
    y: 280,
  },

  // --- TẦNG 1 (BẠN BÈ TRỰC TIẾP CỦA AN) ---
  {
    id: 'binh',
    name: 'Bình',
    role: 'K65 CNTT 1',
    avatarColor: 'from-emerald-600 to-teal-600',
    bio: 'Thành viên CLB Tin học, bạn thân của An',
    x: 300,
    y: 210,
  },
  {
    id: 'chau',
    name: 'Châu',
    role: 'K65 Kỹ thuật Phần mềm',
    avatarColor: 'from-emerald-600 to-teal-600',
    bio: 'Trưởng nhóm đồ án môn Kiến trúc phần mềm',
    x: 600,
    y: 210,
  },
  {
    id: 'dung',
    name: 'Dũng',
    role: 'K65 An toàn Thông tin',
    avatarColor: 'from-emerald-600 to-teal-600',
    bio: 'Chuyên nghiên cứu Mạng và Bảo mật hệ thống',
    x: 450,
    y: 410,
  },

  // --- TẦNG 2 (ỨNG VIÊN BẠN CỦA BẠN - FRIENDS OF FRIENDS) ---
  {
    id: 'minh',
    name: 'Minh',
    role: 'K65 CNTT 2',
    avatarColor: 'from-amber-500 to-orange-600',
    bio: 'Quen biết cả Bình, Châu, Dũng qua các cuộc thi Hackathon',
    x: 450,
    y: 155,
  },
  {
    id: 'giang',
    name: 'Giang',
    role: 'K66 Khoa học Dữ liệu',
    avatarColor: 'from-amber-500 to-orange-600',
    bio: 'Bạn học lab AI với Bình và cùng chơi cầu lông với Dũng',
    x: 180,
    y: 320,
  },
  {
    id: 'huong',
    name: 'Hương',
    role: 'K65 KTPM',
    avatarColor: 'from-amber-500 to-orange-600',
    bio: 'Bạn cùng lớp TH PT với Châu, cùng nhóm NCKH với Dũng',
    x: 720,
    y: 320,
  },
  {
    id: 'khanh',
    name: 'Khánh',
    role: 'K66 Hệ thống Thông tin',
    avatarColor: 'from-amber-500 to-orange-600',
    bio: 'Bạn thân từ cấp 3 của Bình',
    x: 150,
    y: 190,
  },
  {
    id: 'linh',
    name: 'Linh',
    role: 'K65 Thương mại Điện tử',
    avatarColor: 'from-amber-500 to-orange-600',
    bio: 'Cùng ban truyền thông Đoàn trường với Châu',
    x: 750,
    y: 190,
  },
  {
    id: 'nam',
    name: 'Nam',
    role: 'K65 Mạng Máy tính',
    avatarColor: 'from-amber-500 to-orange-600',
    bio: 'Bạn cùng phòng ký túc xá với Dũng',
    x: 450,
    y: 500,
  },

  // --- TẦNG 3 (VƯỢT QUÁ TẦNG 2 - BỊ NGẮT NHÁNH BỞI THUẬT TOÁN) ---
  {
    id: 'oanh',
    name: 'Oanh',
    role: 'K66 Khoa học Máy tính',
    avatarColor: 'from-purple-500 to-indigo-600',
    bio: 'Chỉ quen Minh & Giang, cách An khoảng cách 3 bước',
    x: 290,
    y: 80,
  },
  {
    id: 'phuc',
    name: 'Phúc',
    role: 'K65 Trí tuệ Nhân tạo',
    avatarColor: 'from-teal-500 to-cyan-600',
    bio: 'Chỉ quen Hương & Linh, cách An khoảng cách 3 bước',
    x: 610,
    y: 80,
  },
  {
    id: 'tam',
    name: 'Tâm',
    role: 'K65 Điện tử Viễn thông',
    avatarColor: 'from-rose-500 to-pink-600',
    bio: 'Bạn riêng của Khánh, cách An 3 bước',
    x: 60,
    y: 280,
  },

  // --- TẦNG 4 (ĐỈNH XA NHẤT - KHÔNG BAO GIỜ DUYỆT TỚI) ---
  {
    id: 'quan',
    name: 'Quân',
    role: 'K66 Kỹ thuật Máy tính',
    avatarColor: 'from-blue-500 to-sky-600',
    bio: 'Bạn của Oanh & Phúc, khoảng cách d = 4 so với An',
    x: 450,
    y: 65,
  },
];

export const INITIAL_EDGES: GraphEdge[] = [
  // Cạnh nối Tầng 0 (An) -> Tầng 1 (Bình, Châu, Dũng)
  { id: 'e-an-binh', source: 'an', target: 'binh', label: 'Bạn thân lớp' },
  { id: 'e-an-chau', source: 'an', target: 'chau', label: 'Bạn nhóm đồ án' },
  { id: 'e-an-dung', source: 'an', target: 'dung', label: 'Bạn CLB Tin học' },

  // Cạnh giữa các bạn Tầng 1 với nhau (Bình - Châu)
  { id: 'e-binh-chau', source: 'binh', target: 'chau', label: 'Cùng khóa K65' },

  // Cạnh nối Tầng 1 -> Minh (Có tới 3 bạn chung: Bình, Châu, Dũng -> Đỉnh điểm sáng)
  { id: 'e-binh-minh', source: 'binh', target: 'minh', label: 'Bạn Hackathon' },
  { id: 'e-chau-minh', source: 'chau', target: 'minh', label: 'Cùng nhóm NCKH' },
  { id: 'e-dung-minh', source: 'dung', target: 'minh', label: 'Bạn học thêm' },

  // Cạnh nối Tầng 1 -> Giang (2 bạn chung: Bình, Dũng)
  { id: 'e-binh-giang', source: 'binh', target: 'giang', label: 'Lab AI' },
  { id: 'e-dung-giang', source: 'dung', target: 'giang', label: 'CLB Cầu lông' },

  // Cạnh nối Tầng 1 -> Hương (2 bạn chung: Châu, Dũng)
  { id: 'e-chau-huong', source: 'chau', target: 'huong', label: 'Bạn cấp 3' },
  { id: 'e-dung-huong', source: 'dung', target: 'huong', label: 'Bạn NCKH' },

  // Cạnh nối Tầng 1 -> Ứng viên có 1 bạn chung (Khánh, Linh, Nam)
  { id: 'e-binh-khanh', source: 'binh', target: 'khanh', label: 'Bạn cấp 3' },
  { id: 'e-chau-linh', source: 'chau', target: 'linh', label: 'Đoàn trường' },
  { id: 'e-dung-nam', source: 'dung', target: 'nam', label: 'Cùng phòng KTX' },

  // Cạnh nối Tầng 2 -> Tầng 3 (Minh, Giang -> Oanh; Hương, Linh -> Phúc; Khánh -> Tâm)
  { id: 'e-minh-oanh', source: 'minh', target: 'oanh', label: 'Cùng lớp LAB' },
  { id: 'e-giang-oanh', source: 'giang', target: 'oanh', label: 'Bạn quen biết' },
  { id: 'e-huong-phuc', source: 'huong', target: 'phuc', label: 'Cùng lớp TA' },
  { id: 'e-linh-phuc', source: 'linh', target: 'phuc', label: 'CLB Guitar' },
  { id: 'e-khanh-tam', source: 'khanh', target: 'tam', label: 'Bạn xóm trọ' },

  // Cạnh nối Tầng 3 -> Tầng 4 (Oanh, Phúc -> Quân)
  { id: 'e-oanh-quan', source: 'oanh', target: 'quan', label: 'Bạn lớp ngoài' },
  { id: 'e-phuc-quan', source: 'phuc', target: 'quan', label: 'Nhóm bạn chơi game' },
];

/**
 * Xây dựng danh sách kề (Adjacency List) dưới dạng Map vô hướng: node -> danh sách neighbor
 */
export function buildAdjacencyList(edges: GraphEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    if (!adj.has(edge.target)) adj.set(edge.target, []);

    adj.get(edge.source)!.push(edge.target);
    adj.get(edge.target)!.push(edge.source);
  });

  return adj;
}

/**
 * Tìm kiếm node theo ID
 */
export function findNodeById(nodes: StudentNode[], id: string): StudentNode | undefined {
  return nodes.find((n) => n.id === id);
}

/**
 * Lấy tên người dùng theo ID
 */
export function getNodeName(nodes: StudentNode[], id: string): string {
  const node = findNodeById(nodes, id);
  return node ? node.name : id;
}
