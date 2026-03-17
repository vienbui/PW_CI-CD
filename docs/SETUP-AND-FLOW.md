# Step-by-Step Guide: Playwright API Testing with Layer Architecture

This document describes the process from creating a new project, installing Playwright, writing simple tests, refactoring by layers, to the flow **Register → Login → Save token → Use token** (e.g., calling the Get Me API).

---

## Step 1: Create a new project

```bash
mkdir my-playwright-api-project
cd my-playwright-api-project
```

---

## Step 2: Initialize Playwright

```bash
npm init playwright@latest
```

When prompted:

- **Where to put your end-to-end tests?** → `./tests` (or default)
- **Add a GitHub Actions workflow?** → Yes/No as you prefer
- **Install Playwright browsers?** → Yes

When done, you will have:

- `playwright.config.ts` – test configuration
- `tests/` folder – contains spec files
- `package.json` with script `npx playwright test`

Run a quick test:

```bash
npx playwright test
```

---

## Step 3: Write a simple API test (without layer separation)

Create a test file that calls the API directly, e.g. `tests/api/registerUser.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('register user - simple', async ({ request }) => {
  const payload = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'SuperSecure@123',
    phone: '0987654321',
    dob: '1990-01-15',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      postal_code: '62701',
    },
  };

  const response = await request.post('https://your-api.com/users/register', {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.email).toBe(payload.email);
});
```

- Use Playwright's `request` (fixture).
- URL and payload are hardcoded in the spec.
- Run: `npx playwright test tests/api/registerUser.spec.ts`

---

## Step 4: Refactor – Separate layers

Goal: separate **config**, **routes**, **models**, **base API**, **services**, **factories** so tests are easier to maintain and reuse.

### 4.1 Suggested folder structure

```
src/
  config/
    env.ts           # environment variables (API_URL)
  routes/
    user.routes.ts   # API paths (register, login, getMe)
  models/
    user.models.ts   # request/response interfaces
  baseApi.ts         # initialize request context (baseURL, headers)
  services/
    user.services.ts # API calls: register, login, getUser
  factories/
    user.factory.ts  # create test data (unique email, etc.)
tests/
  api/
    registerUser.spec.ts
    loginUser.spec.ts
    getMeUser.spec.ts
```

### 4.2 Install additional dependencies

```bash
npm install dotenv
npm install -D @types/node
# (optional) npm install @faker-js/faker
```

Create a `.env` file at the project root:

```env
API_URL=https://your-api.com
```

### 4.3 Create `src/config/env.ts`

```ts
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.API_URL) {
  throw new Error('API_URL is not set');
}

export const env = {
  API_URL: process.env.API_URL,
};
```

### 4.4 Create `src/models/user.models.ts`

Define request/response interfaces for user (register, login, get me):

```ts
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface UserRegisterRequest {
  first_name: string;
  last_name: string;
  address: Address;
  phone: string;
  dob: string;
  password: string;
  email: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
```

### 4.5 Create `src/routes/user.routes.ts`

Consolidate all user API paths in one place:

```ts
export const USER_ROUTES = {
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  GET_USER: '/users/me',
};
```

### 4.6 Create `src/baseApi.ts`

- Use Playwright's `request.newContext()` with `baseURL` from `env`.
- Set default headers (Content-Type, Accept).
- Services extend this and use `this.request` to call the API.

```ts
import { request } from '@playwright/test';
import { env } from './config/env';

export class BaseApi {
  protected request!: Awaited<ReturnType<typeof request.newContext>>;

  async init() {
    this.request = await request.newContext({
      baseURL: env.API_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async close() {
    await this.request.dispose();
  }
}
```

(Note: the sample project uses `APIRequestContext` from `@playwright/test` – usage is similar.)

### 4.7 Create `src/services/user.services.ts`

Service extends `BaseApi`, calls API via `USER_ROUTES` and `user.models`:

```ts
import { BaseApi } from '../baseApi';
import { UserRegisterRequest, UserLoginRequest } from '../models/user.models';
import { USER_ROUTES } from '../routes/user.routes';

export class UserServices extends BaseApi {
  async registerUser(payload: UserRegisterRequest) {
    return this.request.post(USER_ROUTES.REGISTER, { data: payload });
  }

  async loginUser(payload: UserLoginRequest) {
    return this.request.post(USER_ROUTES.LOGIN, { data: payload });
  }

  async getUser(token: string) {
    return this.request.get(USER_ROUTES.GET_USER, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
```

### 4.8 Create `src/factories/user.factory.ts`

Factory creates register payload with unique email (avoids conflicts when running tests multiple times):

```ts
import type { UserRegisterRequest } from '../models/user.models';

const defaultAddress = {
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  country: 'USA',
  postal_code: '62701',
};

export function buildUserRegisterRequest(
  overrides: Partial<UserRegisterRequest> = {}
): UserRegisterRequest {
  const uniqEmail = `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}@example.com`;
  const { address: addressOverrides, ...restOverrides } = overrides;
  return {
    first_name: 'John',
    last_name: 'Doe',
    phone: '0987654321',
    dob: '1990-01-15',
    password: 'SuperSecure@123',
    email: uniqEmail,
    ...restOverrides,
    address: { ...defaultAddress, ...addressOverrides },
  };
}

export const userFactory = { build: buildUserRegisterRequest };
```

---

## Step 5: Flow Register → Login → Save token → Use token

Flow: **Register user → Log in with that user → Get and save `access_token` → Call auth-required API (e.g. Get Me)**.

### 5.1 Test Register (using layers)

`tests/api/registerUser.spec.ts` – use `afterEach` to call `userService.close()` (dispose request context):

```ts
import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('register user', async () => {
  userService = new UserServices();
  await userService.init();

  const payload = userFactory.build();
  const response = await userService.registerUser(payload);
  const responseBody = await response.json();

  expect(response.status()).toBe(201);
  expect(responseBody.email).toBe(payload.email);
});
```

### 5.2 Test Login (setup: register first, then login)

`tests/api/loginUser.spec.ts` – includes a negative test (login with wrong password → 401):

```ts
import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('login user', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const loginPayload = {
    email: registerPayload.email,
    password: registerPayload.password,
  };
  const response = await userService.loginUser(loginPayload);

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.access_token).toBeDefined();
  expect(responseBody.token_type).toBe('bearer');
  expect(responseBody.expires_in).toBe(300);
});

test('login with wrong password returns 401', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const response = await userService.loginUser({
    email: registerPayload.email,
    password: 'WrongPassword123!',
  });

  expect(response.status()).toBe(401);
});
```

### 5.3 Test Get Me – Save token and use token

`tests/api/getMeUser.spec.ts` – includes a negative test (call Get Me without token → 401):

1. Register user (or use an existing user).
2. Login → receive response containing `access_token`.
3. **Save token** (in the test a variable is enough, e.g. `access_token`).
4. Call Get Me API with header `Authorization: Bearer <access_token>`.

```ts
import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('get me user', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const loginPayload = {
    email: registerPayload.email,
    password: registerPayload.password,
  };
  const loginResponse = await userService.loginUser(loginPayload);
  expect(loginResponse.status()).toBe(200);

  const { access_token } = await loginResponse.json();

  const response = await userService.getUser(access_token);

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.email).toBe(registerPayload.email);
  expect(responseBody.first_name).toBe(registerPayload.first_name);
  expect(responseBody.last_name).toBe(registerPayload.last_name);
});

test('get me without token returns 401', async () => {
  userService = new UserServices();
  await userService.init();

  const response = await userService.getUser('');

  expect(response.status()).toBe(401);
});
```

Summary of flow in the test:

| Step | Action | Notes |
|------|--------|-------|
| 1 | `userFactory.build()` | Create register payload (unique email) |
| 2 | `userService.registerUser(payload)` | Register user |
| 3 | `userService.loginUser({ email, password })` | Login, receive `access_token` |
| 4 | Save token: `const { access_token } = await loginResponse.json()` | Token used for next step |
| 5 | `userService.getUser(access_token)` | Call Get Me API with Bearer token |

### 5.4 Cleanup (afterEach) and negative tests

**Cleanup request context with `afterEach`**

Each test creates `UserServices` and calls `init()` → creates one `request` context (Playwright). To avoid resource leaks, after each test call `userService.close()` (dispose context). How to do it:

- Declare variable outside the test: `let userService: UserServices`
- In each test assign: `userService = new UserServices(); await userService.init(); ...`
- Register `test.afterEach(async () => { if (userService) await userService.close(); })`

Apply to all three files: `registerUser.spec.ts`, `loginUser.spec.ts`, `getMeUser.spec.ts`.

**Negative tests (edge cases)**

Besides the happy path, have at least 1–2 negative tests to show how to verify API errors:

| File | Negative test | Expected |
|------|----------------|----------|
| `loginUser.spec.ts` | Login with wrong password (user already registered) | `401 Unauthorized` |
| `getMeUser.spec.ts` | Call Get Me without sending token (or empty token) | `401 Unauthorized` |

Examples are already in the code in section 5.2 (login wrong password) and 5.3 (get me without token). If your API returns a different status (e.g. 403), just change `expect(response.status()).toBe(401)` to match.

---

## Step 6: Configure Playwright (optional)

In `playwright.config.ts` you can load `dotenv` so `API_URL` is available when running tests:

```ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## Step 7: Organize tests with test.describe (optional)

After you have the Register, Login, Get Me tests (one test per file), you can put them in one file and group with `test.describe()` for clearer reporting and easier extension.

### Step 1: Consolidate tests into one file

Create (or use) a spec file, e.g. `tests/api/user.api.spec.ts`, and wrap all tests in one `test.describe`:

```ts
import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

test.describe('User API', () => {
  test('register user', async () => {
    const userService = new UserServices();
    await userService.init();
    const payload = userFactory.build();
    const response = await userService.registerUser(payload);
    const responseBody = await response.json();
    expect(response.status()).toBe(201);
    expect(responseBody.email).toBe(payload.email);
  });

  test('login user', async () => {
    const userService = new UserServices();
    await userService.init();
    const registerPayload = userFactory.build();
    await userService.registerUser(registerPayload);
    const loginPayload = { email: registerPayload.email, password: registerPayload.password };
    const response = await userService.loginUser(loginPayload);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.access_token).toBeDefined();
    expect(responseBody.token_type).toBe('bearer');
    expect(responseBody.expires_in).toBe(300);
  });

  test('get me user', async () => {
    const userService = new UserServices();
    await userService.init();
    const registerPayload = userFactory.build();
    await userService.registerUser(registerPayload);
    const loginResponse = await userService.loginUser({
      email: registerPayload.email,
      password: registerPayload.password,
    });
    expect(loginResponse.status()).toBe(200);
    const { access_token } = await loginResponse.json();
    const response = await userService.getUser(access_token);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.email).toBe(registerPayload.email);
    expect(responseBody.first_name).toBe(registerPayload.first_name);
    expect(responseBody.last_name).toBe(registerPayload.last_name);
  });
});
```

### Step 2: (Optional) Use beforeEach to avoid repeating init

If every test needs an initialized `UserServices`, use `test.beforeEach` in the same `test.describe`:

```ts
test.describe('User API', () => {
  let userService: UserServices;

  test.beforeEach(async () => {
    userService = new UserServices();
    await userService.init();
  });

  test('register user', async () => {
    const payload = userFactory.build();
    const response = await userService.registerUser(payload);
    // ... assertions
  });
  // other tests share userService
});
```

### Note: When to add another test.describe layer?

- **One layer is enough** when each API has only one test. Report is still clear: **User API › register user**, **User API › login user**, ...
- **Add a second layer** (e.g. `test.describe('Register', () => { ... })`) when:
  1. You have **multiple tests for the same behavior** (Register: success, duplicate email, missing field, invalid format...).
  2. You want **separate hooks** per group (`beforeEach` / `afterEach` only run within that group).
  3. You want **hierarchical reporting** like: **User API › Register › registers successfully...**

**In summary:** The second describe layer is for **organization**, not required. One test per API means one `test.describe('User API', ...)` is enough; when you have multiple tests per API or need hooks/hierarchy, add `test.describe('Register', ...)`, `test.describe('Login', ...)` for clarity and easier extension.

---

## Separate environments by AG1, Staging, Production (interview question)

When the interviewer asks: *"How do you separate environments by ag1, stg, prod?"* – they mean running tests against multiple environments (acceptance/staging/production) without changing code, only config or environment variables.

### How to do it

1. **Use an `ENV` variable** (or `NODE_ENV`) with value: `ag1` | `stg` | `prod`.
2. **Each environment has its own base URL** – configured in `.env` or `.env.<environment-name>`.
3. **Code reads from one place** – `src/config/env.ts` reads `ENV` and returns the correct `API_URL` for that environment.

### Configuration

**Option 1: Single `.env` file – use URL per env**

In `.env`:

```env
# Choose 1 of 3, or set when running: ENV=ag1 npm run test
ENV=stg

API_URL_AG1=https://api-ag1.yourapp.com
API_URL_STG=https://api-stg.yourapp.com
API_URL_PROD=https://api.yourapp.com
```

`env.ts` will:
- Read `ENV` (default `stg`).
- If `API_URL` is set, use it (override).
- Otherwise use `API_URL_AG1` / `API_URL_STG` / `API_URL_PROD` according to `ENV`.

**Option 2: Multiple .env files – one per environment**

- `.env.ag1` → `API_URL=https://api-ag1.yourapp.com`
- `.env.stg` → `API_URL=https://api-stg.yourapp.com`
- `.env.prod` → `API_URL=https://api.yourapp.com`

When running tests, set `ENV` to load the correct file:

```bash
ENV=ag1 npx playwright test    # load .env.ag1
ENV=stg npx playwright test    # load .env.stg
ENV=prod npx playwright test   # load .env.prod
```

### Code in `src/config/env.ts`

- Load `.env` first.
- If `ENV` ∈ {ag1, stg, prod}, also load `.env.<ENV>` (override).
- `API_URL` = `process.env.API_URL` or `API_URL_AG1`/`API_URL_STG`/`API_URL_PROD` based on `ENV`.
- Export `env.API_URL` and `env.ENV` so tests and services use a single source.

### Scripts in `package.json`

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ag1": "ENV=ag1 playwright test",
    "test:stg": "ENV=stg playwright test",
    "test:prod": "ENV=prod playwright test"
  }
}
```

On Windows (PowerShell) you can use `cross-env`:

```bash
npm install -D cross-env
```

```json
"test:ag1": "cross-env ENV=ag1 playwright test",
"test:stg": "cross-env ENV=stg playwright test",
"test:prod": "cross-env ENV=prod playwright test"
```

### Short answer when the interviewer asks

- Use **one environment variable** (e.g. `ENV`) with value `ag1` / `stg` / `prod`.
- Configure **base URL** (or full config) per env: via `.env.<env>` or variables `API_URL_AG1`, `API_URL_STG`, `API_URL_PROD` in `.env`.
- In code have **one config module** (e.g. `env.ts`) that reads `ENV` and exports `API_URL` (and other vars) accordingly; tests and API client only use this config, no hardcoded URL.
- CI/CD runs tests per environment by setting `ENV=ag1` or `ENV=stg` / `ENV=prod` when calling `playwright test`.

---

## Run all tests

```bash
npx playwright test
```

Run by environment:

```bash
ENV=ag1 npx playwright test
ENV=stg npx playwright test
ENV=prod npx playwright test
```

Run a single file:

```bash
npx playwright test tests/api/getMeUser.spec.ts
```

View report:

```bash
npx playwright show-report
```

---

## Final checklist

- [ ] Create project and run `npm init playwright@latest`
- [ ] Write at least one simple API test (direct request)
- [ ] Separate layers: `config`, `routes`, `models`, `baseApi`, `services`, `factories`
- [ ] Test Register using `UserServices` + `userFactory`
- [ ] Test Login: register first, then login, assert `access_token`
- [ ] Test Get Me: register → login → save `access_token` → call Get Me with Bearer token
- [ ] (Optional) Organize tests with `test.describe('User API', ...)`; add a second describe layer (Register, Login, Get Me) when you have multiple tests per API or need hooks/hierarchy
- [ ] Separate environments: `ENV=ag1|stg|prod`, config `API_URL` per env (`.env` or `.env.ag1`/`.env.stg`/`.env.prod`), scripts `test:ag1` / `test:stg` / `test:prod`
- [ ] (Optional) Write negative cases: see **Step-by-Step: Writing Negative Test Cases** below

After completing all steps above, you have the full flow: **create project → Playwright → simple test → refactor layers → register → login → save token → use token** and **run tests per environment (ag1, stg, prod)**.

---

## Step-by-Step: Writing Negative Test Cases

This document describes the process of writing negative test cases for API tests (Playwright, UserServices, userFactory).

### Step 1: Identify negative scenarios

For each API, list cases of **wrong input / wrong conditions** that the API must reject or return an error for:

| API        | Negative case                          | Expected (typically)   |
|-----------|----------------------------------------|-------------------------|
| **Register** | Email already exists                 | 400/409, error message  |
| **Register** | Missing required field (email, password...) | 400/422       |
| **Register** | Invalid email                        | 400                     |
| **Register** | Password too weak / wrong format     | 400                     |
| **Login**    | Wrong password                       | 401                     |
| **Login**    | Email not registered                 | 401/404                  |
| **Login**    | Missing email or password            | 400                     |
| **Get Me**   | No token sent                        | 401                     |
| **Get Me**   | Invalid / expired token              | 401                     |

Choose the most important cases to write first (e.g. wrong password, no token).

### Step 2: Prepare data for negative cases

- **Use factory with override** for wrong payload (missing field, wrong format).
- **Clearly separate** "correct" (positive) and "wrong" (negative) data in each test.

**Example with Login:**

```ts
// Positive: use registered user
const registerPayload = userFactory.build();
await userService.registerUser(registerPayload);
const loginPayload = { email: registerPayload.email, password: registerPayload.password };

// Negative: wrong password
const wrongLoginPayload = { email: registerPayload.email, password: 'WrongPassword123!' };
```

**Example Get Me without token:**

```ts
// Don't call login, only call getUser with empty or invalid token
const response = await userService.getUser('');
// or
const response = await userService.getUser('invalid-token');
```

### Step 3: Call API with negative input

In the test, call only **one** "wrong" action per case:

- **Login:** call `loginUser(wrongLoginPayload)` or `loginUser({ email: 'unknown@test.com', password: 'x' })`.
- **Get Me:** call `getUser('')` or `getUser('invalid')` (no login).

### Step 4: Assert status code and (if any) error body

Negative cases should assert:

1. **HTTP status** is correct (400, 401, 404, 409, 422… depending on API).
2. **Body** (if API returns message/error code): has expected error message or error code.

**Example:**

```ts
// Only assert status
expect(response.status()).toBe(401);

// Or status + body
expect(response.status()).toBe(401);
const body = await response.json();
expect(body.message).toBeDefined();
// or expect(body.error).toContain('Invalid credentials');
```

If your API has an error standard (e.g. `{ error: string, message?: string }`), assert that structure too.

### Step 5: Name tests clearly

Test names should reflect **behavior + expected result**:

- `login with wrong password should return 401`
- `get me without token should return 401`
- `register with existing email should return 409`

That way the report clearly shows which case is being tested.

### Step 6: Organize spec file

Two common approaches:

- **Same file as positive:** Keep positive tests as they are, add `test('...', async () => { ... })` for each negative case.
- **Separate file (if many negative):** e.g. `loginUser.negative.spec.ts` or in `loginUser.spec.ts` use `test.describe('negative cases', () => { ... })`.

For small projects, keep them in one file and use `test.describe` for clarity.

### Concrete examples in the project

**1. Login – wrong password (401):**

- Create user with `userFactory.build()` and `registerUser`.
- Call `loginUser({ email: registerPayload.email, password: 'WrongPassword!' })`.
- `expect(response.status()).toBe(401)` (and body if API returns it).

**2. Get Me – no token (401):**

- No register/login.
- Call `getUser('')` or do not send Authorization header.
- `expect(response.status()).toBe(401)`.

**3. Register – email already exists (400/409):**

- Register a user with `userFactory.build()`.
- Call `registerUser()` a second time with the same email.
- `expect(response.status()).toBe(400)` or `409` (depending on API).

### Negative cases checklist

1. Choose scenario: what wrong input? (wrong password, missing token, duplicate email, etc.)
2. Prepare data: use factory/override to create the correct "wrong" input.
3. Call the right API once with that input.
4. Assert status (and error body if needed).
5. Name the test to clearly describe the case (e.g. "login with wrong password returns 401").

---

## Set up project on GitHub and GitHub Actions

Step-by-step guide to put the project on GitHub and configure GitHub Action (CI) to run Playwright tests.

### Part 1: Put project on GitHub

#### Step 1: Add `.env` to `.gitignore`

The `.env` file contains sensitive variables (API URL, token…); it should not be committed to GitHub. Open `.gitignore` and add:

```
.env
```

#### Step 2: Initialize Git (if not already)

In the project directory:

```bash
cd /path/to/mar9
git init
```

#### Step 3: Create repository on GitHub

1. Go to [github.com](https://github.com) → **New repository**.
2. Name the repo (e.g. `mar9`).
3. **Do not** select "Add a README" (you already have local code).
4. Click **Create repository**.

#### Step 4: Add, commit and push

```bash
git add .
git commit -m "Initial commit: Playwright API tests"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

Replace `<USERNAME>` and `<REPO>` with your GitHub username and repo name.

---

### Part 2: GitHub Action (CI) for Playwright

The project already has a workflow: **`.github/workflows/playwright.yml`**.

#### What the current workflow does

- **Triggered:** on each push or pull request to branch `main` or `master`.
- **Steps:**
  1. Checkout code.
  2. Install Node (LTS).
  3. `npm ci` (install dependencies).
  4. Install Playwright browsers: `npx playwright install --with-deps`.
  5. Run tests: `npx playwright test`.
  6. Upload artifact `playwright-report/` (kept 30 days) to view report when tests fail.

#### Configure `API_URL` for GitHub Actions

The code uses `API_URL` from `.env` (in `src/config/env.ts`). On CI there is no `.env` file, so you need to set the environment variable in the workflow.

**Option 1 – Use GitHub Secrets (if API is private / sensitive):**

1. On GitHub: repo → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**: name = `API_URL`, value = `https://api.practicesoftwaretesting.com` (or your actual URL).
3. Edit `.github/workflows/playwright.yml`, add `env` for the test run step:

```yaml
    - name: Run Playwright tests
      run: npx playwright test
      env:
        API_URL: ${{ secrets.API_URL }}
```

**Option 2 – Hardcode in workflow (for public/test API only):**

In the same test run step, add:

```yaml
    - name: Run Playwright tests
      run: npx playwright test
      env:
        API_URL: https://api.practicesoftwaretesting.com
```

After adding one of the two options, each push/PR to `main`/`master` will run Playwright tests in GitHub Actions; if they fail, go to the **Actions** tab → select the run → download the **playwright-report** artifact to view the HTML report.

---

## Docker: Dockerize project and run with Docker

Step-by-step guide to dockerize the Playwright project and run tests in a container.

### Step 1: Create `.dockerignore`

Create **`.dockerignore`** at the project root to build faster and keep the image smaller (exclude `node_modules`, reports, etc.):

```
node_modules
test-results
playwright-report
.playwright
.env
*.log
.git
```

### Step 2: Create `Dockerfile`

Create **`Dockerfile`** at the project root. Two approaches:

#### Option A: Use official Playwright image (includes Node + browsers)

Use when you may run UI (browser) tests later:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (no need to install browsers in this image)
RUN npm ci

# Copy source and tests
COPY . .

# By default run all tests
CMD ["npx", "playwright", "test"]
```

#### Option B: API tests only (no browser) – smaller image

Use when only running API tests, no browser needed:

```dockerfile
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Only install Playwright dependencies, do not install browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npx playwright install-deps || true

COPY . .

CMD ["npx", "playwright", "test"]
```

Choose **A** if you need a browser, **B** if only calling the API.

### Step 3: Pass environment variables when running

The code uses `API_URL` (and possibly `ENV`, `API_URL_AG1`, …). Two options:

#### Option 3.1: Pass directly when running `docker run`

```bash
docker build -t mar9-tests .
docker run --rm -e API_URL=https://api.example.com mar9-tests
```

#### Option 3.2: Use `.env` file (do not commit the actual file)

```bash
docker run --rm --env-file .env mar9-tests
```

Ensure `.env` contains at least:

```env
API_URL=https://your-api.com
```

### Step 4: Run with Docker

#### Build image

```bash
cd /path/to/mar9
docker build -t mar9-tests .
```

#### Run all tests

```bash
docker run --rm -e API_URL=https://your-api.com mar9-tests
```

#### Run a specific test file

```bash
docker run --rm -e API_URL=https://your-api.com mar9-tests npx playwright test tests/api/loginUser.spec.ts
```

#### Run with env (ag1 / stg / prod)

```bash
docker run --rm --env-file .env mar9-tests npx playwright test --project=chromium
# Or with ENV
docker run --rm -e ENV=stg -e API_URL=https://api-stg.example.com mar9-tests
```

### Step 5 (optional): Docker Compose

Create **`docker-compose.yml`** at the project root:

```yaml
services:
  tests:
    build: .
    env_file: .env
    # Or pass directly:
    # environment:
    #   - API_URL=${API_URL}
```

Run:

```bash
docker compose run --rm tests
# Or run a specific spec
docker compose run --rm tests npx playwright test tests/api/loginUser.spec.ts
```

### Notes when running Docker

1. **`API_URL`** must point to a host the container can reach:
   - If the API is public: use the actual URL (e.g. `https://api.example.com`).
   - If the API runs on the host machine: use `http://host.docker.internal:PORT` (macOS/Windows) or the host machine IP (Linux).

2. **View HTML report** (if needed): you can mount a volume to copy the report out:
   ```bash
   docker run --rm -e API_URL=... -v $(pwd)/playwright-report:/app/playwright-report mar9-tests
   ```
   Or use `docker compose` with a similar volume.

3. **Playwright config**: Currently `playwright.config.ts` has multiple projects (chromium, firefox, webkit). If only testing the API, you can run with one project: `npx playwright test --project=chromium`.

---

### Quick summary

| Step | What to do |
|------|------------|
| 1 | Add `.env` to `.gitignore` |
| 2 | `git init` (if not already) |
| 3 | Create a new repo on GitHub (do not add README) |
| 4 | `git add .` → `git commit` → `git remote add origin` → `git push -u origin main` |
| 5 | In the workflow, set `API_URL` via `env` (from `secrets.API_URL` or a fixed URL) |
