/**
 * Comprehensive seed data for TingTing kiosk management system.
 *
 * Run:  npx tsx src/db/seed.ts
 *
 * Idempotent — safe to re-run. Uses fixed UUIDs so inserts can reference
 * each other across tables. ON CONFLICT DO NOTHING on every insert.
 */
import '../config/dotenv.js'
import { db, pool } from '../config/db.js'
import {
  users,
  businessEntities,
  categories,
  units,
  products,
  companies,
  customers,
  priceLists,
  priceListItems,
  orders,
  orderItems,
  payments,
  invoices,
} from '../db/schema/index.js'
import { hashPassword } from '../lib/password.js'

// ---------------------------------------------------------------------------
// Fixed UUIDs — deterministic so cross-table references are stable
// ---------------------------------------------------------------------------

// Units
const UID = {
  cai:       'a0000000-0000-0000-0000-000000000001',
  kg:        'a0000000-0000-0000-0000-000000000002',
  hop:       'a0000000-0000-0000-0000-000000000003',
  thung:     'a0000000-0000-0000-0000-000000000004',
  chai:      'a0000000-0000-0000-0000-000000000005',
  tui:       'a0000000-0000-0000-0000-000000000006',
  lit:       'a0000000-0000-0000-0000-000000000007',
  met:       'a0000000-0000-0000-0000-000000000008',
  cuon:      'a0000000-0000-0000-0000-000000000009',
  bo:        'a0000000-0000-0000-0000-000000000010',
} as const

// Categories — root
const CID = {
  doUong:       'b1000000-0000-0000-0000-000000000001',
  thucPham:     'b1000000-0000-0000-0000-000000000002',
  hoaPham:      'b1000000-0000-0000-0000-000000000003',
  doNhua:       'b1000000-0000-0000-0000-000000000004',
  // Children - Do uong
  nuocNgot:     'b1100000-0000-0000-0000-000000000001',
  nuocSuoi:     'b1100000-0000-0000-0000-000000000002',
  traCacLoai:   'b1100000-0000-0000-0000-000000000003',
  // Children - Thuc pham
  banhKeo:      'b1200000-0000-0000-0000-000000000001',
  miMien:       'b1200000-0000-0000-0000-000000000002',
  giaVi:        'b1200000-0000-0000-0000-000000000003',
  doKho:        'b1200000-0000-0000-0000-000000000004',
  // Children - Hoa pham
  nuocGiat:     'b1300000-0000-0000-0000-000000000001',
  nuocRuaChen:  'b1300000-0000-0000-0000-000000000002',
  // Children - Do nhua
  tuiNilon:     'b1400000-0000-0000-0000-000000000001',
  hopNhua:      'b1400000-0000-0000-0000-000000000002',
} as const

// Business Entity
const BID = {
  tingting: 'c0000000-0000-0000-0000-000000000001',
} as const

// Products SP0001-SP0020
const PID: Record<string, string> = {
  SP0001: 'd0000001-0000-0000-0000-000000000001',
  SP0002: 'd0000002-0000-0000-0000-000000000002',
  SP0003: 'd0000003-0000-0000-0000-000000000003',
  SP0004: 'd0000004-0000-0000-0000-000000000004',
  SP0005: 'd0000005-0000-0000-0000-000000000005',
  SP0006: 'd0000006-0000-0000-0000-000000000006',
  SP0007: 'd0000007-0000-0000-0000-000000000007',
  SP0008: 'd0000008-0000-0000-0000-000000000008',
  SP0009: 'd0000009-0000-0000-0000-000000000009',
  SP0010: 'd0000010-0000-0000-0000-000000000010',
  SP0011: 'd0000011-0000-0000-0000-000000000011',
  SP0012: 'd0000012-0000-0000-0000-000000000012',
  SP0013: 'd0000013-0000-0000-0000-000000000013',
  SP0014: 'd0000014-0000-0000-0000-000000000014',
  SP0015: 'd0000015-0000-0000-0000-000000000015',
  SP0016: 'd0000016-0000-0000-0000-000000000016',
  SP0017: 'd0000017-0000-0000-0000-000000000017',
  SP0018: 'd0000018-0000-0000-0000-000000000018',
  SP0019: 'd0000019-0000-0000-0000-000000000019',
  SP0020: 'd0000020-0000-0000-0000-000000000020',
}

// Companies
const COID = {
  huongLy:   'e0000001-0000-0000-0000-000000000001',
  hoaSen:    'e0000002-0000-0000-0000-000000000002',
  baGia:     'e0000003-0000-0000-0000-000000000003',
  thaoNguyen:'e0000004-0000-0000-0000-000000000004',
  phuongNam: 'e0000005-0000-0000-0000-000000000005',
} as const

// Price Lists
const PLID = {
  general:    'f0000000-0000-0000-0000-000000000000',
  huongLy:    'f0000001-0000-0000-0000-000000000001',
  hoaSen:     'f0000002-0000-0000-0000-000000000002',
  baGia:      'f0000003-0000-0000-0000-000000000003',
  thaoNguyen: 'f0000004-0000-0000-0000-000000000004',
  phuongNam:  'f0000005-0000-0000-0000-000000000005',
} as const

// Customers
const CUID = {
  minh1:      'g0000001-0000-0000-0000-000000000001',
  minh2:      'g0000002-0000-0000-0000-000000000002',
  lan1:       'g0000003-0000-0000-0000-000000000003',
  lan2:       'g0000004-0000-0000-0000-000000000004',
  hoa1:       'g0000005-0000-0000-0000-000000000005',
  nam1:       'g0000006-0000-0000-0000-000000000006',
  nam2:       'g0000007-0000-0000-0000-000000000007',
  hung1:      'g0000008-0000-0000-0000-000000000008',
} as const

// Users
const USID = {
  admin: 'h0000000-0000-0000-0000-000000000001',
  staff: 'h0000000-0000-0000-0000-000000000002',
} as const

// Orders
const OID = {
  order1: 'i0000001-0000-0000-0000-000000000001',
  order2: 'i0000002-0000-0000-0000-000000000002',
  order3: 'i0000003-0000-0000-0000-000000000003',
  order4: 'i0000004-0000-0000-0000-000000000004',
  order5: 'i0000005-0000-0000-0000-000000000005',
}
const IID = {
  invoice1: 'j0000001-0000-0000-0000-000000000001',
  invoice2: 'j0000002-0000-0000-0000-000000000002',
  invoice4: 'j0000004-0000-0000-0000-000000000004',
  invoice5: 'j0000005-0000-0000-0000-000000000005',
}

const now = new Date()

// ---------------------------------------------------------------------------
// Helper - insert with ON CONFLICT DO NOTHING
// ---------------------------------------------------------------------------
async function safeInsert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  label: string,
) {
  try {
    await db.insert(table).values(rows).onConflictDoNothing()
    console.log(`  [seed] ${label}: ${rows.length} rows OK`)
  } catch (err) {
    console.warn(`  [seed] ${label}: skipped (${(err as Error).message})`)
  }
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
export async function seed() {
  console.log('\n========================================')
  console.log('  TingTing Kiosk - Seed Data')
  console.log('========================================\n')

  // 1. Units ----------------------------------------------------------------
  console.log('[1/11] Units ...')
  await safeInsert(units, [
    { id: UID.cai,   name: 'Cai',      abbreviation: 'cai',   createdAt: now },
    { id: UID.kg,    name: 'Kilogram',  abbreviation: 'kg',    createdAt: now },
    { id: UID.hop,   name: 'Hop',      abbreviation: 'hop',   createdAt: now },
    { id: UID.thung, name: 'Thung',    abbreviation: 'thung', createdAt: now },
    { id: UID.chai,  name: 'Chai',     abbreviation: 'chai',  createdAt: now },
    { id: UID.tui,   name: 'Tui',      abbreviation: 'tui',   createdAt: now },
    { id: UID.lit,   name: 'Lit',      abbreviation: 'lit',   createdAt: now },
    { id: UID.met,   name: 'Met',      abbreviation: 'm',     createdAt: now },
    { id: UID.cuon,  name: 'Cuon',     abbreviation: 'cuon',  createdAt: now },
    { id: UID.bo,    name: 'Bo',       abbreviation: 'bo',    createdAt: now },
  ], 'units')

  // 2. Categories (root then children) --------------------------------------
  console.log('[2/11] Categories ...')
  await safeInsert(categories, [
    // Root categories
    { id: CID.doUong,   name: 'Do uong',     createdAt: now },
    { id: CID.thucPham, name: 'Thuc pham',   createdAt: now },
    { id: CID.hoaPham,  name: 'Hoa pham',    createdAt: now },
    { id: CID.doNhua,   name: 'Do nhua',     createdAt: now },
    // Children of Do uong
    { id: CID.nuocNgot,   name: 'Nuoc ngot',    parentId: CID.doUong, createdAt: now },
    { id: CID.nuocSuoi,   name: 'Nuoc suoi',    parentId: CID.doUong, createdAt: now },
    { id: CID.traCacLoai, name: 'Tra cac loai', parentId: CID.doUong, createdAt: now },
    // Children of Thuc pham
    { id: CID.banhKeo, name: 'Banh keo', parentId: CID.thucPham, createdAt: now },
    { id: CID.miMien,  name: 'Mi mien',  parentId: CID.thucPham, createdAt: now },
    { id: CID.giaVi,   name: 'Gia vi',   parentId: CID.thucPham, createdAt: now },
    { id: CID.doKho,   name: 'Do kho',   parentId: CID.thucPham, createdAt: now },
    // Children of Hoa pham
    { id: CID.nuocGiat,    name: 'Nuoc giat',     parentId: CID.hoaPham, createdAt: now },
    { id: CID.nuocRuaChen, name: 'Nuoc rua chen', parentId: CID.hoaPham, createdAt: now },
    // Children of Do nhua
    { id: CID.tuiNilon, name: 'Tui nilon', parentId: CID.doNhua, createdAt: now },
    { id: CID.hopNhua,  name: 'Hop nhua',  parentId: CID.doNhua, createdAt: now },
  ], 'categories')

  // 3. Business Entity ------------------------------------------------------
  console.log('[3/11] Business Entity ...')
  await safeInsert(businessEntities, [{
    id: BID.tingting,
    name: 'Ho kinh doanh TingTing',
    taxCode: '1234567890',
    address: '123 Nguyen Van Linh, Quan 7, TP.HCM',
    phone: '0901234567',
    email: 'info@tingting.vn',
    headerLines: [
      'HO KINH DOANH TINGTING',
      'Dia chi: 123 Nguyen Van Linh, Quan 7, TP.HCM',
      'Ma so thue: 1234567890',
      'Dien thoai: 0901234567',
    ],
    createdAt: now,
    updatedAt: now,
  }], 'business_entities')

  // 4. Users ----------------------------------------------------------------
  console.log('[4/11] Users ...')
  const adminHash = await hashPassword('Admin@123')
  const staffHash = await hashPassword('Staff@123')
  await safeInsert(users, [
    {
      id: USID.admin,
      email: 'admin@tingting.vn',
      name: 'Quan tri vien',
      passwordHash: adminHash,
      role: 'admin',
      isActive: true,
    },
    {
      id: USID.staff,
      email: 'staff@tingting.vn',
      name: 'Nhan vien ban hang',
      passwordHash: staffHash,
      role: 'staff',
      isActive: true,
    },
  ], 'users')

  // 5. Products (20) --------------------------------------------------------
  console.log('[5/11] Products ...')
  await safeInsert(products, [
    { id: PID.SP0001, code: 'SP0001', name: 'Nuoc suoi Aquafina 500ml',            categoryId: CID.nuocSuoi,     unitId: UID.chai,  purchasePrice: '3000',  defaultSalePrice: '5000',   stockQuantity: 200, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0002, code: 'SP0002', name: 'Nuoc ngot Coca Cola 330ml',            categoryId: CID.nuocNgot,     unitId: UID.chai,  purchasePrice: '5000',  defaultSalePrice: '8000',   stockQuantity: 150, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0003, code: 'SP0003', name: 'Tra xanh Khong Do 500ml',              categoryId: CID.traCacLoai,   unitId: UID.chai,  purchasePrice: '4500',  defaultSalePrice: '7000',   stockQuantity: 180, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0004, code: 'SP0004', name: 'Ca phe sua da Trung Nguyen',           categoryId: CID.doUong,       unitId: UID.hop,   purchasePrice: '80000', defaultSalePrice: '120000', stockQuantity: 50,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0005, code: 'SP0005', name: 'Banh Oishi 500g',                      categoryId: CID.banhKeo,      unitId: UID.hop,   purchasePrice: '25000', defaultSalePrice: '38000',  stockQuantity: 100, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0006, code: 'SP0006', name: 'Mi an lien Omachi (thung 30 goi)',      categoryId: CID.miMien,       unitId: UID.thung, purchasePrice: '85000', defaultSalePrice: '110000', stockQuantity: 80,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0007, code: 'SP0007', name: 'Nuoc mam Nam Ngu 500ml',               categoryId: CID.giaVi,        unitId: UID.chai,  purchasePrice: '18000', defaultSalePrice: '25000',  stockQuantity: 120, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0008, code: 'SP0008', name: 'Duong TNHH 1kg',                       categoryId: CID.doKho,        unitId: UID.tui,   purchasePrice: '22000', defaultSalePrice: '30000',  stockQuantity: 90,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0009, code: 'SP0009', name: 'Nuoc giat OMO 800g',                   categoryId: CID.nuocGiat,     unitId: UID.tui,   purchasePrice: '45000', defaultSalePrice: '62000',  stockQuantity: 60,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0010, code: 'SP0010', name: 'Nuoc rua chen Sunlight 800ml',         categoryId: CID.nuocRuaChen,  unitId: UID.chai,  purchasePrice: '28000', defaultSalePrice: '38000',  stockQuantity: 70,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0011, code: 'SP0011', name: 'Nuoc suoi Lavie 500ml',                categoryId: CID.nuocSuoi,     unitId: UID.chai,  purchasePrice: '3500',  defaultSalePrice: '5500',   stockQuantity: 200, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0012, code: 'SP0012', name: 'Nuoc ngot Pepsi 330ml',                categoryId: CID.nuocNgot,     unitId: UID.chai,  purchasePrice: '4800',  defaultSalePrice: '7500',   stockQuantity: 160, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0013, code: 'SP0013', name: 'Tra dao Twister 500ml',                categoryId: CID.traCacLoai,   unitId: UID.chai,  purchasePrice: '5500',  defaultSalePrice: '8000',   stockQuantity: 140, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0014, code: 'SP0014', name: 'Banh Cosy biscuit 350g',               categoryId: CID.banhKeo,      unitId: UID.hop,   purchasePrice: '20000', defaultSalePrice: '30000',  stockQuantity: 110, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0015, code: 'SP0015', name: 'Mi Hao Hao (thung 30 goi)',            categoryId: CID.miMien,       unitId: UID.thung, purchasePrice: '72000', defaultSalePrice: '95000',  stockQuantity: 90,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0016, code: 'SP0016', name: 'Nuoc tuong Chinsu 500ml',              categoryId: CID.giaVi,        unitId: UID.chai,  purchasePrice: '15000', defaultSalePrice: '22000',  stockQuantity: 100, isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0017, code: 'SP0017', name: 'Gao Jasmine 5kg',                      categoryId: CID.doKho,        unitId: UID.tui,   purchasePrice: '75000', defaultSalePrice: '95000',  stockQuantity: 50,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0018, code: 'SP0018', name: 'Tui nilon size M (cuon 500 tui)',      categoryId: CID.tuiNilon,     unitId: UID.cuon,  purchasePrice: '35000', defaultSalePrice: '50000',  stockQuantity: 40,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0019, code: 'SP0019', name: 'Hop nhua dung thuc an 500ml',          categoryId: CID.hopNhua,      unitId: UID.hop,   purchasePrice: '12000', defaultSalePrice: '18000',  stockQuantity: 80,  isActive: true, createdAt: now, updatedAt: now },
    { id: PID.SP0020, code: 'SP0020', name: 'Nuoc giat Aba 800g',                   categoryId: CID.nuocGiat,     unitId: UID.tui,   purchasePrice: '38000', defaultSalePrice: '52000',  stockQuantity: 55,  isActive: true, createdAt: now, updatedAt: now },
  ], 'products')

  // 6. Price Lists (1 general + 5 company) ----------------------------------
  console.log('[6/11] Price Lists ...')
  await safeInsert(priceLists, [
    { id: PLID.general,    name: 'Bang gia chung',                    companyId: null,              description: 'Bang gia mac dinh cho tat ca khach hang',  isDefault: true,  sortOrder: 0, createdAt: now, updatedAt: now },
    { id: PLID.huongLy,    name: 'Bang gia - Cua hang Huong Ly',     companyId: COID.huongLy,      description: 'Gia si cho Cua hang Huong Ly',            isDefault: false, sortOrder: 1, createdAt: now, updatedAt: now },
    { id: PLID.hoaSen,     name: 'Bang gia - Sieu thi Hoa Sen',      companyId: COID.hoaSen,       description: 'Gia si cho Sieu thi Mini Mart Hoa Sen',   isDefault: false, sortOrder: 2, createdAt: now, updatedAt: now },
    { id: PLID.baGia,      name: 'Bang gia - Tap hoa Ba Gia',        companyId: COID.baGia,        description: 'Gia si cho Tap hoa Ba Gia',               isDefault: false, sortOrder: 3, createdAt: now, updatedAt: now },
    { id: PLID.thaoNguyen, name: 'Bang gia - Cua hang Thao Nguyen',  companyId: COID.thaoNguyen,   description: 'Gia si cho Cua hang Thao Nguyen',         isDefault: false, sortOrder: 4, createdAt: now, updatedAt: now },
    { id: PLID.phuongNam,  name: 'Bang gia - Dai ly Phuong Nam',     companyId: COID.phuongNam,    description: 'Gia si cho Dai ly Phuong Nam',            isDefault: false, sortOrder: 5, createdAt: now, updatedAt: now },
  ], 'price_lists')

  // 7. Companies (5) - must come after price lists --------------------------
  console.log('[7/11] Companies ...')
  await safeInsert(companies, [
    { id: COID.huongLy,    name: 'Cua hang Huong Ly',           priceListId: PLID.huongLy,    address: '456 Le Van Viet, Quan 9, TP.HCM',    phone: '0912345678', email: 'huongly@email.com',   isActive: true, createdAt: now, updatedAt: now },
    { id: COID.hoaSen,     name: 'Sieu thi Mini Mart Hoa Sen',  priceListId: PLID.hoaSen,     address: '789 Nguyen Huu Canh, Binh Thanh',    phone: '0923456789', email: 'hoasen@email.com',    isActive: true, createdAt: now, updatedAt: now },
    { id: COID.baGia,      name: 'Tap hoa Ba Gia',              priceListId: PLID.baGia,      address: '12 Tran Nao, Quan 2, TP.HCM',        phone: '0934567890', email: 'bagia@email.com',     isActive: true, createdAt: now, updatedAt: now },
    { id: COID.thaoNguyen, name: 'Cua hang Thao Nguyen',        priceListId: PLID.thaoNguyen, address: '56 Dang Van Bi, Binh Thanh, TP.HCM', phone: '0945678901', email: 'thaonguyen@email.com', isActive: true, createdAt: now, updatedAt: now },
    { id: COID.phuongNam,  name: 'Dai ly Phuong Nam',           priceListId: PLID.phuongNam,  address: '101 Xa Lo Ha Noi, Thu Duc, TP.HCM',  phone: '0956789012', email: 'phuongnam@email.com', isActive: true, createdAt: now, updatedAt: now },
  ], 'companies')

  // 8. Customers (8) --------------------------------------------------------
  console.log('[8/11] Customers ...')
  await safeInsert(customers, [
    // Cua hang Huong Ly - 2 branches
    { id: CUID.minh1, code: 'KH0001', name: 'Chi nhanh Minh Khai',       companyId: COID.huongLy,    address: '456 Le Van Viet, Quan 9',       phone: '0912345001', isActive: true, createdAt: now, updatedAt: now },
    { id: CUID.minh2, code: 'KH0002', name: 'Chi nhanh Phuoc Binh',      companyId: COID.huongLy,    address: '22 Phuoc Binh, Quan 9',         phone: '0912345002', isActive: true, createdAt: now, updatedAt: now },
    // Sieu thi Hoa Sen - 2 branches
    { id: CUID.lan1,  code: 'KH0003', name: 'Chi nhanh An Phu',          companyId: COID.hoaSen,     address: '789 Nguyen Huu Canh, BT',       phone: '0923456001', isActive: true, createdAt: now, updatedAt: now },
    { id: CUID.lan2,  code: 'KH0004', name: 'Chi nhanh Binh Thanh',      companyId: COID.hoaSen,     address: '150 Bach Dang, Binh Thanh',     phone: '0923456002', isActive: true, createdAt: now, updatedAt: now },
    // Tap hoa Ba Gia - 1
    { id: CUID.hoa1,  code: 'KH0005', name: 'Tap hoa Ba Gia (chinh)',    companyId: COID.baGia,      address: '12 Tran Nao, Quan 2',           phone: '0934567001', isActive: true, createdAt: now, updatedAt: now },
    // Cua hang Thao Nguyen - 1
    { id: CUID.nam1,  code: 'KH0006', name: 'Cua hang Thao Nguyen (chinh)', companyId: COID.thaoNguyen, address: '56 Dang Van Bi, BT',          phone: '0945678001', isActive: true, createdAt: now, updatedAt: now },
    // Dai ly Phuong Nam - 2 branches
    { id: CUID.nam2,  code: 'KH0007', name: 'Chi nhanh Linh Trung',      companyId: COID.phuongNam,  address: '101 Xa Lo Ha Noi, Thu Duc',    phone: '0956789001', isActive: true, createdAt: now, updatedAt: now },
    { id: CUID.hung1, code: 'KH0008', name: 'Chi nhanh Binh Chieu',      companyId: COID.phuongNam,  address: '200 Vo Van Ngan, Thu Duc',     phone: '0956789002', isActive: true, createdAt: now, updatedAt: now },
  ], 'customers')

  // 9. Price List Items - general list uses defaultSalePrice ----------------
  //    Company-specific lists get slight discounts (-5% to -15%)
  console.log('[9/11] Price List Items ...')

  const allProductCodes = Object.keys(PID)

  const defaultPrices: Record<string, string> = {
    SP0001: '5000',  SP0002: '8000',  SP0003: '7000',  SP0004: '120000',
    SP0005: '38000', SP0006: '110000', SP0007: '25000', SP0008: '30000',
    SP0009: '62000', SP0010: '38000', SP0011: '5500',  SP0012: '7500',
    SP0013: '8000',  SP0014: '30000', SP0015: '95000', SP0016: '22000',
    SP0017: '95000', SP0018: '50000', SP0019: '18000', SP0020: '52000',
  }

  // General price list items - use defaultSalePrice directly
  const generalItems = allProductCodes.map((code) => ({
    id: `fa${PID[code as keyof typeof PID]!.slice(2)}`,
    priceListId: PLID.general,
    productId: PID[code as keyof typeof PID]!,
    customPrice: defaultPrices[code]!,
    createdAt: now,
    updatedAt: now,
  }))
  await safeInsert(priceListItems, generalItems, 'price_list_items (general)')

  // Company-specific price lists - tiered discounts
  function discountPrice(base: string, pct: number): string {
    return (parseInt(base, 10) * (100 - pct) / 100).toFixed(0)
  }

  const companyDiscounts: Array<{ plId: string; pct: number; label: string }> = [
    { plId: PLID.huongLy,    pct: 5,  label: 'Huong Ly' },
    { plId: PLID.hoaSen,     pct: 10, label: 'Hoa Sen' },
    { plId: PLID.baGia,      pct: 5,  label: 'Ba Gia' },
    { plId: PLID.thaoNguyen, pct: 8,  label: 'Thao Nguyen' },
    { plId: PLID.phuongNam,  pct: 15, label: 'Phuong Nam' },
  ]

  for (const { plId, pct, label } of companyDiscounts) {
    const items = allProductCodes.map((code, idx) => ({
      id: `${plId.slice(0, 2)}${String(idx + 1).padStart(2, '0')}${PID[code as keyof typeof PID]!.slice(2)}`,
      priceListId: plId,
      productId: PID[code as keyof typeof PID]!,
      customPrice: discountPrice(defaultPrices[code]!, pct),
      createdAt: now,
      updatedAt: now,
    }))
    await safeInsert(priceListItems, items, `price_list_items (${label})`)
  }

  // 10. Sample Orders (5) ---------------------------------------------------
  console.log('[10/11] Orders & Items ...')

  // Order 1: Cua hang Huong Ly - 3 items - completed, fully paid
  await safeInsert(orders, [{
    id: OID.order1,
    code: 'DH000001',
    customerId: CUID.minh1,
    businessEntityId: BID.tingting,
    status: 'completed',
    subtotal: '485000',
    discount: '0',
    total: '485000',
    paidAmount: '485000',
    createdBy: USID.staff,
    createdAt: new Date('2026-06-01T08:30:00+07:00'),
    updatedAt: new Date('2026-06-01T08:30:00+07:00'),
  }], 'order DH000001')
  await safeInsert(orderItems, [
    { id: 'k0000001-0000-0000-0000-000000000001', orderId: OID.order1, productId: PID.SP0002, productName: 'Nuoc ngot Coca Cola 330ml',              unit: 'chai',  quantity: '10', unitPrice: '7500',  totalPrice: '75000',  sortOrder: 1 },
    { id: 'k0000002-0000-0000-0000-000000000002', orderId: OID.order1, productId: PID.SP0006, productName: 'Mi an lien Omachi (thung 30 goi)',     unit: 'thung', quantity: '2',  unitPrice: '105000', totalPrice: '210000', sortOrder: 2 },
    { id: 'k0000003-0000-0000-0000-000000000003', orderId: OID.order1, productId: PID.SP0010, productName: 'Nuoc rua chen Sunlight 800ml',         unit: 'chai',  quantity: '5',  unitPrice: '40000',  totalPrice: '200000', sortOrder: 3 },
  ], 'order_items DH000001')
  await safeInsert(payments, [{
    id: 'l0000001-0000-0000-0000-000000000001',
    orderId: OID.order1,
    amount: '485000',
    method: 'cash',
    paidAt: new Date('2026-06-01T08:35:00+07:00'),
    createdBy: USID.staff,
  }], 'payment DH000001')

  // Order 2: Sieu thi Hoa Sen - 5 items - completed, partially paid
  await safeInsert(orders, [{
    id: OID.order2,
    code: 'DH000002',
    customerId: CUID.lan1,
    businessEntityId: BID.tingting,
    status: 'completed',
    subtotal: '1500000',
    discount: '50000',
    total: '1450000',
    paidAmount: '1000000',
    createdBy: USID.staff,
    createdAt: new Date('2026-06-03T10:15:00+07:00'),
    updatedAt: new Date('2026-06-03T10:15:00+07:00'),
  }], 'order DH000002')
  await safeInsert(orderItems, [
    { id: 'k0000004-0000-0000-0000-000000000004', orderId: OID.order2, productId: PID.SP0001, productName: 'Nuoc suoi Aquafina 500ml',       unit: 'chai',  quantity: '50', unitPrice: '4500',  totalPrice: '225000',  sortOrder: 1 },
    { id: 'k0000005-0000-0000-0000-000000000005', orderId: OID.order2, productId: PID.SP0003, productName: 'Tra xanh Khong Do 500ml',        unit: 'chai',  quantity: '30', unitPrice: '6500',  totalPrice: '195000',  sortOrder: 2 },
    { id: 'k0000006-0000-0000-0000-000000000006', orderId: OID.order2, productId: PID.SP0005, productName: 'Banh Oishi 500g',                unit: 'hop',   quantity: '10', unitPrice: '35000', totalPrice: '350000',  sortOrder: 3 },
    { id: 'k0000007-0000-0000-0000-000000000007', orderId: OID.order2, productId: PID.SP0009, productName: 'Nuoc giat OMO 800g',             unit: 'tui',   quantity: '5',  unitPrice: '58000', totalPrice: '290000',  sortOrder: 4 },
    { id: 'k0000008-0000-0000-0000-000000000008', orderId: OID.order2, productId: PID.SP0017, productName: 'Gao Jasmine 5kg',               unit: 'tui',   quantity: '5',  unitPrice: '88000', totalPrice: '440000',  sortOrder: 5 },
  ], 'order_items DH000002')
  await safeInsert(payments, [{
    id: 'l0000002-0000-0000-0000-000000000002',
    orderId: OID.order2,
    amount: '1000000',
    method: 'bank_transfer',
    paidAt: new Date('2026-06-03T10:20:00+07:00'),
    note: 'Chuyen khoan lan 1',
    createdBy: USID.staff,
  }], 'payment DH000002')

  // Order 3: Tap hoa Ba Gia - 4 items - confirmed (not yet completed)
  await safeInsert(orders, [{
    id: OID.order3,
    code: 'DH000003',
    customerId: CUID.hoa1,
    businessEntityId: BID.tingting,
    status: 'confirmed',
    subtotal: '680000',
    discount: '0',
    total: '680000',
    paidAmount: '0',
    createdBy: USID.admin,
    createdAt: new Date('2026-06-05T14:00:00+07:00'),
    updatedAt: new Date('2026-06-05T14:00:00+07:00'),
  }], 'order DH000003')
  await safeInsert(orderItems, [
    { id: 'k0000009-0000-0000-0000-000000000009', orderId: OID.order3, productId: PID.SP0007, productName: 'Nuoc mam Nam Ngu 500ml',     unit: 'chai', quantity: '10', unitPrice: '24000', totalPrice: '240000', sortOrder: 1 },
    { id: 'k0000010-0000-0000-0000-000000000010', orderId: OID.order3, productId: PID.SP0008, productName: 'Duong TNHH 1kg',             unit: 'tui',  quantity: '5',  unitPrice: '29000', totalPrice: '145000', sortOrder: 2 },
    { id: 'k0000011-0000-0000-0000-000000000011', orderId: OID.order3, productId: PID.SP0016, productName: 'Nuoc tuong Chinsu 500ml',    unit: 'chai', quantity: '10', unitPrice: '21000', totalPrice: '210000', sortOrder: 3 },
    { id: 'k0000012-0000-0000-0000-000000000012', orderId: OID.order3, productId: PID.SP0014, productName: 'Banh Cosy biscuit 350g',      unit: 'hop',  quantity: '3',  unitPrice: '28000', totalPrice: '84000',  sortOrder: 4 },
  ], 'order_items DH000003')

  // Order 4: Cua hang Thao Nguyen - 2 items - completed, fully paid
  await safeInsert(orders, [{
    id: OID.order4,
    code: 'DH000004',
    customerId: CUID.nam1,
    businessEntityId: BID.tingting,
    status: 'completed',
    subtotal: '320000',
    discount: '20000',
    total: '300000',
    paidAmount: '300000',
    createdBy: USID.staff,
    createdAt: new Date('2026-06-07T09:45:00+07:00'),
    updatedAt: new Date('2026-06-07T09:45:00+07:00'),
  }], 'order DH000004')
  await safeInsert(orderItems, [
    { id: 'k0000013-0000-0000-0000-000000000013', orderId: OID.order4, productId: PID.SP0015, productName: 'Mi Hao Hao (thung 30 goi)', unit: 'thung', quantity: '2', unitPrice: '90000',  totalPrice: '180000', sortOrder: 1 },
    { id: 'k0000014-0000-0000-0000-000000000014', orderId: OID.order4, productId: PID.SP0004, productName: 'Ca phe sua da Trung Nguyen', unit: 'hop',   quantity: '1', unitPrice: '140000', totalPrice: '140000', sortOrder: 2 },
  ], 'order_items DH000004')
  await safeInsert(payments, [{
    id: 'l0000004-0000-0000-0000-000000000004',
    orderId: OID.order4,
    amount: '300000',
    method: 'cash',
    paidAt: new Date('2026-06-07T09:50:00+07:00'),
    createdBy: USID.staff,
  }], 'payment DH000004')

  // Order 5: Dai ly Phuong Nam - 6 items - completed, partially paid
  await safeInsert(orders, [{
    id: OID.order5,
    code: 'DH000005',
    customerId: CUID.nam2,
    businessEntityId: BID.tingting,
    status: 'completed',
    subtotal: '2350000',
    discount: '100000',
    total: '2250000',
    paidAmount: '1500000',
    notes: 'Giao hang truoc 12h trua',
    createdBy: USID.admin,
    createdAt: new Date('2026-06-09T07:30:00+07:00'),
    updatedAt: new Date('2026-06-09T07:30:00+07:00'),
  }], 'order DH000005')
  await safeInsert(orderItems, [
    { id: 'k0000015-0000-0000-0000-000000000015', orderId: OID.order5, productId: PID.SP0002, productName: 'Nuoc ngot Coca Cola 330ml',           unit: 'chai',  quantity: '20', unitPrice: '7000',  totalPrice: '140000',  sortOrder: 1 },
    { id: 'k0000016-0000-0000-0000-000000000016', orderId: OID.order5, productId: PID.SP0006, productName: 'Mi an lien Omachi (thung 30 goi)',     unit: 'thung', quantity: '5',  unitPrice: '95000', totalPrice: '475000',  sortOrder: 2 },
    { id: 'k0000017-0000-0000-0000-000000000017', orderId: OID.order5, productId: PID.SP0011, productName: 'Nuoc suoi Lavie 500ml',                unit: 'chai',  quantity: '30', unitPrice: '4800',  totalPrice: '144000',  sortOrder: 3 },
    { id: 'k0000018-0000-0000-0000-000000000018', orderId: OID.order5, productId: PID.SP0009, productName: 'Nuoc giat OMO 800g',                   unit: 'tui',   quantity: '10', unitPrice: '54000', totalPrice: '540000',  sortOrder: 4 },
    { id: 'k0000019-0000-0000-0000-000000000019', orderId: OID.order5, productId: PID.SP0017, productName: 'Gao Jasmine 5kg',                      unit: 'tui',   quantity: '10', unitPrice: '82000', totalPrice: '820000',  sortOrder: 5 },
    { id: 'k0000020-0000-0000-0000-000000000020', orderId: OID.order5, productId: PID.SP0020, productName: 'Nuoc giat Aba 800g',                   unit: 'tui',   quantity: '5',  unitPrice: '45000', totalPrice: '225000',  sortOrder: 6 },
  ], 'order_items DH000005')
  await safeInsert(payments, [
    {
      id: 'l0000051-0000-0000-0000-000000000051',
      orderId: OID.order5,
      amount: '1000000',
      method: 'bank_transfer',
      paidAt: new Date('2026-06-09T08:00:00+07:00'),
      note: 'Chuyen khoan Vietcombank',
      createdBy: USID.admin,
    },
    {
      id: 'l0000052-0000-0000-0000-000000000052',
      orderId: OID.order5,
      amount: '500000',
      method: 'cash',
      paidAt: new Date('2026-06-09T12:30:00+07:00'),
      note: 'Tien mat khi giao hang',
      createdBy: USID.staff,
    },
  ], 'payments DH000005')

  // 11. Invoices for completed orders ----------------------------------------
  console.log('[11/11] Invoices ...')
  await safeInsert(invoices, [
    {
      id: IID.invoice1,
      code: 'HD000001',
      orderId: OID.order1,
      customerId: CUID.minh1,
      businessEntityId: BID.tingting,
      status: 'completed',
      subtotal: '485000',
      discount: '0',
      total: '485000',
      paidAmount: '485000',
      issuedAt: new Date('2026-06-01T08:35:00+07:00'),
    },
    {
      id: IID.invoice2,
      code: 'HD000002',
      orderId: OID.order2,
      customerId: CUID.lan1,
      businessEntityId: BID.tingting,
      status: 'completed',
      subtotal: '1500000',
      discount: '50000',
      total: '1450000',
      paidAmount: '1000000',
      issuedAt: new Date('2026-06-03T10:20:00+07:00'),
    },
    {
      id: IID.invoice4,
      code: 'HD000004',
      orderId: OID.order4,
      customerId: CUID.nam1,
      businessEntityId: BID.tingting,
      status: 'completed',
      subtotal: '320000',
      discount: '20000',
      total: '300000',
      paidAmount: '300000',
      issuedAt: new Date('2026-06-07T09:50:00+07:00'),
    },
    {
      id: IID.invoice5,
      code: 'HD000005',
      orderId: OID.order5,
      customerId: CUID.nam2,
      businessEntityId: BID.tingting,
      status: 'completed',
      subtotal: '2350000',
      discount: '100000',
      total: '2250000',
      paidAmount: '1500000',
      issuedAt: new Date('2026-06-09T08:00:00+07:00'),
    },
  ], 'invoices')

  console.log('\n========================================')
  console.log('  Seed complete!')
  console.log('  - 2 users (admin + staff)')
  console.log('  - 1 business entity')
  console.log('  - 10 units, 15 categories')
  console.log('  - 20 products')
  console.log('  - 6 price lists (1 general + 5 company)')
  console.log('  - 120 price list items (20 per list)')
  console.log('  - 5 companies, 8 customers')
  console.log('  - 5 orders with line items + payments')
  console.log('  - 4 invoices')
  console.log('========================================\n')
}

// Run if called directly
const isMain = process.argv[1]?.includes('seed')
if (isMain) {
  seed()
    .then(async () => { console.log('Seed complete'); await pool.end(); process.exit(0) })
    .catch(async (e) => { console.error('Seed failed:', e); await pool.end().catch(() => {}); process.exit(1) })
}
