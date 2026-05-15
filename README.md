# Apex Alpha Portfolio Simulator 📈

Chào mừng đến với mã nguồn mở của **Apex Alpha Portfolio Simulator** - một trò chơi mô phỏng quản lý danh mục đầu tư (Portfolio Manager Simulation Game).

## 🎯 Mục đích dự án

Trong đào tạo đầu tư tài chính truyền thống, sinh viên thường chỉ học lý thuyết và ghi nhớ công thức mà không nắm bắt được tác động thực tế của sự thay đổi kinh tế vĩ mô, độ lệch danh mục (portfolio drift), và rào cản thuế trong một thị trường cạnh tranh thực sự. 

**Apex Alpha Portfolio Simulator** là một nền tảng mô phỏng nhiều người chơi, theo lượt và có khả năng mở rộng cao. Sinh viên sẽ đóng vai trò là các Giám đốc Quỹ (Fund Managers), cạnh tranh trong một "Lớp học" để:
- Xây dựng danh mục đầu tư vững chắc theo cấu trúc **Tháp Tài Sản** (Asset Pyramid: Base = Safety, Core = Yield, Apex = Alpha).
- Đọc hiểu và dự báo các dữ liệu kinh tế vĩ mô có độ trễ (Time-lagged macroeconomic data).
- Tái cơ cấu danh mục một cách linh hoạt theo phương pháp **TARA** (Transfer, Avoid, Reduce, Accept).

Hệ thống không sử dụng các con số ngẫu nhiên mà được vận hành bởi một **Pedagogical Deterministic Engine** (Động cơ quyết định sư phạm), được thiết kế chặt chẽ để đảm bảo kết quả học tập và chống gian lận.

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án được xây dựng với cấu trúc hiện đại, đảm bảo tính bảo mật và tối ưu cho môi trường serverless:
- **Frontend Framework:** Next.js (App Router) với React Server Components (RSC) và Server Actions.
- **Database & Auth:** Supabase (PostgreSQL) tích hợp Row Level Security (RLS) và Supabase Realtime (WebSockets) cho trải nghiệm cập nhật tức thì.
- **Database ORM:** Drizzle ORM giúp truy vấn an toàn và hiệu suất cao.
- **Math Worker / Queue:** Inngest được sử dụng để tính toán các tác vụ nặng (như tính thuế, độ trượt giá PvP) trong nền (background) nhằm tránh giới hạn timeout của serverless.
- **UI & Styling:** Tailwind CSS + shadcn/ui cho giao diện tài chính chuyên nghiệp, chế độ tối (dark-mode).
- **Data Visualization:** Apache ECharts & Tremor để vẽ các biểu đồ phân tích và bảng xếp hạng (Leaderboards).
- **Hosting & Cron:** Vercel hỗ trợ Edge network và Cron Jobs tự động chuyển tháng mô phỏng.

## 🚀 Triển khai (Deployment)

Dự án được cấu hình để triển khai tại tên miền: **[pmsim.gscfin.com](https://pmsim.gscfin.com)**.

*(Lưu ý: Quản lý DNS thông qua `flarectrl`. Việc triển khai tự động lên Vercel tạm thời chưa được kích hoạt ở thời điểm hiện tại).*

## 📄 Giấy phép (License)

Dự án được phát triển dưới dạng mã nguồn mở.
