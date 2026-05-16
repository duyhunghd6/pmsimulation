# Đề cương chương trình đào tạo Asset Pyramid, Financial Analyst & Investment cho thị trường Việt Nam

## Nguồn xây dựng đề cương

Đề cương này được tổng hợp từ 84 file Markdown trong:

`/Users/steve/Desktop/GSCfin/FinancialAnalyst-TrainingDoc`

Các cụm nguồn chính:

1. **Personal Wealth Management - Personal Finance and Investment Asset Management**  
   Dùng để xây nền tảng tài chính cá nhân, mục tiêu đầu tư, hồ sơ rủi ro, tháp tài sản, chu kỳ đầu tư và bài tập lập kế hoạch tài chính.
2. **Financial Analysis - Global Financial and Business Analysis**  
   Dùng để xây lõi năng lực analyst: phân tích ngành, quản trị công ty, chiến lược kinh doanh, đọc báo cáo tài chính, phân tích chỉ số, cấu trúc vốn, beta, chi phí vốn và dự án phân tích doanh nghiệp niêm yết.
3. **FI Portfolio Management**  
   Dùng để xây năng lực quản trị danh mục chủ động: quy trình 8 bước, kịch bản vĩ mô, kịch bản thị trường chứng khoán, phân bổ tài sản, chiến lược cổ phiếu, 6 nhóm cổ phiếu, case FPT/PNJ/DGC/HPG/VNM/MWG, chỉ số rủi ro-hiệu quả, TARA, tái cấu trúc danh mục và thực thi lệnh.

Đây là đề cương đào tạo ứng dụng cho thị trường Việt Nam, không phải khuyến nghị mua/bán chứng khoán.

## Triết lý đào tạo

Trung tâm của chương trình là **Tháp tài sản**: một hệ thống quản lý tài sản được thiết kế để vừa **tăng trưởng trong thời gian dài liên tục**, vừa **kiểm soát được rủi ro**. Học viên không được dẫn thẳng đến câu hỏi “mua mã nào”, mà được dẫn đến câu hỏi lớn hơn: làm thế nào để xây, đọc, bảo vệ và tái cấu trúc một tháp tài sản sống trong thị trường Việt Nam.

Mọi học phần phải phục vụ một trong ba chức năng:

1. **Xây Tháp tài sản** — xác định mục tiêu, dòng tiền, năng lực đầu tư, hồ sơ rủi ro, tầng tài sản nền tảng và cấu trúc phân bổ ban đầu cho cá nhân, khách hàng hoặc quỹ.
2. **Đọc các “sợi dây” đang kéo Tháp tài sản** — nhận diện biến số vĩ mô, thị trường, ngành, doanh nghiệp, dòng tiền và hành vi nhà đầu tư đang tác động đến từng tầng tài sản và toàn bộ tháp.
3. **Quản trị rủi ro và tái cấu trúc Tháp tài sản** — dùng dashboard hiệu quả-rủi ro, ma trận TARA và kịch bản dịch chuyển theo thời gian để chủ động giảm, chuyển, chấp nhận hoặc tránh rủi ro.

Tháp tài sản không chỉ có một chiều “thị giá”. Trong chương trình này, học viên đọc tháp qua bốn chiều tối thiểu:

| Chiều thông tin của Tháp tài sản | Câu hỏi cần trả lời | Ví dụ metric/term nên dùng |
| --- | --- | --- |
| **Thị giá / giá trị thị trường** | Tổng tháp và từng tầng đang tăng hay giảm giá trị? | Tỷ suất lợi nhuận trên vốn đầu tư (roi), Lợi nhuận bình quân hàng năm (annualized_return), Chỉ số VN-Index (vn_index_level), NAV trên mỗi đơn vị quỹ (fund_nav_per_unit) |
| **Thanh khoản** | Khi cần cơ cấu lại, tầng tài sản đó có chuyển thành tiền đủ nhanh và đủ ít chi phí không? | Giá trị giao dịch thị trường cổ phiếu (equity_market_trading_value), liquidity filter (non-canonical family), tiền mặt, Tiền gửi ngân hàng (term:bank_deposit) |
| **Lợi tức kỳ vọng** | Tầng tài sản đó đóng góp bao nhiêu vào mục tiêu tăng trưởng dài hạn của tháp? | Lợi tức kỳ vọng (%/năm) (expected_annual_return), Kỳ vọng tăng trưởng lợi nhuận của thị trường (market_earnings_growth_expectation), Tỷ suất cổ tức (dividend_yield) |
| **Rủi ro biến động** | Lợi tức kỳ vọng có thể lệch bao nhiêu, giảm sâu bao nhiêu, và tương quan với phần còn lại thế nào? | Độ biến động (volatility), Mức sụt giảm đỉnh-đáy (drawdown), Hệ số beta (beta), Hệ số tương quan (correlation_coefficient), Điểm tác động rủi ro (risk_impact_score) |

Một “sợi dây” là một biến số có thể kéo một hoặc nhiều chiều của tháp theo hướng khác nhau. Mỗi sợi dây phải được học theo bốn thuộc tính:

| Thuộc tính của sợi dây | Ý nghĩa trong đào tạo | Câu hỏi thực hành |
| --- | --- | --- |
| **Chiều tác động** | Tác động dương/âm lên thị giá, thanh khoản, lợi tức kỳ vọng hoặc rủi ro | Biến này làm tầng tài sản tăng giá, giảm giá, dễ bán hơn, khó bán hơn hay rủi ro hơn? |
| **Trọng số tác động** | Sợi dây lớn hay nhỏ đối với từng tầng tài sản và toàn bộ tháp | Nếu biến này đổi 1 đơn vị hoặc đổi regime, tháp bị kéo mạnh đến đâu? |
| **Hồ sơ thời gian** | Tác động tức thì, liên tục, trễ, ngắn hạn hay kéo dài | Giá phản ứng ngay, hay kết quả tài chính/dòng tiền phản ứng sau vài quý? |
| **Bằng chứng đo lường** | Metric, quan sát hoặc luận điểm dùng để chứng minh lực kéo | Dữ liệu nào cho thấy sợi dây đang đổi chiều hoặc đổi độ mạnh? |

Trục xuyên suốt của chương trình là:

> Tháp tài sản mục tiêu → Hồ sơ nhà đầu tư/quỹ → Bản đồ các tầng tài sản → Bản đồ sợi dây tác động → Trọng số và độ trễ → Dashboard hiệu quả-rủi ro → TARA động theo thời gian → Tái cấu trúc tháp.

## Lớp thiết kế Backward Design

Chương trình được thiết kế theo **Backward Design**: bắt đầu từ bằng chứng nghề nghiệp cuối khóa, sau đó xác định artifact cần nộp, tiêu chí đánh giá, rồi mới quay ngược lại để thiết kế module, lab, case và nội dung lý thuyết.

Đầu ra cuối khóa không phải là một buổi bảo vệ miệng, mà là **Portfolio Management Dossier**: hồ sơ quản trị danh mục tích hợp, có thể được rà soát bằng dữ liệu, nguồn, convention và chuỗi lập luận. Dossier này gồm các evidence artifacts chính:

1. **Asset Pyramid Blueprint**.
2. **Investor/Profile Policy**: persona hoặc mandate, risk profile, risk limits, horizon và investment capacity.
3. **Macro Scenario Memo**.
4. **Driver/String Map**.
5. **Industry/Company Evidence Notes**.
6. **Asset Allocation Policy**.
7. **Watchlist and Stock Group Classification**.
8. **Portfolio Construction Sheet**.
9. **Risk-Return Dashboard**.
10. **TARA Scenario Playbook**.
11. **Execution and Rebalancing Checklist**.
12. **Final Written Recommendation**.
13. **Data Appendix**: nguồn dữ liệu, ngày dữ liệu, benchmark, window, frequency, risk-free proxy và convention tính toán.
14. **Decision Log**: vì sao tăng, giảm, giữ, tránh hoặc chuyển rủi ro ở từng bước.

Mỗi module phải tạo hoặc cải thiện ít nhất một evidence artifact. Cuối khóa, học viên nộp dossier để **dossier review** và **evidence audit**, trong đó người chấm kiểm tra tính đầy đủ, tính nhất quán và khả năng truy vết từ mục tiêu → profile → scenario → allocation → dashboard → TARA → execution.

## Đối tượng học viên

Chương trình phù hợp cho:

- Junior financial analyst.
- Equity research trainee.
- Portfolio analyst trainee.
- Investment advisory hoặc wealth advisory trainee.
- Nhà đầu tư cá nhân muốn học cách xây và quản trị tháp tài sản theo quy trình.
- Sinh viên năm cuối hoặc người đi làm muốn chuyển hướng sang tài chính, chứng khoán, quản lý tài sản.

## Kết quả đầu ra toàn chương trình

Sau khi hoàn thành chương trình, học viên có thể:

1. Thiết kế **Asset Pyramid Blueprint** cho cá nhân, khách hàng hoặc danh mục mẫu của quỹ với mục tiêu tăng trưởng dài hạn và giới hạn rủi ro rõ ràng.
2. Lập hồ sơ tài chính, hồ sơ rủi ro, khung thời gian và năng lực đầu tư để xác định tầng nền tảng, tầng bảo vệ và tầng tăng trưởng của tháp.
3. Xác định các chiều thông tin của tháp: thị giá, thanh khoản, lợi tức kỳ vọng và rủi ro biến động.
4. Xây bản đồ các sợi dây tác động đến từng tầng tài sản: vĩ mô, lãi suất, tỷ giá, thanh khoản, dòng tiền, ngành, doanh nghiệp, định giá và hành vi thị trường.
5. Phân tích chiều tác động, trọng số tác động và hồ sơ thời gian của từng sợi dây, bao gồm tác động tức thì và tác động trễ.
6. Đọc và nối ba báo cáo tài chính chính để hiểu doanh nghiệp như một sợi dây kéo tầng cổ phiếu trong tháp tài sản.
7. Phân tích doanh nghiệp qua ngành, lợi thế cạnh tranh, quản trị công ty, chiến lược, ROE, biên lợi nhuận, dòng tiền, cấu trúc vốn và định giá nền tảng.
8. Xây kịch bản vĩ mô và kịch bản thị trường chứng khoán Việt Nam theo logic tăng trưởng, lạm phát, lãi suất, tỷ giá, thanh khoản, dòng tiền và kỳ vọng lợi nhuận.
9. Phân bổ tài sản giữa tiền gửi, vàng, trái phiếu, quỹ, ETF, cổ phiếu và tiền mặt theo hồ sơ rủi ro, kịch bản thị trường và vai trò của từng tầng trong tháp.
10. Phân loại cổ phiếu Việt Nam theo 6 nhóm chiến lược và biết cách sử dụng các case FPT, PNJ, DGC, HPG, VNM, MWG như archetype sợi dây doanh nghiệp/ngành.
11. Đọc và diễn giải dashboard hiệu quả-rủi ro của tháp bằng ROI, beta, alpha, Sharpe, Treynor, volatility, correlation, drawdown.
12. Áp dụng TARA như một ma trận động theo thời gian để thiết kế hành động Avoid, Reduce, Accept, Transfer và kế hoạch tái cấu trúc tháp tài sản.
13. Hiểu cơ chế lệnh và phiên giao dịch trên HOSE, HNX, UPCoM ở mức đủ để triển khai kế hoạch cơ cấu lại tháp có kỷ luật.
14. Hoàn thành một **Portfolio Management Dossier** gồm Asset Pyramid Blueprint, Investor/Profile Policy, Macro Scenario Memo, Driver/String Map, Industry/Company Evidence Notes, Allocation Policy, Portfolio Construction Sheet, dashboard hiệu quả-rủi ro, TARA Scenario Playbook, Execution and Rebalancing Checklist, Final Written Recommendation, Data Appendix và Decision Log.

## Cấu trúc chương trình tổng thể

Chương trình nên được triển khai theo 3 khối kiến thức xoay quanh Tháp tài sản:

| Khối | Câu hỏi trung tâm | Vai trò | Đầu ra chính |
| --- | --- | --- | --- |
| **Khối 1. Xây Tháp tài sản** | Tháp tài sản cần được thiết kế thế nào để tăng trưởng dài hạn mà không phá vỡ an toàn tài chính? | Personal Wealth Management xây nền móng, tầng bảo vệ, tầng tăng trưởng, mục tiêu và hồ sơ rủi ro | Asset Pyramid Blueprint và Investor/Profile Policy |
| **Khối 2. Đọc các sợi dây tác động lên Tháp** | Những biến số nào đang kéo từng tầng tài sản theo chiều nào, mạnh/yếu ra sao, nhanh hay trễ? | Financial Analysis + macro/market/portfolio analytics xác định driver, trọng số, độ trễ và bằng chứng đo lường | Driver/String Map, Company/Industry Memo và Scenario Dashboard |
| **Khối 3. Quản trị rủi ro và tái cấu trúc Tháp** | Khi các sợi dây đổi chiều hoặc đổi độ mạnh, Tháp cần phản ứng thế nào? | FI Portfolio Management + TARA thiết kế cấu trúc danh mục, dashboard rủi ro, hành động Avoid/Reduce/Accept/Transfer và execution | TARA Scenario Playbook, Rebalancing Plan, Portfolio Management Dossier, dossier review và evidence audit |

## Mô hình làm việc xuyên suốt: Tháp tài sản và các sợi dây tác động

Mỗi bài thực hành nên buộc học viên trả lời theo cùng một khung:

| Thành phần | Nội dung cần điền | Ví dụ |
| --- | --- | --- |
| Tầng tài sản | Tài sản hoặc nhóm tài sản đang được xét | Tiền gửi, vàng, quỹ trái phiếu, ETF, cổ phiếu tăng trưởng, cổ phiếu phòng thủ |
| Chiều tháp bị tác động | Thị giá, thanh khoản, lợi tức kỳ vọng, rủi ro biến động | Lãi suất tăng có thể làm tiền gửi hấp dẫn hơn, cổ phiếu định giá cao chịu áp lực hơn |
| Sợi dây/driver | Biến số đang kéo tầng tài sản | Lãi suất điều hành (term:policy_rate), Biến động tỷ giá USD/VND (usd_vnd_movement), Giá trị giao dịch thị trường cổ phiếu (equity_market_trading_value), Kỳ vọng tăng trưởng lợi nhuận của thị trường (market_earnings_growth_expectation), Tỷ suất sinh lời trên vốn chủ sở hữu (roe), Biên lợi nhuận gộp (gross_margin) |
| Chiều tác động | Dương, âm, hỗn hợp hoặc phụ thuộc regime | Thanh khoản thị trường tăng thường hỗ trợ tầng cổ phiếu, nhưng có thể đi kèm rủi ro hưng phấn định giá |
| Trọng số tác động | Lớn, vừa, nhỏ; hoặc định lượng nếu có dữ liệu đủ | Cổ phiếu chu kỳ thường nhạy hơn với giá hàng hóa/chu kỳ ngành so với cổ phiếu phòng thủ |
| Hồ sơ thời gian | Tức thì, liên tục, trễ, theo quý, theo chu kỳ | Giá cổ phiếu có thể phản ứng ngay với tin lãi suất; lợi nhuận doanh nghiệp phản ánh sau vài quý |
| Bằng chứng | Metric, chart, báo cáo, dashboard hoặc memo | ROI, drawdown, beta, dòng tiền khối ngoại, ROE tree, margin trend |
| Phản ứng quản trị | Theo dõi, tăng/giảm tỷ trọng, hedge/chuyển rủi ro, tránh, giữ | Reduce equity weight, Transfer sang quỹ/trái phiếu/tiền gửi, Accept nếu trong risk budget |

## Bản đồ chi tiết đề cương

| Tầng chi tiết | Nội dung | File |
| --- | --- | --- |
| Khối 1 | Nền tảng tài chính cá nhân, hồ sơ rủi ro, Tháp tài sản và cầu nối vĩ mô. | [outline-xay-thap-tai-san.md](outline-xay-thap-tai-san.md) |
| Khối 2 | Đọc các sợi dây vĩ mô, ngành, doanh nghiệp, báo cáo tài chính và cấu trúc vốn. | [outline-doc-soi-day-tac-dong.md](outline-doc-soi-day-tac-dong.md) |
| Khối 3 | Quản trị danh mục, phân bổ tài sản, cổ phiếu, dashboard rủi ro, TARA và thực thi. | [outline-quan-tri-tai-cau-truc-thap-tai-san.md](outline-quan-tri-tai-cau-truc-thap-tai-san.md) |
| Ma trận năng lực | Skill set, knowledge set, trạng thái học tập, độ phủ canonical terms/metrics và cấp độ học viên. | [outline-ma-tran-nang-luc.md](outline-ma-tran-nang-luc.md) |
| Thực hành, đánh giá, triển khai | Bài thực hành, rubric, Việt Nam hóa dữ liệu, quy tắc công thức, gap và thời lượng triển khai. | [outline-thuc-hanh-danh-gia-trien-khai.md](outline-thuc-hanh-danh-gia-trien-khai.md) |
| Nguồn và nguyên tắc vận hành | Source map chi tiết, nguyên tắc lớp học và kết luận sư phạm. | [outline-nguon-va-nguyen-tac-van-hanh.md](outline-nguon-va-nguyen-tac-van-hanh.md) |

### Tóm tắt các tầng chi tiết

- **Khối 1 — Xây Tháp tài sản**: thiết kế nền móng tài chính cá nhân, investment capacity, risk profile và cầu nối sang investment clock.
- **Khối 2 — Đọc các sợi dây tác động**: chuyển financial analysis thành bản đồ driver doanh nghiệp, ngành, chiến lược, báo cáo tài chính, beta và cấu trúc vốn.
- **Khối 3 — Quản trị và tái cấu trúc Tháp tài sản**: biến phân tích thành allocation, watchlist, portfolio construction, dashboard hiệu quả-rủi ro, TARA động, execution và Portfolio Management Dossier có thể audit.
- **Ma trận năng lực**: kiểm soát lộ trình skill/knowledge, mức độ học tập và độ phủ canonical terms/metrics cho toàn chương trình.
- **Thực hành, đánh giá và triển khai**: quy định labs, rubric, dữ liệu Việt Nam, convention công thức, gap trước khi mở khóa và phiên bản 8/12/18-24 buổi.
- **Nguồn và nguyên tắc vận hành**: giữ provenance theo cụm training-doc, nguyên tắc lớp học và thông điệp sư phạm cuối cùng.
