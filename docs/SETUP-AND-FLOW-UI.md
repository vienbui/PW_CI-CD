# Step-by-Step Guide: Học và Implement UI (Browser) Tests với Playwright

Tài liệu này mô tả quy trình từ việc hiểu khác biệt API vs UI test, cấu hình, viết test UI đơn giản, đến tổ chức thư mục và kết hợp với API tests hiện có.

---

## Bước 1: Hiểu khác biệt API test vs UI test

- **API test** (đang dùng): dùng fixture `request`, gọi HTTP trực tiếp, không mở browser.
- **UI test**: dùng **browser**, **page**, **locators** để mở trang, click, nhập, assert trên giao diện.

Trong UI test bạn sẽ dùng:

- `page` (từ fixture `@playwright/test`)
- `page.goto(url)`, `page.click()`, `page.fill()`, `page.locator()`
- `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`, v.v.

---

## Bước 2: Cấu hình cho UI tests

Trong `playwright.config.ts`:

### 2.1 Thiết lập `baseURL`

Set URL gốc của app (ví dụ frontend của Practice Software Testing hoặc app bạn test):

```ts
use: {
  baseURL: 'https://practicesoftwaretesting.com', // hoặc http://localhost:3000
  trace: 'on-first-retry',
},
```

### 2.2 Tách API vs UI (tùy chọn)

Có thể tách project để chạy riêng:

- Một project chỉ chạy `tests/api/**`
- Một project chỉ chạy `tests/e2e/**` hoặc `tests/ui/**`

Hoặc lúc đầu chỉ cần thêm folder `tests/e2e/` và chạy:

```bash
npx playwright test tests/e2e/
```

---

## Bước 3: Viết một UI test đơn giản

Tạo file ví dụ `tests/e2e/smoke.spec.ts`:

1. `page.goto('/')` — mở trang chủ
2. Dùng **locator** (CSS, text, role): `page.getByRole('link', { name: '...' })`, `page.locator('button')`, v.v.
3. Thực hiện action: `click()`, `fill()`, `check()`
4. Assert: `expect(locator).toBeVisible()`, `toHaveText()`, `toHaveURL()`

**Ví dụ tối giản:**

```ts
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Practice/);
});
```

Chạy:

```bash
npx playwright test tests/e2e/smoke.spec.ts
```

---

## Bước 4: Học Locators & best practices

- **Ưu tiên**: `getByRole()`, `getByLabel()`, `getByText()` (dễ đọc, ổn khi UI đổi)
- **Tránh** phụ thuộc quá nhiều vào CSS phức tạp (trừ khi cần)
- **Data attributes**: nếu frontend có `data-testid`, dùng `getByTestId()`
- Đọc doc: [Playwright – Locators](https://playwright.dev/docs/locators), [Best practices](https://playwright.dev/docs/best-practices)

---

## Bước 5: Cấu trúc thư mục cho UI

Gợi ý tương tự cách tách layer cho API:

```
tests/
  api/           # giữ nguyên
  e2e/           # UI / E2E
    smoke.spec.ts
    login.spec.ts
    ...
```

Sau này nếu UI tests nhiều, có thể thêm:

- **Page Object**: mỗi trang một class (ví dụ `LoginPage`, `HomePage`) chứa locators và actions, spec chỉ gọi vào đó
- **Fixtures**: setup/teardown chung (login sẵn, cleanup data)

---

## Bước 6: Kết hợp API + UI (tùy chọn)

Flow "Register → Login → dùng token" đã có trong API. Với UI có thể:

- **Setup**: gọi API register/login, lấy token
- **Storage state**: lưu cookie/localStorage vào file (Playwright hỗ trợ)
- **UI test**: khởi tạo context với storage state đó → vào app đã login, chỉ cần test màn hình

Tài liệu: [Playwright – Authentication](https://playwright.dev/docs/auth)

---

## Bước 7: Chạy và debug

- Chạy có UI: `npx playwright test tests/e2e --ui` hoặc `--headed`
- Chạy một file: `npx playwright test tests/e2e/smoke.spec.ts`
- Debug: `npx playwright test --debug` hoặc `page.pause()` trong code
- Xem report: `npx playwright show-report` sau khi chạy

---

## Thứ tự thực hành gợi ý

| # | Việc |
|---|------|
| 1 | Set `baseURL` trong config, tạo folder `tests/e2e/` |
| 2 | Viết 1 test: `goto('/')` + assert title hoặc 1 element |
| 3 | Viết test login (fill form, submit, assert redirect hoặc message) |
| 4 | Thêm test cho 1–2 flow chính (ví dụ search, add to cart) |
| 5 | (Sau đó) Refactor sang Page Object / fixtures nếu cần |
| 6 | (Tùy chọn) Dùng API để login sẵn rồi test UI đã đăng nhập |

---

## Tóm tắt

Bắt đầu từ **Bước 2 + 3** (config `baseURL` + một spec UI đơn giản trong `tests/e2e/`), chạy và xem report. Sau đó học locators (Bước 4) và từ từ thêm test phức tạp hơn (Bước 5–6). Playwright đã có sẵn browser projects (chromium, firefox, webkit) trong config nên chỉ cần viết test dùng `page` là có thể chạy UI ngay.
