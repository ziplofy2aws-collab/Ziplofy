## Render Storefront Test Plan

This document describes a comprehensive test strategy for the `render-store` React storefront (customer‑facing store) built with Vite, React Router, multiple context providers, and Axios.

The goal is to ensure all critical user journeys (browsing, cart, checkout, auth, profile, orders, discounts) and infrastructure pieces are correctly exercised.

---

## 1. Test Infrastructure

- **Frameworks**
  - Vitest (`test` / `test:run` scripts).
  - React Testing Library + `@testing-library/jest-dom`.
  - `@testing-library/user-event` for interactions.
  - `jsdom` DOM environment.

- **Global setup (`src/test/setup.ts`)**
  - Import `@testing-library/jest-dom/vitest`.
  - Provide:
    - `IntersectionObserver` mock (for any scroll/observer features).
    - `window.scrollTo` stub.
    - LocalStorage polyfill if needed for tests using `safeLocalStorage`.
  - Optionally centralize:
    - `fetch`/`XMLHttpRequest` stubs (if any code uses direct fetch in future).

- **Vitest config (`vite.config.ts`)**
  - Already configured:
    - `environment: 'jsdom'`
    - `globals: true`
    - `setupFiles: ['./src/test/setup.ts']`
    - `css: true`

---

## 2. Application Shell & Routing (`src/App.tsx`)

**File:** `src/App.tsx`  
**Key responsibilities:**
- Wrap all storefront routes in a deep provider tree:
  - `StorefrontProvider`, `StorefrontAuthProvider`, `StorefrontProductVariantProvider`,
    `StorefrontCartProvider`, `StorefrontOrderProvider`, `CustomerAddressProvider`,
    `StorefrontCountryProvider`, `StorefrontCollectionsProvider`,
    `AmountOffOrderProvider`, `AmountOffProductProvider`, `BuyXGetYProvider`,
    `FreeShippingProvider`, `ProductOffersProvider`.
- Provide router and top‑level routes for storefront pages.
- Implement `AuthRoute` (auth‑gated routes) and `StorefrontEntry` (subdomain/store resolution guard).

### 2.1. Provider wiring & shell smoke tests

**Tests:**
1. **App renders when store is found**
   - Mock `StorefrontProvider`’s context:
     - `isStoreFront: true`, `storeFrontChecked: true`, `storeFrontMeta` with `storeId`, `name`.
   - Mock `StorefrontApp` to a simple `<div data-testid="storefront-app" />`.
   - Render `<App />` and assert `data-testid="storefront-app"` is present.

2. **Shows “Store not found” when not a storefront**
   - Mock `useStorefront` with `isStoreFront: false`, `storeFrontChecked: true`.
   - Assert “Store not found” text and explanatory message.

3. **Does not render anything until `storeFrontChecked` is true**
   - Mock `useStorefront` with `storeFrontChecked: false`.
   - Assert container has no children (null render).

### 2.2. AuthRoute behaviour

**Tests (using mocked `useStorefrontAuth`):**

4. **While loading, shows spinner screen**
   - `loading: true`, `user: null`.
   - Render `<AuthRoute><div>Inner</div></AuthRoute>`.
   - Assert the spinner element is present, `Inner` not rendered.

5. **When user present, redirects to `/`**
   - `loading: false`, `user` non‑null.
   - Render route `/auth/login` inside `<Router>` with `AuthRoute` + login page.
   - Assert location becomes `/` and login content is not rendered.

6. **When no user, renders children**
   - `loading: false`, `user: null`.
   - Assert `Inner` content is rendered inside `AuthRoute`.

### 2.3. Route mapping smoke tests

**Tests (using `MemoryRouter` or real `Router` with history push):**

7. **Route `/` renders `StorefrontApp`**
8. **Route `/products/:id` renders `StorefrontProductDetailPage`**
9. **Routes `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password` render their pages under `AuthRoute`**
10. **Route `/profile` renders `StorefrontProfilePage`**
11. **Route `/my-orders` renders `StorefrontMyOrdersPage`**
12. **Unknown routes redirect to `/`**

In these tests, shallow‑mock the page components to simple `<div>` markers to focus on App routing wiring rather than full page behaviour.

---

## 3. Shared Infrastructure

### 3.1. Axios config (`src/config/axios.config.ts`)

**File:** `src/config/axios.config.ts`  
**Responsibilities:**
- Defines `axiosi` with:
  - `baseURL: import.meta.env.VITE_API_URL`
  - `withCredentials: true`
  - Default JSON headers.
- Adds request interceptor to apply `Authorization: Bearer <token>` from `safeLocalStorage`.

**Tests (isolated with `vi.doMock`):**

1. **Creates axios instance with correct baseURL and withCredentials**
   - Stub `VITE_API_URL` env.
   - Mock `axios.create` to record its argument.
   - Import `axios.config` and assert:
     - `baseURL` equal to stubbed env.
     - `withCredentials: true`.

2. **Interceptor adds Authorization header when accessToken exists**
   - Mock `safeLocalStorage.getItem` to return `'tok123'`.
   - Capture the interceptor `fulfilled` function via the request `use` spy.
   - Call it with `{ headers: {} }` and assert:
     - `headers.Authorization === 'Bearer tok123'`.

3. **Interceptor leaves header unset when no token**
   - Same as above but `getItem` returns `null`.

### 3.2. Local storage wrapper (`src/types/local-storage.ts`)

**File:** `src/types/local-storage.ts`  
**Goal:** Type‑safe access to browser `localStorage`.

**Tests:**

4. **`safeLocalStorage` basic behaviour**
   - With a jsdom backing `localStorage`, or a simple `Map` shim:
     - `setItem` / `getItem` store/return strings.
     - `removeItem` removes entries.
     - `clear` empties storage.

5. **`typedLocalStorage` mirrors semantics**
   - Same set/get/remove tests to ensure it’s safe to adopt.

---

## 4. Contexts (Business Logic)

The following contexts drive almost all business behaviour. Each should have a focused unit test suite validating:

- Default state
- API interactions via `axiosi`
- Local side‑effects (toast, localStorage, etc.)

### 4.1. Storefront Auth (`src/contexts/storefront-auth.context.tsx`)

**Responsibilities:**
- Holds customer `user` state.
- Exposes:
  - `login`, `signup`, `logout`, `checkAuth`, and maybe `forgotPassword`, `resetPassword`.

**Tests:**

1. **`useStorefrontAuth` throws outside provider** (if hook exists).
2. **`checkAuth` with token: calls `/auth/me` and sets user**
   - Mock `safeLocalStorage.getItem('accessToken')` to return token.
   - Mock `axiosi.get('/auth/me')` to resolve with a user.
   - Assert user state and `isAuthenticated` flags.

3. **`checkAuth` without token: does not call axios and leaves user null**

4. **`login` success**
   - Posts to `/auth/login` with email/password.
   - Stores accessToken to localStorage, sets user, shows success toast.

5. **`login` failure**
   - On error, shows toast error and does not set user.

6. **`signup` success & failure**
   - Behaves similar to `login`, but for `/auth/register`.

7. **`forgotPassword` / `resetPassword`**
   - `forgotPassword`: posts email+storeId; on success, maybe shows toast.
   - `resetPassword`: posts token+newPassword+storeId; verifies error handling.

8. **`logout`**
   - Clears token from localStorage.
   - Clears user state.

### 4.2. Store context (`src/contexts/store.context.tsx`)

**Responsibilities:**
- Determines whether the current host/subdomain is mapped to a storefront.
- Exposes:
  - `storeFrontMeta`, `isStoreFront`, `storeFrontChecked`, maybe `error`.

**Tests:**

9. **On mount, resolves store metadata from API or environment**
   - Mock `axiosi` or fetch, assert:
     - `storeFrontMeta` set.
     - `isStoreFront` true.
     - `storeFrontChecked` true.

10. **Failed lookup results in non‑store state**
    - `isStoreFront` false, `storeFrontChecked` true.

### 4.3. Product & variant contexts

**Files:**
- `src/contexts/product.context.tsx`
- `src/contexts/product-variant.context.tsx`

**Tests (per context):**

11. **`useStorefrontProducts` – fetch by store ID**
    - `fetchProductsByStoreId({ storeId, page, limit })`:
      - Calls expected API endpoint with query params.
      - Updates `products`, `pagination`, `loading` flags.

12. **Product detail fetching**
    - `fetchProductById(id)` sets `productDetail` and `productDetailLoading`.

13. **`useStorefrontProductVariants` – fetch variants**
    - `fetchVariantsByProductId(productId)`:
      - Returns variants array.
      - Marks `loading` states accordingly.

### 4.4. Cart context (`src/contexts/storefront-cart.context.tsx`)

**Tests:**

14. **`getCartByCustomerId` fetches and sets cart**
15. **`createCartEntry` posts to API and updates local cart**
16. **Error handling (e.g. shows toast, keeps consistent state)**

### 4.5. Orders & addresses

**Files:**
- `src/contexts/storefront-order.context.tsx`
- `src/contexts/customer-address-storefront.context.tsx`

**Tests:**

17. **Orders:**
    - `getOrdersByCustomerId` populates `orders`, handles `loading` and `error`.
    - `createOrder` posts payload and returns created order.

18. **Addresses:**
    - `fetchCustomerAddressesByCustomerId`.
    - `addCustomerAddress`, `updateCustomerAddress`, `deleteCustomerAddress`.
    - Ensure minimal shape and API paths are correct.

### 4.6. Collections & discounts

**Files:**
- `src/contexts/storefront-collections.context.tsx`
- `src/contexts/amount-off-order.context.tsx`
- `src/contexts/amount-off-product.context.tsx`
- `src/contexts/storefront-free-shipping.context.tsx`
- `src/contexts/buy-x-get-y.context.tsx`
- `src/contexts/product-offers.context.tsx`

**Tests (per file, focusing on API wiring & combination logic):**

19. **Collections:**
    - `fetchCollectionsByStoreId(storeId)` populates `collections`.
    - `fetchProductsInCollection(collectionId)` sets `products`.

20. **Amount‑off order/product, free shipping, BxGy:**
    - Each context should:
      - Load offers via correct endpoints.
      - Expose normalized offer structures.
      - Potentially have helper functions to compute eligibility; test those if present.

---

## 5. Components

### 5.1. `SlantedImageCarouselWrapper` (`src/components/SlantedImageCarouselWrapper.tsx`)

**Tests:**

1. **Renders children in foreground container**
2. **With default images (no `images` prop)**
   - Renders at least one `<img>`.
3. **With custom `images` prop**
   - Uses provided URLs in column layout.
4. **Column duplication logic**
   - When `images.length = N`, `useMemo` duplicates arrays `3x`, so total `<img>` count is `N * 3`.
5. **Keyframe CSS injected**
   - Style element contains `@keyframes scrollUp` and `scrollDown`.

### 5.2. `StorefrontNavbar` (`src/components/StorefrontNavbar.tsx`)

**Tests (with mocked contexts):**

6. **Shows store name or logo**
7. **Search bar visible when `showSearch` true**
   - Calling `onSearchChange` updates value.
8. **Cart icon shows item count (if present)**
9. **Auth controls:**
   - When no user → shows “Sign in / Sign up”.
   - When user present → shows user menu (profile, orders, logout).

### 5.3. `CartDrawer` (`src/components/CartDrawer.tsx`) 

This is complex; focus on UI state + integration points, mocking all contexts.

**Tests:**

10. **Renders with items from cart context**
11. **Displays discounts from contexts:**
    - Amount‑off‑order, amount‑off‑product, BxGy, free shipping.
12. **Proceed to checkout / place order triggers `createOrder` when appropriate**
13. **Empty state: shows appropriate “Your cart is empty” message**

### 5.4. `AuthPopup` (`src/components/AuthPopup.tsx`)

**Tests:**

14. **When `open` true, shows login/register prompts**
15. **Close button or overlay click calls `onClose`**

### 5.5. `ScrollToTop` (`src/components/ScrollToTop.tsx`)

**Tests:**

16. **On route change, calls `window.scrollTo({ top: 0, left: 0, behavior: 'smooth' | 'auto' })`**
    - Mock `useLocation` to change `pathname`, assert `scrollTo` call.

### 5.6. `WaveDivider` (`src/components/WaveDivider.tsx`)

**Tests:**

17. **Renders SVG path**
18. **Accepts props (e.g., `className`) and applies them to root element**

---

## 6. Pages

For each page, we focus on high‑level behaviour with contexts mocked to stable values.

### 6.1. `StorefrontApp` (`src/pages/StorefrontApp.tsx`)

**Tests (with mocked contexts):**

1. **Displays store name and description in hero**
2. **Renders stats (“Happy Customers”, “Products”, “Support”)**
3. **Search filter reduces product cards**
4. **Order discount banner**
   - When `orderDiscount` present, banner shows correct text based on:
     - `valueType` (`fixed-amount` vs `percentage`).
     - `minimumPurchase` (amount vs quantity).
5. **“Shop Now” scrolls to products section** (can assert call to `scrollIntoView` or presence of anchor ID).
6. **Collections section:**
   - Loads collections from context and shows titles.
7. **Product cards:**
   - Clicking a card navigates to `/products/:id`.
   - Clicking “Add to Cart” invokes `createCartEntry` using `fetchVariantsByProductId` result (variants logic: choose real vs synthetic).
8. **Logout flow:**
   - When user present and `confirmLogoutOpen` is triggered, clicking logout button calls `logout` and closes modal.

### 6.2. `StorefrontLoginPage` (`src/pages/StorefrontLoginPage.tsx`)

**Tests:**

9. **Renders email/password form and buttons**
10. **Submits form calls `login` from `useStorefrontAuth` with trimmed email/password and storeId from `useStorefront`**
11. **Shows error message when backend rejects login**
12. **“Forgot password” link navigates to `/auth/forgot-password`**
13. **“Sign up” link navigates to `/auth/signup`**

### 6.3. `StorefrontSignupPage` (`src/pages/StorefrontSignupPage.tsx`)

**Tests:**

14. **Renders form fields (first name, last name, email, password, terms checkbox)**
15. **Create account disabled until terms checkbox is checked**
16. **On submit with valid data and terms checked, calls `signup` with:
    - `storeId` from store context
    - name/email/password from form**
17. **Passwords shorter than minimum show helper text but still rely on API (if no local validation), or if local validation present, show error and do not call `signup`.**

### 6.4. `StorefrontForgotPasswordPage` (`src/pages/StorefrontForgotPasswordPage.tsx`)

**Tests:**

18. **Renders email input and “Send reset link” button**
19. **Empty email shows local error message, does not call `forgotPassword`**
20. **Valid email calls `forgotPassword({ email, storeId })`**
21. **On success, shows success state (e.g., “Check your email” message)**

### 6.5. `StorefrontResetPasswordPage` (`src/pages/StorefrontResetPasswordPage.tsx`)

**Tests:**

22. **Without `reset-token` query, shows “Validating reset token...” and redirects or stays in loading state (depending on implementation)**  
23. **With `reset-token` query, renders reset password form**
24. **Submitting:
    - Empty password → “Password is required”
    - Password < 6 chars → “Password must be at least 6 characters long”
    - Mismatched confirm → “Passwords do not match”
    - Missing token or missing storeId → appropriate error message**
25. **Valid form calls `resetPassword({ token, newPassword, storeId })`**

### 6.6. `StorefrontProfilePage` (`src/pages/StorefrontProfilePage.tsx`)

**Tests (mock `useStorefrontAuth`, `useCustomerAddresses`, `useStorefrontCountries`):**

26. **Displays user name & email from auth context**
27. **Has tabs (“My Profile”, “Addresses”, “Preferences”) and switching tabs changes content**
28. **Addresses tab:**
    - Renders address list from context.
    - “Add Address” button invokes `addCustomerAddress`.
    - Edit/delete actions call correct context methods.

### 6.7. `StorefrontMyOrdersPage` (`src/pages/StorefrontMyOrdersPage.tsx`)

**Tests (mock `useStorefrontAuth`, `useStorefrontOrder`):**

29. **When not logged in, shows “Please Login” prompt and button that navigates to `/auth/login`**
30. **When logged in, shows order stats (Total orders, Delivered)**
31. **Filter tabs (All, Pending, Shipped, Delivered) filter `orders` list**
32. **Clicking an order in list selects it and populates detail pane**
33. **Order progress bar reflects `status` correctly (pending, paid, shipped, delivered, cancelled)**

### 6.8. `StorefrontProductDetailPage` (`src/pages/StorefrontProductDetailPage.tsx`)

**Tests (mock all contexts):**

34. **Loads product detail for given `:id` and displays title, price**
35. **Shows at least one variant and allows selecting variant (if UI supports)**
36. **“Add to Cart” / “Buy Now” button calls `createCartEntry` / order creation with correct variant ID**
37. **Discount panels show applicable order and product offers (from `ProductOffersProvider`)**

### 6.9. `StorefrontCollectionPage` (`src/pages/StorefrontCollectionPage.tsx`)

**Tests:**

38. **Loads collection by `collectionId` & `urlHandle` and displays collection title**
39. **Renders products within that collection**
40. **Add‑to‑cart from collection page uses same variant selection behaviour as `StorefrontApp`**

### 6.10. `StorefrontCartPage` (`src/pages/StorefrontCartPage.tsx`)

**Tests:**

41. **Renders `CartDrawer` in page context**
42. **For mobile routes, acts as a full‑screen cart view (layout smoke test).**

---

## 7. Test Coverage Goals & Priorities

- **Priority 1 (critical flows):**
  - Auth context (`storefront-auth`).
  - Cart & orders contexts.
  - `StorefrontApp`, `StorefrontProductDetailPage`, `StorefrontMyOrdersPage`.
  - Password reset flow (`Forgot` + `Reset`).

- **Priority 2 (supporting flows):**
  - Collections context and page.
  - Profile page (addresses + preferences).
  - All discount / shipping contexts.

- **Target coverage:**
  - Aim for **80%+** statements/branches/lines for `src/` (excluding purely presentational SVGs/CSS‑only components).

Implementing this plan will provide strong, behaviour‑focused coverage for the entire `render-store` storefront: from store resolution and routing, through catalog browsing, cart/discounts, checkout, and customer account management. Once these tests are in place, further refinements can add more nuanced UI regression checks (e.g. snapshots, complex layouts) as needed.

