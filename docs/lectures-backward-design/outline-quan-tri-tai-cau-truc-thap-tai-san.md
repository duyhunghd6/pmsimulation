# Khối 3: Quản trị và tái cấu trúc Tháp tài sản

[← Quay lại đề cương tổng](outline.md)

## Khối 3 — Quản trị và tái cấu trúc Tháp tài sản: danh mục, TARA, rủi ro và thực thi

Theo Backward Design, Khối 3 chuyển bằng chứng phân tích thành hành động danh mục. Mỗi module C1-C10 tạo một evidence artifact cho Portfolio Management Dossier; C11 chỉ là bước lắp ráp, review và audit chuỗi artifact đã tích lũy.

### Module C1 — Quy trình 8 bước quản lý danh mục

**Mục tiêu học tập**

- Hiểu quản lý danh mục là một quy trình lặp lại, không phải danh sách mã cổ phiếu.
- Nối mục tiêu, risk profile, scenario, allocation, strategy, execution và monitoring.
- Biết vai trò của từng bước trong FI Portfolio Management framework.

**Skill set**

- Viết investment policy statement đơn giản.
- Chuyển mục tiêu thành nguyên tắc phân bổ và kiểm soát.
- Tạo checklist quản trị danh mục cá nhân hoặc khách hàng.

**Knowledge set**

- Quy trình quản lý danh mục đầu tư (term:portfolio_management_process).
- Nhóm những công ty có tiềm năng (term:investment_universe).
- Danh mục theo dõi (term:watch_list).
- Allocation policy.
- Monitoring and rebalancing.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò |
| --- | --- | --- |
| Tỷ suất lợi nhuận trên vốn đầu tư (roi) | metric | Đo hiệu quả đầu tư |
| Tỷ trọng phân bổ tài sản (asset_allocation_weight) | metric | Tỷ trọng lớp tài sản |
| Tỷ trọng vị thế (position_weight) | metric | Tỷ trọng từng vị thế |
| Tái cân bằng danh mục (term:portfolio_rebalancing) | term | Tái cân bằng danh mục |

**Đánh giá**

- **Evidence artifact**: học viên mô tả quy trình đầu tư 8 bước cho một persona cụ thể như portfolio process checklist đưa vào Portfolio Management Dossier.

### Module C2 — Driver/String Map: kịch bản vĩ mô, thị trường chứng khoán và lực kéo lên Tháp

**Mục tiêu học tập**

- Chuyển macro regime từ Module A4 thành bản đồ các sợi dây kéo từng tầng trong Tháp tài sản.
- Phân biệt biến số thị trường chứng khoán cấp 1, cấp 2, cấp 3 theo chiều tác động, trọng số và hồ sơ thời gian.
- Hiểu VN-Index, thanh khoản, dòng tiền nhà đầu tư, khối ngoại và kỳ vọng lợi nhuận như các lực kéo có thể tác động khác nhau lên thị giá, thanh khoản, lợi tức kỳ vọng và rủi ro biến động.

**Skill set**

- Lập stock-market scenario dashboard theo cấu trúc Driver/String Map.
- Viết base/upside/downside scenario kèm chiều tác động, độ mạnh và độ trễ dự kiến.
- Đề xuất thay đổi allocation theo scenario và giải thích sợi dây nào đang kích hoạt hành động.

**Knowledge set**

- VN-Index regime.
- Equity market liquidity.
- Foreign and retail flows.
- Market earnings expectation.
- Valuation sentiment.
- Remote US drivers.
- Driver direction, impact weight, time lag and persistence.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò |
| --- | --- | --- |
| Chỉ số VN-Index (vn_index_level) | metric | Trạng thái benchmark thị trường Việt Nam |
| Giá trị giao dịch thị trường cổ phiếu (equity_market_trading_value) | metric | Thanh khoản thị trường |
| Giá trị mua/bán ròng khối ngoại (foreign_investor_net_trading_value) | metric | Dòng tiền khối ngoại |
| Giá trị mua/bán ròng nhà đầu tư cá nhân (retail_investor_net_trading_value) | metric | Dòng tiền cá nhân |
| Kỳ vọng tăng trưởng lợi nhuận của thị trường (market_earnings_growth_expectation) | metric/concept | Kỳ vọng lợi nhuận thị trường |

**Đánh giá**

- **Evidence artifact**: học viên đề xuất allocation cho hai kịch bản phục hồi thanh khoản và thắt chặt thanh khoản, kèm Stock-Market Scenario Dashboard nối vào Driver/String Map.

### Module C3 — Phân bổ đa tài sản theo tầng Tháp: tiền gửi, vàng, trái phiếu, quỹ và cổ phiếu

**Mục tiêu học tập**

- Hiểu vai trò từng lớp tài sản phổ biến tại Việt Nam.
- Phân biệt chức năng của tiền gửi, vàng, trái phiếu, quỹ mở, ETF và cổ phiếu trong danh mục.
- Không đồng nhất “đầu tư” với “mua cổ phiếu”.

**Skill set**

- Thiết kế allocation theo profile và scenario.
- Giải thích vì sao tăng/giảm tỷ trọng một lớp tài sản.
- Đọc thông tin NAV, lợi nhuận, drawdown, duration hoặc rủi ro quỹ ở mức ứng dụng.

**Knowledge set**

- Tiền gửi ngân hàng (term:bank_deposit).
- Lớp vàng (term:gold_asset_class) và Giá vàng thế giới điều chỉnh (adjusted_world_gold_price).
- Quỹ trái phiếu (term:bond_fund).
- Equity funds and ETFs.
- Direct equities.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò | Lưu ý |
| --- | --- | --- | --- |
| Tỷ trọng phân bổ tài sản (asset_allocation_weight) | metric | Tỷ trọng lớp tài sản | Công thức quy ước: giá trị lớp tài sản / tổng giá trị danh mục |
| NAV trên mỗi đơn vị quỹ (fund_nav_per_unit) | metric | NAV/CCQ của quỹ | Unspecified by source; cần xác định nguồn dữ liệu và nhãn nền tảng như NAV/đvq hoặc giá gần nhất |
| Lợi nhuận bình quân hàng năm (annualized_return) | metric | Lợi nhuận bình quân năm | Cần xác định giai đoạn và quy ước annualization |
| Giá vàng thế giới điều chỉnh (adjusted_world_gold_price) | metric | Series so sánh giá vàng thế giới điều chỉnh | Dùng như chỉ báo theo dõi; chỉ yêu cầu học viên tính nếu có methodology box riêng |

**Đánh giá**

- **Evidence artifact**: học viên xây một allocation 100% cho persona thận trọng, cân bằng và tăng trưởng, nêu rõ vai trò từng lớp tài sản trong Tháp tài sản.

### Module C4 — Chiến lược đầu tư cổ phiếu và top-down/bottom-up

**Mục tiêu học tập**

- Hiểu sự khác nhau giữa chiến lược chủ động, thụ động, top-down và bottom-up.
- Chọn chiến lược phù hợp với năng lực phân tích, thời gian theo dõi và hồ sơ rủi ro.
- Học từ quỹ/factsheet như nguồn quan sát chiến lược, không coi đó là khuyến nghị đầu tư.

**Skill set**

- So sánh các chiến lược cổ phiếu.
- Liên kết chiến lược với macro scenario và stock group.
- Viết strategy selection memo.

**Knowledge set**

- Top-down (term:top_down_investing).
- Bottom-up (term:bottom_up_investing).
- Growth, defensive, cyclical, quality, value, thematic strategies.
- Fund factsheet interpretation.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò |
| --- | --- | --- |
| Top-down (term:top_down_investing) | term | Đi từ vĩ mô/ngành xuống cổ phiếu |
| Bottom-up (term:bottom_up_investing) | term | Đi từ doanh nghiệp lên danh mục |
| Lợi nhuận bình quân hàng năm (annualized_return) | metric | So sánh hiệu quả dài hạn |
| Mức sụt giảm đỉnh-đáy (drawdown) | metric | Đo rủi ro giảm giá từ đỉnh |
| Số lượng cổ phiếu nắm giữ (holding_count) | metric | Số lượng mã/quỹ nắm giữ |

**Đánh giá**

- **Evidence artifact**: học viên viết Strategy Selection Memo, chọn một chiến lược phù hợp cho persona có thời gian theo dõi thấp và giải thích vì sao.

### Module C5 — Phân loại 6 nhóm cổ phiếu và xây watchlist

**Mục tiêu học tập**

- Hiểu 6 nhóm cổ phiếu như một taxonomy phục vụ chiến lược, không phải nhãn cố định vĩnh viễn.
- Xây investment universe và watchlist từ tiêu chí vốn hóa, thanh khoản, ngành, chất lượng tài chính và đặc điểm chu kỳ.
- Gắn stock group với vai trò trong danh mục.

**Skill set**

- Sàng lọc cổ phiếu theo tiêu chí định lượng và định tính.
- Gán cổ phiếu vào nhóm và bảo vệ luận điểm phân loại.
- Chọn nhóm cổ phiếu phù hợp với scenario và profile.

**Knowledge set**

- Nhóm những công ty có tiềm năng (term:investment_universe).
- Xây danh mục theo dõi (term:watch_list).
- Market capitalization.
- Liquidity filter.
- Six stock groups.
- CAMEL for banks where relevant.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò | Lưu ý |
| --- | --- | --- | --- |
| Phân loại 6 nhóm cổ phiếu (mp_stock_group_class) | metric/classification | Phân loại 6 nhóm cổ phiếu | Nguồn còn có tension về thứ tự/tiêu chí nhóm 1-2 |
| Vốn hóa thị trường (market_capitalization) | metric | Quy mô vốn hóa |
| Thanh khoản trung bình (average_trading_volume) / nhóm thanh khoản (non-canonical family) | metric/family | Điều kiện thanh khoản |
| Tỷ trọng vị thế (position_weight) | metric | Tỷ trọng vị thế khi đưa vào danh mục |

**Đánh giá**

- **Evidence artifact**: học viên lập Watchlist and Stock Group Classification gồm 10 mã Việt Nam, phân loại từng mã vào 6 nhóm với lý do rõ ràng.

### Module C6 — Case study 6 doanh nghiệp Việt Nam: FPT, PNJ, DGC, HPG, VNM, MWG

**Mục tiêu học tập**

- Dùng case Việt Nam để học archetype cổ phiếu.
- Phân biệt doanh nghiệp tăng trưởng, bền vững, mở rộng tài sản, chu kỳ, phòng thủ và sau chu kỳ tăng trưởng.
- Nối phân tích ngành, tài chính, chiến lược và định giá vào quyết định danh mục.

**Skill set**

- Đọc case stock analysis theo cấu trúc.
- Nhận diện driver của từng archetype.
- So sánh rủi ro và vai trò danh mục của từng nhóm cổ phiếu.

**Knowledge set**

- FPT: growth and quality case.
- PNJ: sustainable growth and channel/store expansion case.
- DGC: efficiency while expanding asset base case.
- HPG: cyclical steel case.
- VNM: defensive/dividend case.
- MWG: post-growth-cycle and execution risk case.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò |
| --- | --- | --- |
| Tăng trưởng doanh thu (revenue_growth) | metric | Tăng trưởng doanh thu |
| Tăng trưởng lợi nhuận (earnings_growth) | metric | Tăng trưởng lợi nhuận |
| Tỷ suất sinh lời trên vốn chủ sở hữu (roe) | metric | Chất lượng sinh lời vốn chủ |
| Tỷ suất sinh lời trên tài sản (roa) | metric | Hiệu quả tài sản |
| Biên lợi nhuận gộp (gross_margin), Biên lợi nhuận ròng (net_profit_margin), Biên lợi nhuận doanh nghiệp (business_profit_margin) | metrics | Biên lợi nhuận và chất lượng vận hành ở cấp doanh nghiệp |
| Chỉ số EV/EBITDA (ev_to_ebitda) | metric | Định giá tương đối |
| Chỉ số P/B (price_to_book) | metric | Định giá theo vốn chủ/tài sản |
| Số lượng cửa hàng (store_count) | metric | Mạng lưới bán lẻ |
| Giá HRC (hot_rolled_coil_price) | metric | Biến ngành thép |
| Dòng tiền hoạt động kinh doanh (operating_cash_flow) | metric | Chất lượng dòng tiền |

**Đánh giá**

- **Evidence artifact**: học viên chọn một case, viết 2-4 trang Stock Case Evidence Note và chứng minh vai trò của cổ phiếu đó trong danh mục bằng dữ liệu, driver và risk context.

### Module C7 — Cấu trúc danh mục, tỷ trọng vị thế và kế hoạch giải ngân

**Mục tiêu học tập**

- Chuyển stock analysis thành portfolio construction.
- Xác định số lượng mã, tỷ trọng từng vị thế, tỷ trọng tiền mặt và kế hoạch giải ngân.
- Tránh over-concentration và tránh mua hết vốn trong một điểm thời gian.

**Skill set**

- Xây danh mục 5-8 mã hoặc danh mục hỗn hợp quỹ-cổ phiếu.
- Đặt position limit theo rủi ro.
- Viết kế hoạch giải ngân theo scenario và trigger.

**Knowledge set**

- Xây dựng danh mục (non-canonical concept).
- Position sizing.
- Cash buffer.
- Tái cân bằng danh mục (term:portfolio_rebalancing).
- Entry, add, trim, exit discipline.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò | Lưu ý |
| --- | --- | --- | --- |
| Tỷ trọng vị thế (position_weight) | metric | Tỷ trọng từng mã/vị thế | Công thức quy ước: giá trị vị thế / tổng giá trị danh mục |
| Tỷ trọng phân bổ tài sản (asset_allocation_weight) | metric | Tỷ trọng theo lớp tài sản | Không tự động suy ra từ risk profile nếu chưa có rule |
| Vòng quay danh mục (portfolio_turnover) | metric | Mức độ xoay vòng danh mục | Cần xác định kỳ đo |
| Số lượng cổ phiếu nắm giữ (holding_count) | metric | Số lượng vị thế | Không phản ánh đầy đủ diversification nếu correlation cao |

**Đánh giá**

- **Evidence artifact**: học viên xây Portfolio Construction Sheet và chứng minh logic tỷ trọng từng vị thế bằng profile, scenario, driver và risk limits.

### Module C8 — Dashboard Tháp tài sản: đo lường hiệu quả, rủi ro và tương quan

**Mục tiêu học tập**

- Đọc dashboard hiệu quả và rủi ro của Tháp tài sản, không chỉ dashboard của từng mã cổ phiếu.
- Phân biệt chỉ số đo lợi nhuận, chỉ số đo biến động, chỉ số đo tương quan và chỉ số đo lợi nhuận điều chỉnh rủi ro.
- Nối dashboard với bốn chiều của tháp: thị giá, thanh khoản, lợi tức kỳ vọng và rủi ro biến động.
- Không dùng alpha, beta, Sharpe, Treynor, correlation như công thức máy móc nếu chưa rõ benchmark, window và dữ liệu.

**Skill set**

- Diễn giải ROI, alpha, beta, volatility, correlation, Sharpe, Treynor.
- Nhận diện tháp có quá nhiều rủi ro hệ thống, quá tập trung, thiếu thanh khoản hoặc thiếu tương thích với mục tiêu lợi tức kỳ vọng.
- Đề xuất thay đổi danh mục dựa trên dashboard.

**Knowledge set**

- Portfolio return.
- ROI decomposition.
- Alpha.
- Beta.
- Volatility / standard deviation.
- Correlation coefficient.
- Sharpe ratio.
- Treynor ratio.
- Drawdown.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò | Trạng thái công thức |
| --- | --- | --- | --- |
| Tỷ suất lợi nhuận trên vốn đầu tư (roi) | metric | Lợi nhuận trên vốn đầu tư | Verified from source-maintained page |
| Chỉ số Alpha của danh mục (alpha) | metric | Lợi nhuận vượt benchmark | Unspecified by source; cần benchmark/window |
| Hệ số beta (beta) | metric | Độ nhạy với benchmark | Unspecified by source; cần benchmark/window/frequency |
| Độ biến động (volatility) | metric | Biến động lợi nhuận | Unspecified by source; cần series, tần suất, cửa sổ và annualization |
| Hệ số tương quan (correlation_coefficient) | metric | Tương quan giữa tài sản/danh mục | Unspecified by source; cần cặp series và window |
| Tỷ lệ Sharpe (sharpe_ratio) | metric | Lợi nhuận điều chỉnh theo total risk | Unspecified by source; cần risk-free proxy và horizon |
| Tỷ lệ Treynor (treynor_ratio) | metric | Lợi nhuận điều chỉnh theo beta | Unspecified by source; phụ thuộc beta convention |
| Mức sụt giảm đỉnh-đáy (drawdown) | metric | Mức giảm từ đỉnh | Conventional formula; vẫn cần quy ước peak-to-trough và giai đoạn |

**Đánh giá**

- **Evidence artifact**: học viên đọc Risk-Return Dashboard và đề xuất 2 hành động cải thiện danh mục, nêu metric, convention và tác động lên bốn chiều của Tháp tài sản.

### Module C9 — TARA động: quản trị rủi ro và tái cấu trúc Tháp tài sản theo thời gian

**Mục tiêu học tập**

- Hiểu rủi ro danh mục gồm rủi ro thị trường, rủi ro ngành, rủi ro doanh nghiệp, rủi ro thanh khoản và rủi ro thực thi.
- Dùng ma trận xác suất-tác động để chọn Avoid, Reduce, Accept hoặc Transfer cho từng sợi dây rủi ro.
- Hiểu TARA như một ma trận có thể dịch chuyển theo thời gian khi xác suất, tác động hoặc độ trễ của sợi dây thay đổi.
- Biến TARA thành hành động tái cấu trúc Tháp tài sản cụ thể, không chỉ là ma trận lý thuyết.

**Skill set**

- Lập risk register cho từng tầng tài sản và toàn bộ tháp.
- Chấm probability và impact ở hiện tại, sau đó mô phỏng trạng thái TARA nếu scenario đổi chiều.
- Chọn risk treatment và mô tả hành động tương ứng: tăng/giảm tỷ trọng, giữ, chuyển sang tầng khác, dùng quỹ thay cổ phiếu riêng lẻ, nâng tiền mặt hoặc tránh tài sản.
- So sánh Tháp tài sản trước/sau tái cấu trúc.

**Knowledge set**

- TARA risk matrix.
- Probability-impact scoring.
- Avoid, Reduce, Accept, Transfer.
- Time-shifting TARA scenario.
- Market risk vs specific risk.
- Risk reduction and risk transfer cases.

**Metrics/terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò | Lưu ý |
| --- | --- | --- | --- |
| Điểm xác suất rủi ro (risk_probability_score) | metric | Điểm xác suất rủi ro | Cần rubric chấm điểm |
| Điểm tác động rủi ro (risk_impact_score) | metric | Điểm tác động rủi ro | Cần rubric chấm điểm |
| Nhóm ứng xử rủi ro TARA (tara_risk_treatment_class) | metric/classification | Nhóm hành động TARA | Boundary rules cần được thiết kế rõ |
| Ma trận rủi ro TARA (term:tara_risk_matrix) | term | Khung quản trị rủi ro | Không tự động sinh hành động nếu thiếu policy |

**Đánh giá**

- **Evidence artifact**: học viên lập TARA Scenario Playbook cho một case rủi ro thị trường Việt Nam, đưa ra danh mục trước/sau cùng lập luận Reduce/Transfer/Accept/Avoid.

### Module C10 — Thực thi giao dịch và kỷ luật triển khai

**Mục tiêu học tập**

- Hiểu các loại lệnh phổ biến và phiên giao dịch trên thị trường Việt Nam.
- Nối loại lệnh với mục tiêu thực thi: vào vị thế, kiểm soát giá, bảo vệ rủi ro, theo dõi xu hướng.
- Không biến execution thành trading cảm tính.

**Skill set**

- Phân biệt LO, MP, Stop, Stop-limit, Trailing Stop.
- Chọn loại lệnh theo tình huống.
- Lập execution checklist trước khi đặt lệnh.

**Knowledge set**

- HOSE/HNX/UPCoM sessions.
- Limit price.
- Trigger price.
- Trailing step.
- Order discipline.

**Terms nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò |
| --- | --- | --- |
| Lệnh LO (term:limit_order) | term | Đặt lệnh có giới hạn giá |
| Lệnh MP (term:market_price_order) | term | Ưu tiên khớp nhanh theo giá thị trường |
| Lệnh Stop (term:stop_order) | term | Kích hoạt hành động theo ngưỡng giá; cách hỗ trợ có thể phụ thuộc sàn/nền tảng/broker |
| Lệnh Stop limit (term:stop_limit_order) | term | Kết hợp trigger và giới hạn giá; cách hỗ trợ có thể phụ thuộc sàn/nền tảng/broker |
| Lệnh Trailing Stop (term:trailing_stop_order) | term | Dời ngưỡng bảo vệ theo xu hướng; cách hỗ trợ có thể phụ thuộc sàn/nền tảng/broker |

**Metrics/order fields nên dùng**

| Nhãn tiếng Việt (ID) | Loại | Vai trò |
| --- | --- | --- |
| Giá giới hạn (limit_price) | metric/order field | Giá giới hạn |
| Giá kích hoạt (trigger_price) | metric/order field | Giá kích hoạt |
| Bước giá trượt (trailing_step) | metric/order field | Bước dời trailing |

**Đánh giá**

- **Evidence artifact**: học viên lập Execution and Rebalancing Checklist, chọn loại lệnh phù hợp cho 3 tình huống: mua theo kế hoạch, cắt giảm rủi ro, bảo vệ lợi nhuận.

### Module C11 — Portfolio Management Dossier: Hồ sơ quản trị danh mục tích hợp

**Mục tiêu học tập**

- Tích hợp toàn bộ năng lực xây Tháp tài sản, đọc sợi dây tác động và quản trị rủi ro bằng TARA động.
- Hoàn thiện hồ sơ quản trị danh mục có cấu trúc theo logic Asset Pyramid Blueprint → Driver/String Map → Portfolio/TARA Action.
- Chứng minh khuyến nghị đầu tư bằng evidence artifacts, dữ liệu, scenario, dashboard hiệu quả-rủi ro, TARA Scenario Playbook và evidence audit.

**Yêu cầu Portfolio Management Dossier**

Mỗi học viên hoặc nhóm học viên chọn một persona/quỹ mẫu, một tháp tài sản mục tiêu và một doanh nghiệp niêm yết Việt Nam để hoàn thành:

1. **Asset Pyramid Blueprint artifact**: mục tiêu tăng trưởng dài hạn, tầng tài sản, tỷ trọng nền tảng, risk limits và horizon.
2. **Investor/fund context artifact**: persona hoặc mandate, risk profile, investment capacity, expected return target.
3. **Driver/String Map artifact**: các sợi dây vĩ mô, thị trường, ngành, doanh nghiệp và dòng tiền đang kéo từng tầng tài sản.
4. **Macro and market context artifact**: kịch bản vĩ mô và kịch bản TTCK liên quan, nêu chiều tác động, trọng số và độ trễ.
5. **Industry analysis artifact**: lifecycle, segmentation, competitive forces, CSF như driver ngành.
6. **Company analysis artifact**: business model, strategy, governance, financial statements, ratios, cash flow như driver doanh nghiệp.
7. **Stock-group classification artifact**: gán doanh nghiệp vào 1 trong 6 nhóm cổ phiếu và chứng minh vai trò trong tháp bằng bằng chứng.
8. **Valuation scope artifact**: định giá tương đối bằng multiples là mức tối thiểu; DCF/FCFE/DDM/CAPM chỉ dùng nếu lớp đã xác định rõ methodology và dữ liệu.
9. **Portfolio role artifact**: tỷ trọng đề xuất, vai trò trong danh mục, trigger mua/bán/theo dõi và tác động lên bốn chiều của tháp.
10. **TARA Scenario Playbook artifact**: TARA hiện tại, TARA nếu scenario dịch chuyển, downside scenario và hành động Reduce/Transfer/Accept/Avoid.
11. **Execution and rebalancing plan artifact**: loại lệnh, điều kiện giải ngân, điều kiện tái cân bằng và kỷ luật theo dõi.
12. **Final recommendation artifact**: buy/hold/watch/avoid hoặc recommendation label do chương trình quy định.
13. **Evidence Artifact Index**: danh mục artifact, module xuất xứ, nguồn dữ liệu, ngày dữ liệu và convention liên quan.
14. **Data Appendix and Decision Log**: phụ lục dữ liệu và nhật ký quyết định giải thích vì sao tăng, giảm, giữ, tránh hoặc chuyển rủi ro.

**Đánh giá**

- Portfolio Management Dossier hoàn chỉnh.
- Evidence Artifact Index, Data Appendix và convention checklist.
- Dossier review theo rubric.
- Evidence audit về tính nhất quán giữa profile, scenario, allocation, dashboard, TARA, execution và risk treatment.

