TÀI LIỆU ĐẶC TẢ YÊU CẦU PHÁT TRIỂN PHẦN MỀM
HỆ THỐNG QUẢN LÝ BÁN HÀNG VÀ ĐỐI CHIẾU CÔNG NỢ BÁN BUÔN (MÔ HÌNH THỰC PHẨM)

================================================================================

PHẦN I: MỤC TIÊU DỰ ÁN VÀ ĐỊNH HƯỚNG SẢN PHẨM

1. Phân khúc khách hàng mục tiêu
- Mô hình kinh doanh chủ đạo là Bán buôn (Doanh nghiệp bán cho Doanh nghiệp), chuyên cung cấp mặt hàng nguyên liệu thô, gia vị, nông sản cho các chuỗi nhà hàng lớn.
- Hầu như không phát sinh giao dịch bán lẻ cho người tiêu dùng cá nhân.

2. Triết lý thiết kế (Mô hình tinh gọn)
- Tối giản tối đa: Loại bỏ toàn bộ các tính năng cồng kềnh như quản lý nhân sự, chấm công, bảng lương, sổ quỹ nội bộ, bán hàng trực tuyến, tự động hóa thuế và kế toán để giảm thiểu sai sót và đẩy nhanh tốc độ vận hành.
- Tập trung vào nhu cầu cốt lõi: Giải quyết bài toán quản lý đa bảng giá theo chuỗi nhà hàng, linh hoạt in hóa đơn theo các hộ kinh doanh cá thể khác nhau, và cung cấp tính năng "truy vết" dữ liệu báo cáo chi tiết đến từng ngày và từng đơn của một mặt hàng để phục vụ đối chiếu công nợ cuối tháng.


PHẦN II: ĐẶC TẢ CHI TIẾT CÁC TÍNH NĂNG THÀNH PHẦN

1. Phân hệ quản lý Hàng hóa và Thiết lập giá

1.1. Quản lý danh mục sản phẩm
- Trường thông tin sản phẩm: Mã hàng, Tên mặt hàng, Nhóm hàng, Đơn vị tính (Thùng, Cân, Gói, Hộp, Chai...), Mô tả sản phẩm, Giá nhập vào, Giá bán mặc định.
- Nhóm hàng: Hiển thị dưới dạng dropdown, nếu danh sách trống người dùng có thể thêm mới trực tiếp inline.
- Đơn vị tính: Hiển thị dưới dạng dropdown, nếu danh sách trống người dùng có thể thêm mới trực tiếp inline.
- Giá bán mặc định: Sử dụng giá từ Bảng giá chung nếu đã tồn tại. Nếu chưa có, cho phép nhập giá trị thủ công — hệ thống sẽ tự động tạo một bản ghi Bảng giá chung mới khi sản phẩm được lưu.
- Phân nhóm hàng hóa: Cho phép tạo danh mục phân loại nhiều cấp. Hiện tại tập trung vào nhóm Gia vị, hệ thống phải sẵn sàng hạ tầng kỹ thuật để mở rộng sang các nhóm khác trong tương lai.

1.2. Cơ chế đa bảng giá cho khách hàng
- Bảng giá chung: Là bảng giá chuẩn áp dụng cho bán lẻ hoặc dùng làm cơ sở tham chiếu ban đầu cho toàn bộ sản phẩm.
- Bảng giá theo đối tác: Cho phép tạo không giới hạn các bảng giá riêng biệt cho từng nhóm khách hàng. Mỗi bảng giá cho phép tùy chỉnh giá bán của từng mã sản phẩm độc lập.
- Ghi đè giá trực tiếp: Cho phép người dùng sửa giá bằng tay ngay tại màn hình tạo đơn hàng nếu chưa có giá tùy chỉnh nào được thiết lập trước.

2. Phân hệ quản lý Khách hàng

2.1. Nhóm khách hàng và Khách hàng
Hệ thống quản lý đối tác theo cấu trúc hai tầng:
- Nhóm khách hàng (Công ty/Chuỗi): Đại diện cho pháp nhân hoặc chuỗi hệ thống. Được gán cố định với một Bảng giá tùy chỉnh cụ thể.
- Khách hàng (Chi nhánh/Nhà hàng): Là điểm nhận hàng thực tế. Mỗi khách hàng bắt buộc phải thuộc một Nhóm khách hàng để tự động thừa hưởng bảng giá từ nhóm đó.

2.2. Thông tin hồ sơ Khách hàng
Một hồ sơ khách hàng chuẩn bao gồm:
- Mã khách hàng.
- Tên khách hàng / Tên nhà hàng.
- Số điện thoại liên hệ.
- Địa chỉ thư điện tử (Email).
- Mã số thuế (MST) phục vụ mục đích tổng hợp.
- Địa chỉ giao hàng.

3. Phân hệ Bán hàng và Quản lý Hóa đơn

3.1. Quy trình tạo đơn hàng
- Giao diện thao tác được tối ưu cho màn hình điện thoại di động. Các bước thực hiện: Chọn tên khách hàng -> Hệ thống tự động áp dụng bảng giá riêng của khách đó -> Thêm hàng hóa vào đơn -> Chốt đơn.

3.2. Cơ chế in Hóa đơn
- Khi xuất hóa đơn, hiển thị cửa sổ lựa chọn mẫu in (Hộ kinh doanh Phương Linh hoặc Hồng Hạnh) để hệ thống tự động điền thông tin pháp nhân tương ứng lên phần đầu của phiếu in.
- Bố cục bản in hóa đơn phải hiển thị đầy đủ: Số thứ tự, Tên hàng, Đơn vị tính, Số lượng, Đơn giá, Thành tiền, Tổng cộng số tiền, Phần ký tên chỉn chu, không bị lệch dòng.

4. Hệ thống Báo cáo và Đối chiếu Công nợ

4.1. Báo cáo doanh thu cuối ngày
- Thống kê tổng số lượng đơn hàng, tổng doanh thu, số tiền khách đã thanh toán, số tiền còn nợ lại.

4.2. Phân hệ báo cáo Hàng hóa và Tính năng "Soi" dữ liệu gốc
- Màn hình tổng quan: Thống kê tổng lượng tiêu thụ và tổng doanh thu của toàn bộ mã hàng. Hệ thống chỉ dùng dương lịch.
- Cơ chế truy vấn chi tiết từng dòng đơn: Khi bấm vào một mã sản phẩm cụ thể, hệ thống phải lập tức chuyển hướng hiển thị chi tiết: Mã đơn hàng, Ngày giờ giao dịch, Tên nhà hàng mua, Số lượng và Đơn giá thực tế của đơn đó.

4.3. Báo cáo khách hàng và Đối chiếu công nợ cuối tháng
- Lọc báo cáo theo Nhóm khách hàng (Tên Công ty mẹ quản lý) để gom tất cả doanh thu chi nhánh thành một bảng tổng hợp đối chiếu duy nhất.
- Hỗ trợ xuất ra tập tin bảng tính hoặc tập tin tài liệu in định dạng chuẩn.


PHẦN III: QUY ĐỊNH PHẠM VI VÀ YÊU CẦU KỸ THUẬT

1. Phạm vi hệ thống
+------------+----------------------------------------------------------------------+
| Hạng mục   | Trong phạm vi (In-Scope)                                             |
+------------+----------------------------------------------------------------------+
| Dữ liệu    | Sản phẩm, Khách hàng, Đơn hàng, Bảng giá                            |
| Tính năng  | Hệ thống báo cáo, Xuất tập tin (Excel/PDF), Cơ chế đa bảng giá      |
| Vận hành   | Giao diện Web tương thích cho Máy tính bàn và Điện thoại di động    |
+------------+----------------------------------------------------------------------+

2. Tính năng nằm ngoài phạm vi phát triển
Tuyệt đối không đưa vào các tính năng phức tạp sau:
- Quản lý luồng kho tự động (nhập xuất tuần tự).
- Quản lý nhân sự, Bảng lương, Sổ quỹ thu chi.
- Cổng đặt hàng trực tuyến (Online), Tự động hóa tính thuế/kết nối cơ quan thuế.

3. Phương thức đăng nhập và Bảo mật
- Hỗ trợ đăng nhập bằng tài khoản Google thông qua OAuth 2.0.
- Đồng thời hỗ trợ đăng nhập bằng Tên đăng nhập và Mật khẩu truyền thống.
- Hệ thống phân quyền truy cập dựa trên danh sách các địa chỉ thư điện tử hoặc tài khoản được chỉ định trước.

4. Kiến trúc vận hành
- Hệ thống vận hành theo mô hình ứng dụng chạy trên nền tảng đám mây, đồng bộ thời gian thực.
- Giao diện trang mạng ứng dụng chạy tối ưu đồng thời trên màn hình máy tính bàn văn phòng và các trình duyệt di động trên điện thoại.


================================================================================

PHẦN IV: BẢN MÔ PHỎNG GIAO DIỆN NGƯỜI DÙNG

--------------------------------------------------------------------------------
1. MÀN HÌNH TỔNG QUAN (Màn hình chính)
--------------------------------------------------------------------------------
================================================================================
[🌟] HỆ THỐNG QUẢN LÝ BÁN BUÔN                             👤 Xin chào, Quản trị viên [Đăng xuất]
================================================================================
 📌 TRÌNH ĐƠN:  [ TỔNG QUAN ]  Hàng hóa   Khách hàng   Bán hàng   Hóa đơn   Báo cáo
================================================================================

 KẾT QUẢ BÁN HÀNG HÔM NAY (06/06/2026)
 -------------------------------------------------------------------------------
 [ 💰 Doanh thu: 15.450.000 đ ]    [ 📦 Số đơn hàng: 12 đơn ]    [ ⏳ Đang xử lý: 0 đơn ]

 📈 DOANH THU THEO THÁNG (Biểu đồ cột giản lược)
 |   ||                                        ||
 |   ||            ||                          ||
 |   ||            ||              ||          ||
 |___||____________||______________||__________||______
   Tuần 1       Tuần 2          Tuần 3       Tuần 4

 🏆 10 KHÁCH HÀNG MUA NHIỀU NHẤT THÁNG NÀY
 1. Tiệc cưới Pandora        : 85.000.000 đ
 2. Buffet Poseidon Cơ sở 1  : 62.500.000 đ
 3. Nhà hàng Mộc Liên        : 45.300.000 đ
================================================================================


--------------------------------------------------------------------------------
2. MÀN HÌNH THIẾT LẬP BẢNG GIÁ (Phân hệ Hàng hóa)
--------------------------------------------------------------------------------
================================================================================
 📌 TRÌNH ĐƠN:  Tổng quan  [ HÀNG HÓA ▾ ]  Khách hàng   Bán hàng   Hóa đơn   Báo cáo
                           - Danh mục
                           - Thiết lập giá
================================================================================

 📜 QUẢN LÝ BẢNG GIÁ TÙY CHỈNH
 -------------------------------------------------------------------------------
 📋 Chọn bảng giá: [ BẢNG GIÁ CHUỖI POSEIDON  ▾ ]  [ + Thêm bảng giá mới ]

 🔍 Tìm kiếm mặt hàng: [ Nhập mã hoặc tên hàng hóa cần thiết lập giá... ]

 DANH SÁCH MẶT HÀNG ÁP DỤNG TRONG BẢNG GIÁ NÀY:
 +------------+-----------------------------+----------+---------------+-----------------------+
 | Mã hàng    | Tên mặt hàng                | Tồn kho  | Giá gốc       | Giá tùy chỉnh         |
 +------------+-----------------------------+----------+---------------+-----------------------+
 | SP000112   | Bột Chiên Xù (Hộp)          |    50    | 35.000 đ      | [ 30.000 đ          ] |
 | SP000145   | Bột Khoai Tây (Cân)         |   -10    | 50.000 đ      | [ 45.000 đ          ] |
 | SP000210   | Dầu Ăn (Thùng)              |     5    | 400.000 đ     | [ 385.000 đ         ] |
 +------------+-----------------------------+----------+---------------+-----------------------+
                                                                             [ 💾 LƯU BẢNG GIÁ ]
================================================================================


--------------------------------------------------------------------------------
3. MÀN HÌNH QUẢN LÝ KHÁCH HÀNG
--------------------------------------------------------------------------------
================================================================================
 📌 TRÌNH ĐƠN:  Tổng quan   Hàng hóa  [ KHÁCH HÀNG ]  Bán hàng   Hóa đơn   Báo cáo
================================================================================

 👥 DANH SÁCH ĐỐI TÁC BÁN BUÔN                          [ + Thêm mới khách hàng ]
 -------------------------------------------------------------------------------
 🔍 Tìm kiếm: [ Nhập tên nhà hàng, số điện thoại...  ]  Bộ lọc: [ Thuộc Công ty / Chuỗi ▾ ]

 +------------+---------------------------+--------------------------+-------------------------+
 | Mã KH      | Tên Nhà Hàng (Chi nhánh)  | Trực thuộc Công ty       | Liên hệ / Mã số thuế    |
 +------------+---------------------------+--------------------------+-------------------------+
 | KH000054   | Chợ Cuốn Aeon             | Công ty 3E               | 090xxxxxxx - MST: 010...|
 | KH000082   | Buffet Poseidon Cơ sở 1   | Chuỗi Poseidon           | 098xxxxxxx - MST: 010...|
 | KH000083   | Buffet Poseidon Cơ sở 2   | Chuỗi Poseidon           | 098xxxxxxx - MST: 010...|
 | KH000105   | Tiệc Cưới Pandora         | Công ty Hồng Hạnh        | 091xxxxxxx - MST: 010...|
 +------------+---------------------------+--------------------------+-------------------------+
================================================================================


--------------------------------------------------------------------------------
4. MÀN HÌNH LÊN ĐƠN HÀNG (Giao diện Thiết bị di động cầm tay)
--------------------------------------------------------------------------------
==========================================
 🛒 TẠO ĐƠN HÀNG MỚI          [ LÀM LẠI ]
==========================================

 1. THÔNG TIN NGƯỜI MUA
 ----------------------------------------
 🔍 Tìm khách: [ Tiệc Cưới Pandora     ]
 🏢 Phân loại: Công ty Hồng Hạnh
 📜 Bảng giá tự động: BẢNG GIÁ HỒNG HẠNH
 ----------------------------------------

 2. GIỎ HÀNG
 ----------------------------------------
 🔍 Gõ tên hàng: [ Tiêu hạt            ]

 Danh sách đã chọn:
 [+] Tiêu Hạt Đen (Cân)
     [ - ] [ 5 ] [ + ]  | Giá: [120.000 đ]
 [+] Nấm Hương (Cân)
     [ - ] [ 2 ] [ + ]  | Giá: [240.000 đ]
 ----------------------------------------

 3. TỔNG KẾT VÀ THANH TOÁN
 ----------------------------------------
 Tổng tiền hàng:              1.080.000 đ
 Chiết khấu thêm:            [        0 đ]
 Khách cần trả:               1.080.000 đ

 Lựa chọn Cơ sở xuất phiếu in:
 (O) Cơ sở Phương Linh
 ( ) Cơ sở Hồng Hạnh
 ----------------------------------------
          [ 💾 LƯU VÀ TẠO HÓA ĐƠN ]
==========================================


--------------------------------------------------------------------------------
5. MÀN HÌNH LỊCH SỬ HÓA ĐƠN VÀ IN ẤN
--------------------------------------------------------------------------------
================================================================================
 📌 TRÌNH ĐƠN:  Tổng quan   Hàng hóa   Khách hàng   Bán hàng  [ HÓA ĐƠN ]  Báo cáo
================================================================================

 🧾 LỊCH SỬ GIAO DỊCH
 -------------------------------------------------------------------------------
 Thời gian: [ Hôm nay ▾ ]   Trạng thái: [ Hoàn thành ▾ ]

 +------------+-------------------+---------------------------+-----------------+---------------+
 | Mã Hóa Đơn | Thời gian         | Khách hàng                | Tổng tiền       | Thao tác      |
 +------------+-------------------+---------------------------+-----------------+---------------+
 | HD015389   | 06/06/2026 14:35  | Chợ Cuốn Aeon             |    1.240.000 đ  | [ 🖨️ In ấn ] |
 | HD015388   | 06/06/2026 10:15  | Tiệc Cưới Pandora         |    6.500.000 đ  | [ 🖨️ In ấn ] |
 | HD015387   | 05/06/2026 22:08  | Buffet Poseidon Cơ sở 1   |    8.688.000 đ  | [ 🖨️ In ấn ] |
 +------------+-------------------+---------------------------+-----------------+---------------+

 * CỬA SỔ BẬT LÊN KHI BẤM "IN ẤN":
 ................................................................
 :  TÙY CHỌN MẪU PHIẾU IN CỦA HỘ KINH DOANH                     :
 :                                                              :
 :  Vui lòng chọn cơ sở kinh doanh làm phần đầu biểu mẫu:       :
 :  [ Phương Linh ]   [ Hồng Hạnh ]                             :
 :                                                              :
 :  [ HỦY BỎ ]                       [ TẠO TẬP TIN TÀI LIỆU ]   :
 ................................................................
================================================================================


--------------------------------------------------------------------------------
6. MÀN HÌNH BÁO CÁO HÀNG HÓA (Truy vết chi tiết)
--------------------------------------------------------------------------------
================================================================================
 📌 TRÌNH ĐƠN:  Tổng quan   Hàng hóa   Khách hàng   Bán hàng   Hóa đơn  [ BÁO CÁO ▾ ]
                                                                        - Báo cáo Hàng hóa
                                                                        - Báo cáo Khách hàng
================================================================================

 📊 BÁO CÁO TỔNG HỢP THEO MẶT HÀNG
 Thời gian: [ Tháng trước ]

 +------------+--------------------------+-------------+----------------------+
 | Mã hàng    | Tên mặt hàng             | SL đã bán   | Tổng Doanh Thu       |
 +------------+--------------------------+-------------+----------------------+
 | SP000432   | Đường Trắng (Cân)        |    432      |     8.640.000 đ      |
 | SP000120   | Dầu Ăn (Thùng)           |    147      |    56.595.000 đ      |
 | SP000305   | Cốt Dừa (Lon)            |    252      |     7.824.000 đ      |
 +------------+--------------------------+-------------+----------------------+

 *(KHI NGƯỜI DÙNG BẤM CHUỘT VÀO DÒNG "ĐƯỜNG TRẮNG", BẢNG CHI TIẾT SẼ MỞ RỘNG BÊN DƯỚI)*

 🔍 CHI TIẾT LỊCH SỬ TIÊU THỤ: ĐƯỜNG TRẮNG (CÂN)
 +------------+-------------------+----------------------+----------+-----------+------------+
 | Mã Hóa đơn | Ngày giao dịch    | Tên Nhà Hàng Mua     | Số lượng | Giá bán   | Thành tiền |
 +------------+-------------------+----------------------+----------+-----------+------------+
 | HD0012390  | 05/05/2026 14:35  | Chợ Cuốn Aeon        |   10     |  20.000 đ |  200.000 đ |
 | HD0012398  | 08/05/2026 10:12  | Tiệc Cưới Pandora    |   50     |  19.500 đ |  975.000 đ |
 | HD0012456  | 19/05/2026 08:45  | Buffet Poseidon      |  200     |  19.000 đ |3.800.000 đ |
 +------------+-------------------+----------------------+----------+-----------+------------+
================================================================================


--------------------------------------------------------------------------------
7. MÀN HÌNH BÁO CÁO KHÁCH HÀNG (Đối chiếu công nợ)
--------------------------------------------------------------------------------
================================================================================
 📌 TRÌNH ĐƠN:  Tổng quan   Hàng hóa   Khách hàng   Bán hàng   Hóa đơn  [ BÁO CÁO ▾ ]
                                                                        - Báo cáo Hàng hóa
                                                                        - Báo cáo Khách hàng
================================================================================

 📊 BÁO CÁO DOANH THU ĐỂ ĐỐI CHIẾU CÔNG NỢ
 Thời gian: [ Tháng trước ▾ ]     Lọc theo Chuỗi/Công ty: [ Công ty 3E ▾ ]

 THỐNG KÊ DOANH THU CHI NHÁNH TRỰC THUỘC CÔNG TY 3E:
 +------------+---------------------------+-------------------+-------------------+
 | Mã KH      | Tên Chi Nhánh Nhà Hàng    | Tổng Tiền Hàng    | Tiền Chưa Thu     |
 +------------+---------------------------+-------------------+-------------------+
 | KH000054   | Chợ Cuốn Aeon             |    32.650.000 đ   |    32.650.000 đ   |
 | KH000055   | Mộc Liên Đồng Gia         |    45.300.000 đ   |    45.300.000 đ   |
 | KH000058   | Tiệm Nướng K&K            |    18.200.000 đ   |    18.200.000 đ   |
 +------------+---------------------------+-------------------+-------------------+
 TỔNG CỘNG CÔNG NỢ CỦA CÔNG TY 3E:            96.150.000 đ        96.150.000 đ

 [ 📥 XUẤT TẬP TIN BẢNG TÍNH ĐỂ GỬI ĐỐI TÁC ]       [ 📥 XUẤT TẬP TIN TÀI LIỆU IN ]
================================================================================
