## Client App Test Plan

This document describes the comprehensive test plan for the `client` React app (`frontend-app`), built with Vite, React 19, React Router, and an auth context backed by Axios.

The goal is to cover all critical flows and edge‑cases so that the client behaves correctly against both happy‑paths and failure scenarios.

---

## 1. Test Infrastructure

- **Frameworks**
  - Vitest as the test runner.
  - React Testing Library (RTL) for component rendering and interaction.
  - Testing Library User Event for user‑like interactions.
  - `jsdom` as the DOM environment.

- **Global setup**
  - Create a `src/test/setup.ts` (or similar) for:
    - Importing `@testing-library/jest-dom`.
    - Stubbing `IntersectionObserver` (if needed in future components).
    - Stubbing `window.location` / `window.history` helpers (when testing redirects).
  - Configure `vitest` in `vite.config.ts`:
    - `environment: 'jsdom'`.
    - `globals: true`.
    - `setupFiles: ['src/test/setup.ts']`.

---

## 2. App Shell & Routing (`src/App.tsx`)

**File:** `src/App.tsx`  
**Components under test:** `<App />`  
**Key responsibilities:**
- Bootstraps providers:
  - `GoogleOAuthProvider` (with `VITE_GOOGLE_CLIENT_ID`).
  - `AuthProvider`.
- Sets up routing:
  - `/login` ➜ `<Login />`
  - `/register` ➜ `<Register />`
  - `*` ➜ `<Navigate to="/login" replace />`

### 2.1. Provider wiring

**Tests:**
1. **App renders without crashing**
   - Render `<App />` wrapped in a MemoryRouter (if needed).
   - Assert that some stable element from the login page appears (e.g. “Email address” label).

2. **GoogleOAuthProvider is instantiated**
   - Mock `@react-oauth/google`’s `GoogleOAuthProvider`.
   - Render `<App />`.
   - Assert the mock was called with `clientId` equal to `import.meta.env.VITE_GOOGLE_CLIENT_ID` (stub the env in tests).

3. **AuthProvider wraps children**
   - Mock `AuthProvider` to render a `data-testid="auth-provider"` wrapper.
   - Assert that content rendered under that wrapper actually appears (basic smoke test that routing is nested inside).

### 2.2. Routing behaviour

**Tests (using `MemoryRouter` and `initialEntries`):**

4. **Route `/login` renders Login page**
   - Render `<App />` with `MemoryRouter initialEntries={['/login']}`.
   - Assert “Email address” label and “Sign in” button are present.

5. **Route `/register` renders Register page**
   - Render `<App />` with `MemoryRouter initialEntries={['/register']}`.
   - Assert “Full name” (or the register form’s name label) and “Create account” button are present.

6. **Unknown routes redirect to `/login`**
   - Render `<App />` with `MemoryRouter initialEntries={['/unknown']}`.
   - Assert login form fields are visible.

---

## 3. Auth Context (`src/contexts/auth.context.tsx`)

**File:** `src/contexts/auth.context.tsx`  
**Components under test:** `<AuthProvider />`, `useAuth` hook.  
**External dependencies:** `axiosi`, `safeLocalStorage`, `toast`, `window.location`, `window.history`.

### 3.1. `useAuth` hook basics

**Tests:**
1. **Throws when used outside provider**
   - Call `renderHook(() => useAuth())` without wrapping in `AuthProvider`.
   - Expect it to throw `'useAuth must be used within an AuthProvider'`.

2. **Provides default shape**
   - Wrap a test component in `AuthProvider`.
   - Use `useAuth` and assert returned object has keys:
     - `user`, `login`, `register`, `googleLogin`, `logout`, `isAuthenticated`.

### 3.2. `checkAuth` and initialization

**Tests (mock `axiosi.get`, `safeLocalStorage`, and `window.location`):**

3. **No token ➜ no request & user remains null**
   - `safeLocalStorage.getItem('accessToken')` returns `null`.
   - Render `<AuthProvider>` with a child that reads `user` after effects flush.
   - Assert `axiosi.get` not called, `user` is `null`, `initialized` has become true (queried via behaviour: no redirect and `isAuthenticated` is false).

4. **Token present ➜ user is fetched and set**
   - `safeLocalStorage.getItem` returns `'token123'`.
   - `axiosi.get('/auth/me')` resolves with a fake user.
   - Assert `user` is set to that value and `isAuthenticated` is true.

5. **`/auth/me` failure clears token**
   - `safeLocalStorage.getItem` returns `'token123'`.
   - `axiosi.get` rejects; ensure `safeLocalStorage.removeItem('accessToken')` is called and `user` is `null`.

### 3.3. `?logout=true` handling

**Tests (using JSDOM’s `window.location`):**

6. **Logout query clears session and strips param**
   - Set `window.location.href` to `https://app.test/login?logout=true`.
   - Render `<AuthProvider>`.
   - Assert:
     - `safeLocalStorage.removeItem('accessToken')` called.
     - `user` is `null`.
     - `window.history.replaceState` called with a URL that does **not** contain `logout=true`.

### 3.4. Redirection when authenticated

**Tests:**

7. **User set + token present ➜ redirect to `VITE_REDIRECTION_URL` with token**
   - Mock `safeLocalStorage.getItem('accessToken')` to return `'abc'`.
   - Provide a user (via mocking `axiosi.get` or directly manipulating state in a test harness).
   - `import.meta.env.VITE_REDIRECTION_URL = 'https://dashboard.test'`.
   - Assert that `window.location.href` becomes `'https://dashboard.test?accessToken=abc'`.

8. **User null ➜ no redirect**
   - With `initialized=true` but `user=null`, assert no change to `window.location.href`.

### 3.5. `login`, `register`, `googleLogin`, `logout`

**Tests:**

9. **`login` success**
   - Mock `axiosi.post('/auth/login')` to resolve with `{accessToken, ...user}`.
   - Call `login(email, password)` via `useAuth`.
   - Assert:
     - `axiosi.post` called with correct payload.
     - `safeLocalStorage.setItem('accessToken', token)` called.
     - `user` state updated.
     - `toast.success('Successfully logged in!')` called.

10. **`login` failure**
    - Mock `axiosi.post` to reject with an error containing `response.data.message`.
    - Assert:
      - `user` stays `null`.
      - `toast.error` called with `response.data.message` or `'Login failed'`.

11. **`register` success & failure**
    - Similar pattern as login:
      - On success: token saved, user updated, `toast.success('Account created successfully!')`.
      - On failure: `toast.error` with appropriate message and **rethrows**; test that a caller can catch the error.

12. **`googleLogin` success & failure**
    - POST `/auth/google` with `{ credential: googleJwtToken }`.
    - Assert token set, user updated, `toast.success` on success.
    - On failure: `toast.error` with `'Google login failed'` or backend message.

13. **`logout` clears token & reloads**
    - Mock `window.location.reload`.
    - Call `logout()`.
    - Assert:
      - `safeLocalStorage.removeItem('accessToken')`.
      - `user` becomes `null`.
      - `window.location.reload` called once.

---

## 4. Login Page (`src/pages/login.tsx`)

**File:** `src/pages/login.tsx`  
**Component:** `<Login />`  
**Uses:** `useAuth`, `SlantedImageCarouselWrapper`, `GoogleLogin`.

### 4.1. Rendering

**Tests:**
1. **Renders email/password form**
   - Render `<Login />` with `MemoryRouter` and mocked `useAuth`.
   - Assert:
     - Email input (`label: Email address`).
     - Password input.
     - Primary “Sign in” button.
     - Link to “Create account” / register page.

2. **Shows logo**
   - Assert that logo image with `alt="Ziplofy"` is present.

### 4.2. Email/password login

**Tests:**

3. **Successful submit calls `login` with correct data**
   - Mock `useAuth` to return `login` mock and `googleLogin` mock.
   - Type into email/password, submit form.
   - Assert `login(email, password)` called exactly once.

4. **Error from `login` shows error message**
   - Make the mock `login` reject with `{response: {data: {message: 'Invalid creds'}}}`.
   - After submit, assert `'Invalid creds'` appears in the error area.

5. **Loading state disables form**
   - While `onSubmit` in flight (or by mocking `loading` state), assert:
     - “Sign in” button is disabled / shows spinner.

### 4.3. Google login

**Tests (mock `GoogleLogin` component):**

6. **Google success calls `googleLogin` with credential**
   - Mock `GoogleLogin` to call `onSuccess({ credential: 'jwt123' })`.
   - Assert `googleLogin('jwt123')` called.

7. **Missing credential shows error**
   - Mock success event with `{ credential: undefined }`.
   - Assert error message like `"Google JWT token is required"` is displayed.

8. **Google failure handler shows generic error**
   - Trigger `onError`.
   - Assert `'Google sign-in failed'` appears.

---

## 5. Register Page (`src/pages/Register.tsx`)

**File:** `src/pages/Register.tsx`  
**Component:** `<Register />`  
**Uses:** `useAuth`, `SlantedImageCarouselWrapper`, `GoogleLogin`, `toast`.

### 5.1. Rendering

**Tests:**
1. **Renders register form fields**
   - Name, email, password, confirm password inputs.
   - “Create account” button.
   - Link back to login.

### 5.2. Validation and submit

**Tests:**

2. **Password mismatch shows error and aborts**
   - Fill name, email, password, confirm password with different values.
   - Submit.
   - Assert:
     - Error `'Passwords do not match'` is displayed.
     - `register` is **not** called.

3. **Successful registration calls `register`**
   - Mock `register` to resolve.
   - Fill matching passwords, submit.
   - Assert `register(name, email, password)` called once.

4. **Registration failure shows backend error**
   - Mock `register` to reject with `{response: {data: {message: 'Email already exists'}}}`.
   - Assert error `'Email already exists'` displayed.

### 5.3. Google sign‑up

**Tests:**

5. **Google success with token calls `googleLogin`**
   - Mock `GoogleLogin` and trigger `onSuccess({ credential: 'jwt123' })`.
   - Assert `googleLogin('jwt123')` called.

6. **Google success without token shows toast error**
   - Trigger `onSuccess({ credential: undefined })`.
   - Assert `toast.error('Google JWT token is required')` called and/or UI error message.

7. **Google failure shows error**
   - Trigger `onError`.
   - Assert `'Google sign-in failed'` displayed.

---

## 6. Shared Component (`src/components/SlantedImageCarouselWrapper.tsx`)

**File:** `src/components/SlantedImageCarouselWrapper.tsx`  
**Component:** `<SlantedImageCarouselWrapper />`

### 6.1. Basic rendering

**Tests:**

1. **Renders children**
   - Render wrapper with a simple `<div data-testid="child">Content</div>`.
   - Assert `data-testid="child"` is present.

2. **Uses default images when `images` not passed**
   - Render wrapper with no `images` prop.
   - Assert at least one `<img>` is rendered.
   - Optionally check that total images equals `DEFAULT_IMAGES.length * 3` (due to duplication).

3. **Uses custom images when provided**
   - Pass `images={['url1', 'url2']}`.
   - Assert those URLs appear in `src` attributes.

4. **Column count**
   - With N images, assert there are always 6 “columns” (the outer column divs), regardless of image count.

---

## 7. Axios Config (`src/config/axios.config.ts`)

**File:** `src/config/axios.config.ts`  
**Goal:** Ensure the axios instance uses the correct base URL and headers.

**Tests:**

1. **Exports a configured Axios instance**
   - Import `axiosi`.
   - Assert `axiosi.defaults.baseURL` is set to `VITE_API_URL` (stub this env).

2. **Attaches interceptors (if defined)**
   - If request/response interceptors are present, test:
     - That outgoing requests get the auth token from `safeLocalStorage`.
     - That 401 responses clear access token, etc. (depending on implementation).

---

## 8. Types & Utilities (`src/types/*.ts`, `src/types/local-storage.ts`)

**Files:**
- `src/types/auth.ts`
- `src/types/local-storage.ts`

**Tests:**

1. **`safeLocalStorage` behaviour**
   - Wrap `localStorage` calls to ensure no exceptions in environments without real storage.
   - Assert:
     - `getItem` returns `null` on missing key.
     - `setItem`, `removeItem`, `clear` behave correctly in the stub.

2. **Type level tests (light‑weight)**
   - If using Vitest’s `tsd` integration or similar, verify that `IUser` matches server payload shape.
   - (Optional; more about type safety than runtime behaviour.)

---

## 9. Entry Point (`src/main.tsx`)

**File:** `src/main.tsx`  
**Goal:** Simple smoke test that `ReactDOM.createRoot` is called with `<App />`.

**Test (optional):**

1. **Calls `createRoot` on `#root` and renders `<App />`**
   - Mock `document.getElementById` to return a fake element.
   - Mock `ReactDOM.createRoot`.
   - Import `main.tsx`.
   - Assert `createRoot` called once and `root.render(<App />)` invoked.

---

## 10. Summary & Coverage Goals

- **Target coverage (approximate):**
  - 80%+ statements, branches, and lines for `src/` (excluding `index.html`, CSS, and environment type files).
- **Critical flows to prioritize:**
  - Auth lifecycle: login, register, Google login, logout, and redirect.
  - Routing from `/login` and `/register`.
  - Basic rendering + behaviour of `Login`, `Register`, and `SlantedImageCarouselWrapper`.
  - Axios config and `safeLocalStorage` helpers.

Once these tests are implemented, the `client` folder will have strong coverage over all core user flows (auth + routing), visual shell behaviour, and integration with backend APIs.

