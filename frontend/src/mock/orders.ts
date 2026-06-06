import type { Order } from '@/types/order'

function makeOrder(
  id: string, code: string, customerId: string, customerName: string,
  companyId: string, date: string, items: { pid: string; pname: string; unit: string; qty: number; price: number }[],
  discount: number, beId: string, status: Order['status']
): Order {
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  return {
    id, code, customerId, customerName, companyId, date,
    items: items.map((i) => ({ productId: i.pid, productName: i.pname, unit: i.unit, quantity: i.qty, unitPrice: i.price, total: i.qty * i.price })),
    subtotal, discount, total: subtotal - discount, businessEntityId: beId, status,
  }
}

export const orders: Order[] = [
  makeOrder('o1', 'DH001540', 'cu4', 'Tiệc Cưới Pandora', 'c2', '2026-06-06T14:35:00', [
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 100, price: 18000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 10, price: 385000 },
    { pid: 'p23', pname: 'Bột Nêm', unit: 'Gói', qty: 50, price: 23000 },
    { pid: 'p22', pname: 'Cốt Dừa', unit: 'Lon', qty: 30, price: 29000 },
  ], 50000, 'be-2', 'completed'),
  makeOrder('o2', 'DH001539', 'cu1', 'Chợ Cuốn Aeon', 'c3', '2026-06-06T10:15:00', [
    { pid: 'p1', pname: 'Tiêu Hạt Đen', unit: 'Cân', qty: 5, price: 110000 },
    { pid: 'p14', pname: 'Tỏi Khô', unit: 'Cân', qty: 10, price: 80000 },
    { pid: 'p10', pname: 'Nước Mắm Nam Ngư', unit: 'Chai', qty: 20, price: 36000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o3', 'DH001538', 'cu2', 'Buffet Poseidon Cơ sở 1', 'c1', '2026-06-05T22:08:00', [
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 200, price: 19000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 20, price: 380000 },
    { pid: 'p22', pname: 'Cốt Dừa', unit: 'Lon', qty: 80, price: 29000 },
    { pid: 'p3', pname: 'Nấm Hương Khô', unit: 'Cân', qty: 10, price: 230000 },
  ], 100000, 'be-1', 'completed'),
  makeOrder('o4', 'DH001537', 'cu5', 'Mộc Liên Đồng Gia', 'c4', '2026-06-05T16:30:00', [
    { pid: 'p30', pname: 'Bột Mì Số 11', unit: 'Cân', qty: 50, price: 19000 },
    { pid: 'p24', pname: 'Bột Ngọt (MSG)', unit: 'Gói', qty: 30, price: 17000 },
    { pid: 'p9', pname: 'Muối Iốt', unit: 'Gói', qty: 20, price: 7500 },
  ], 0, 'be-2', 'completed'),
  makeOrder('o5', 'DH001536', 'cu7', 'Tiệm Nướng K&K', 'c3', '2026-06-05T11:20:00', [
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 5, price: 380000 },
    { pid: 'p25', pname: 'Tương Ớt', unit: 'Chai', qty: 40, price: 20000 },
    { pid: 'p16', pname: 'Ớt Bột', unit: 'Gói', qty: 15, price: 42000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o6', 'DH001535', 'cu8', 'Golden Fork Citadel', 'c6', '2026-06-04T15:45:00', [
    { pid: 'p1', pname: 'Tiêu Hạt Đen', unit: 'Cân', qty: 8, price: 115000 },
    { pid: 'p11', pname: 'Nước Mắm Phú Quốc', unit: 'Chai', qty: 20, price: 72000 },
    { pid: 'p12', pname: 'Xì Dầu (Nước Tương)', unit: 'Chai', qty: 15, price: 40000 },
  ], 20000, 'be-1', 'completed'),
  makeOrder('o7', 'DH001534', 'cu10', 'Nhà hàng Đại Việt', 'c7', '2026-06-04T09:30:00', [
    { pid: 'p34', pname: 'Phở Khô', unit: 'Cân', qty: 100, price: 33000 },
    { pid: 'p23', pname: 'Bột Nêm', unit: 'Gói', qty: 40, price: 24000 },
    { pid: 'p10', pname: 'Nước Mắm Nam Ngư', unit: 'Chai', qty: 25, price: 36000 },
  ], 0, 'be-2', 'completed'),
  makeOrder('o8', 'DH001533', 'cu11', 'Phố Phở Hoàn Kiếm', 'c8', '2026-06-03T18:00:00', [
    { pid: 'p34', pname: 'Phở Khô', unit: 'Cân', qty: 60, price: 34000 },
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 30, price: 19000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 3, price: 390000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o9', 'DH001532', 'cu3', 'Buffet Poseidon Cơ sở 2', 'c1', '2026-06-03T14:20:00', [
    { pid: 'p7', pname: 'Dầu Ô Liu', unit: 'Chai', qty: 10, price: 160000 },
    { pid: 'p22', pname: 'Cốt Dừa', unit: 'Lon', qty: 40, price: 29000 },
    { pid: 'p3', pname: 'Nấm Hương Khô', unit: 'Cân', qty: 5, price: 230000 },
  ], 30000, 'be-1', 'completed'),
  makeOrder('o10', 'DH001531', 'cu14', 'Nhà hàng Hồng Hạnh 1', 'c2', '2026-06-02T11:00:00', [
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 80, price: 18000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 8, price: 360000 },
    { pid: 'p15', pname: 'Hành Khô', unit: 'Cân', qty: 10, price: 54000 },
    { pid: 'p14', pname: 'Tỏi Khô', unit: 'Cân', qty: 8, price: 80000 },
  ], 40000, 'be-2', 'completed'),
  makeOrder('o11', 'DH001530', 'cu18', 'Pandora Garden', 'c5', '2026-06-01T16:00:00', [
    { pid: 'p30', pname: 'Bột Mì Số 11', unit: 'Cân', qty: 40, price: 18000 },
    { pid: 'p31', pname: 'Bột Mì Số 13', unit: 'Cân', qty: 30, price: 21000 },
    { pid: 'p4', pname: 'Bột Chiên Xù', unit: 'Hộp', qty: 20, price: 32000 },
  ], 0, 'be-2', 'completed'),
  makeOrder('o12', 'DH001529', 'cu16', 'Sushi Sakura', 'c3', '2026-06-01T10:30:00', [
    { pid: 'p27', pname: 'Nước Cốt Chanh', unit: 'Chai', qty: 15, price: 24000 },
    { pid: 'p12', pname: 'Xì Dầu (Nước Tương)', unit: 'Chai', qty: 10, price: 40000 },
    { pid: 'p11', pname: 'Nước Mắm Phú Quốc', unit: 'Chai', qty: 10, price: 72000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o13', 'DH001528', 'cu20', 'Phố Phở Thái Hà', 'c8', '2026-05-31T13:00:00', [
    { pid: 'p34', pname: 'Phở Khô', unit: 'Cân', qty: 80, price: 34000 },
    { pid: 'p23', pname: 'Bột Nêm', unit: 'Gói', qty: 30, price: 24000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o14', 'DH001527', 'cu9', 'Golden Fork Riverside', 'c6', '2026-05-30T17:30:00', [
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 6, price: 375000 },
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 50, price: 19000 },
    { pid: 'p1', pname: 'Tiêu Hạt Đen', unit: 'Cân', qty: 3, price: 115000 },
  ], 10000, 'be-1', 'completed'),
  makeOrder('o15', 'DH001526', 'cu17', 'Mộc Liên Long Biên', 'c4', '2026-05-29T09:00:00', [
    { pid: 'p32', pname: 'Mì Trứng', unit: 'Thùng', qty: 5, price: 105000 },
    { pid: 'p33', pname: 'Miến Đồng', unit: 'Cân', qty: 15, price: 52000 },
    { pid: 'p9', pname: 'Muối Iốt', unit: 'Gói', qty: 10, price: 7500 },
  ], 0, 'be-2', 'completed'),
  makeOrder('o16', 'DH001525', 'cu23', 'Hotpot World', 'c1', '2026-05-28T19:00:00', [
    { pid: 'p22', pname: 'Cốt Dừa', unit: 'Lon', qty: 60, price: 29000 },
    { pid: 'p25', pname: 'Tương Ớt', unit: 'Chai', qty: 30, price: 20000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 10, price: 380000 },
  ], 50000, 'be-1', 'completed'),
  makeOrder('o17', 'DH001524', 'cu12', 'Phố Phở Đống Đa', 'c8', '2026-05-27T08:00:00', [
    { pid: 'p34', pname: 'Phở Khô', unit: 'Cân', qty: 50, price: 34000 },
    { pid: 'p10', pname: 'Nước Mắm Nam Ngư', unit: 'Chai', qty: 15, price: 36000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o18', 'DH001523', 'cu19', 'Golden Fork Premium', 'c6', '2026-05-26T14:00:00', [
    { pid: 'p3', pname: 'Nấm Hương Khô', unit: 'Cân', qty: 8, price: 235000 },
    { pid: 'p7', pname: 'Dầu Ô Liu', unit: 'Chai', qty: 12, price: 160000 },
    { pid: 'p11', pname: 'Nước Mắm Phú Quốc', unit: 'Chai', qty: 8, price: 72000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o19', 'DH001522', 'cu13', 'Buffet Poseidon Cơ sở 3', 'c1', '2026-05-25T12:00:00', [
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 150, price: 19000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 15, price: 380000 },
    { pid: 'p22', pname: 'Cốt Dừa', unit: 'Lon', qty: 50, price: 29000 },
    { pid: 'p23', pname: 'Bột Nêm', unit: 'Gói', qty: 40, price: 23000 },
  ], 80000, 'be-1', 'completed'),
  makeOrder('o20', 'DH001521', 'cu15', 'Nhà hàng Hồng Hạnh 2', 'c2', '2026-05-24T10:00:00', [
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 4, price: 360000 },
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 40, price: 18000 },
    { pid: 'p14', pname: 'Tỏi Khô', unit: 'Cân', qty: 5, price: 80000 },
  ], 0, 'be-2', 'completed'),
  makeOrder('o21', 'DH001520', 'cu21', 'BBQ Master Hải Phòng', 'c3', '2026-05-23T15:00:00', [
    { pid: 'p16', pname: 'Ớt Bột', unit: 'Gói', qty: 20, price: 42000 },
    { pid: 'p25', pname: 'Tương Ớt', unit: 'Chai', qty: 30, price: 20000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 3, price: 380000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o22', 'DH001519', 'cu24', 'The Kitchen Table', 'c6', '2026-05-22T11:30:00', [
    { pid: 'p1', pname: 'Tiêu Hạt Đen', unit: 'Cân', qty: 4, price: 115000 },
    { pid: 'p12', pname: 'Xì Dầu (Nước Tương)', unit: 'Chai', qty: 8, price: 40000 },
    { pid: 'p27', pname: 'Nước Cốt Chanh', unit: 'Chai', qty: 10, price: 24000 },
  ], 0, 'be-1', 'completed'),
  makeOrder('o23', 'DH001518', 'cu25', 'Dim Sum Palace', 'c7', '2026-05-21T09:00:00', [
    { pid: 'p30', pname: 'Bột Mì Số 11', unit: 'Cân', qty: 60, price: 19000 },
    { pid: 'p31', pname: 'Bột Mì Số 13', unit: 'Cân', qty: 40, price: 22000 },
    { pid: 'p9', pname: 'Muối Iốt', unit: 'Gói', qty: 15, price: 7500 },
  ], 0, 'be-2', 'completed'),
  makeOrder('o24', 'DH001517', 'cu6', 'Mộc Liên Cầu Giấy', 'c4', '2026-05-20T14:30:00', [
    { pid: 'p8', pname: 'Đường Trắng', unit: 'Cân', qty: 60, price: 19000 },
    { pid: 'p6', pname: 'Dầu Ăn', unit: 'Thùng', qty: 6, price: 380000 },
    { pid: 'p23', pname: 'Bột Nêm', unit: 'Gói', qty: 25, price: 23000 },
  ], 20000, 'be-1', 'completed'),
  makeOrder('o25', 'DH001516', 'cu22', 'Nhà hàng Sea View', 'c7', '2026-05-19T16:00:00', [
    { pid: 'p3', pname: 'Nấm Hương Khô', unit: 'Cân', qty: 6, price: 235000 },
    { pid: 'p22', pname: 'Cốt Dừa', unit: 'Lon', qty: 25, price: 30000 },
    { pid: 'p11', pname: 'Nước Mắm Phú Quốc', unit: 'Chai', qty: 12, price: 72000 },
  ], 0, 'be-2', 'completed'),
]
