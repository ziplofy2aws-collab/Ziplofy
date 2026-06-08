## Server Test Plan

This document describes a comprehensive test strategy for the `server` folder (Express + TypeScript + Mongoose API).

The goals:
- Ensure environment/config, auth, and default bootstrap flows are reliable.
- Protect all public API behavior and key invariants (one store per user, default settings/market, error model).
- Make refactors safe (especially around auth and store/market initialization).

---

## 1. Test Infrastructure

- **Frameworks**
  - Vitest (`npm test` / `vitest`, Node environment).
  - `supertest` for HTTP-level tests against the Express app.

- **Configuration**
  - `vitest.config.ts`:
    - `test.environment: 'node'`.
    - `globals: true`.
    - `include: ['src/**/*.test.ts']`.
    - `setupFiles: ['src/test/setup.ts']`.
    - Path alias `@` → `./src`.

- **Setup**
  - `src/test/setup.ts`:
    - Sets sane defaults for required env vars (`PORT`, `MONGO_URI`, token secrets, `CLIENT_URL`, `GOOGLE_CLIENT_ID`).
    - Ensures tests do not accidentally call `process.exit()` by:
      - Stubbing `process.exit` where necessary, or
      - Importing modules in a controlled order (see env tests).

**Tests to ensure infra is solid**
1. **Vitest + env setup smoke**
   - Import `app` in a test and assert `app` is defined.
   - Ensures setup file runs without throwing.

---

## 2. App Shell & Startup (`src/app.ts`, `src/index.ts`)

### 2.1 Express app behavior (`app.ts`)

**Responsibilities**
- Configure JSON, URL-encoded, cookies, and CORS.
- Expose `GET /api/health` and mount `/api/auth`.
- Attach `errorMiddleware` as the last handler.

**Tests**
1. **Health endpoint returns OK**
   - Use `supertest(app).get('/api/health')`.
   - Assert:
     - `status === 200`.
     - `body.status === 'ok -updated'`.
     - `body.timestamp` is a valid ISO string.
     - `body.uptime` is a number.

2. **CORS is configured with allowed origins**
   - Spy on `cors` or spin up the app and inspect response headers for a request with `Origin: http://localhost:3000`.
   - Assert `Access-Control-Allow-Origin` matches dev origin.

3. **Unknown routes fall through to error middleware gracefully**
   - Optional: `supertest(app).get('/api/unknown')`.
   - Expect a 404-style error shape if such behavior is defined (or validate current behavior).

### 2.2 Startup & env validation (`index.ts`, `utils/env.utils.ts`, `config/database.config.ts`)

**Tests**
4. **`validateEnv` succeeds with all required vars**
   - Set `process.env` with all required keys.
   - `expect(() => validateEnv()).not.toThrow()`.

5. **`validateEnv` fails with missing required var**
   - Remove e.g. `ACCESS_TOKEN_SECRET` from `process.env`.
   - Expect thrown error message mentioning missing variable.

6. **`connectDB` logs and exits on connection failure**
   - Mock `mongoose.connect` to reject.
   - Spy on `console.error` and `process.exit`.
   - Assert `connectDB()` calls `process.exit(1)`.

7. **`index.ts` wires validateEnv → connectDB → listen**
   - Use `vi.doMock` to stub:
     - `validateEnv` (spy).
     - `connectDB` (spy).
     - `app.listen` (spy).
   - Import `index.ts`.
   - Assert that:
     - `validateEnv` called before `connectDB`.
     - `app.listen` called with `PORT`.

---

## 3. Error Handling (`utils/error.utils.ts`, `middleware/error.middleware.ts`)

### 3.1 `CustomError` and `asyncErrorHandler`

**Tests**
8. **`CustomError` preserves message and statusCode**
   - `new CustomError('Bad', 400)` and assert fields.

9. **`asyncErrorHandler` forwards thrown errors**
   - Wrap an async handler that throws `new CustomError('E', 418)`.
   - Call it with fake `req`, `res`, `next`.
   - Assert `next` called with the error.

### 3.2 `errorMiddleware` normalization

**Tests**
10. **Handles `CustomError`**
    - Pass `new CustomError('Bad', 400)` to `errorMiddleware`.
    - Assert JSON `{ success: false, error: 'Bad' }` with status 400.

11. **Mongoose CastError → 404**
    - Create an object mimicking `CastError` (`name: 'CastError'`, `kind: 'ObjectId'`).
    - Assert status 404 and friendly message.

12. **Duplicate key error → 400 with field info**
    - Error object `{ code: 11000, keyValue: { email: 'a@b.com' } }`.
    - Assert status 400 and message mentions `email`.

13. **ValidationError → 400 with concatenated messages**
    - Mongoose-like `name: 'ValidationError', errors: { field1: { message: 'msg1' }, field2: { message: 'msg2' } }`.
    - Assert combined message includes both.

14. **JWT errors → 401**
    - For each `JsonWebTokenError`, `TokenExpiredError`, `NotBeforeError`, assert 401 and appropriate error text.

15. **Invalid JSON payload**
    - Simulate body-parser error with `type === 'entity.parse.failed'`.
    - Assert 400 `"Invalid JSON payload."`.

16. **Mongo network error → 503**
    - Error with `name: 'MongoNetworkError'`.
    - Assert 503 with `"Database connection error."`.

17. **Missing env var error surfaced**
    - Error whose message includes `"not defined in environment variables"`.
    - Assert 500 with that message preserved.

---

## 4. Auth Module (Routes, Controller, Middleware, Types)

### 4.1 Auth controller (`auth.controller.ts`)

**Tests**
18. **`signAccessToken` encodes correct payload**
    - Provide a fake `user` with `_id`, `email`.
    - Decode JWT and assert payload `{ uid, email, role: 'client' }`.

19. **`register` success creates user and default resources**
    - Mock `User.findOne` → `null`.
    - Mock `bcrypt.hash`.
    - Mock `User.create` to return a fake user.
    - Mock `createDefaultResourcesForNewUser`.
    - Call controller via unit test using `asyncErrorHandler` or via route with `supertest`.
    - Assert:
      - Status 201.
      - Response contains `accessToken` and user info.
      - `createDefaultResourcesForNewUser` called with user.

20. **`register` rejects duplicate email**
    - `User.findOne` returns an existing user.
    - Assert 400 with `"User already exists"` via HTTP route test.

21. **`login` success**
    - `User.findOne` returns user with `hashedPassword`.
    - Mock `bcrypt.compare` → true.
    - Assert 200, response includes `accessToken` and correct user fields.

22. **`login` with invalid credentials**
    - Case 1: `User.findOne` returns `null`.
    - Case 2: `bcrypt.compare` → false.
    - Assert 400 with `"Invalid credentials"`.

23. **`googleAuth` – missing credential**
    - Send request with no `credential`.
    - Assert 400/401 error (match current implementation).

24. **`googleAuth` – existing user logs in**
    - Mock `OAuth2Client.verifyIdToken` to return payload with an existing email.
    - `User.findOne` finds user.
    - Assert 200, no new user created.

25. **`googleAuth` – new user created and default resources invoked**
    - `User.findOne` returns null.
    - `User.create` returns new user.
    - `createDefaultResourcesForNewUser` mocked and asserted called.

### 4.2 Auth routes (`auth.route.ts`)

Prefer **HTTP-level tests with `supertest`** (some already exist; extend as needed).

**Tests**
26. **`POST /api/auth/register` smoke**
    - Happy path using the mocks above.

27. **`POST /api/auth/login` smoke**
    - Happy path using hashed password.

28. **`POST /api/auth/google` smoke**
    - Happy path using mocked Google client.

29. **`GET /api/auth/me`**
    - Case 1: No token: expect 401.
    - Case 2: Valid token produced by login (or manual `signAccessToken`), expect 200 and user info.

### 4.3 Auth middleware (`auth-middleware.ts`)

**Tests**
30. **Missing Authorization header**
    - Call `protect` with req lacking `Authorization`.
    - Assert `next` receives `CustomError('Authorization required', 401)`.

31. **Malformed Bearer token**
    - `Authorization` header not in `Bearer <token>` format.
    - Assert next with 401.

32. **Invalid JWT**
    - Mock `jwt.verify` to throw `JsonWebTokenError`.
    - Assert error passes to `errorMiddleware` and yields 401.

33. **User not found**
    - `jwt.verify` returns `{ uid }`, `User.findById` returns null.
    - Expect 401 `"User not found"`.

34. **Valid token attaches `req.user` correctly**
    - `jwt.verify` returns `{ uid }`.
    - `User.findById` returns user with `_id`, `email`, `name`, optional `assignedSupportDeveloperId`.
    - Assert `req.user` matches `SecureUserInfo` (role, id, email, name, assignedSupportDeveloperId, accessToken).

---

## 5. Store, Location, and Subdomain (`store.ts`, `location.model.ts`, `store-subdomain.ts`, `store.utils.ts`)

### 5.1 Models

**Tests**
35. **Store enforces 1-per-user**
    - Using Mongoose in-memory or mocking, assert unique index on `userId` (test via attempting 2nd create and expecting duplicate key error).

36. **Location default flags**
    - When created via `createDefaultStore`, assert `isDefault`, `isFulfillmentAllowed`, `isActive` have expected values.

37. **StoreSubdomain uniqueness**
    - Attempt to create two subdomains for same `storeId`: expect duplicate key error.

### 5.2 Store utils (`createDefaultStore`, `createDefaultResourcesForNewUser`)

**Tests**
38. **`createDefaultStore` creates store + default location**
    - Mock `Store.create` / `LocationModel.create`.
    - Assert:
      - `storeName` formatted from user name/email.
      - Location fields match canned defaults.
      - `defaultLocation` is set.

39. **`createDefaultResourcesForNewUser` orchestrates all side effects**
    - Mock:
      - `createDefaultStore`.
      - `GeneralSettings.create`.
      - `NotificationSettings.create`.
      - `createDefaultMarket`.
      - `StoreSubdomain.create`.
    - Assert:
      - Each is called with correct arguments.
      - Generated subdomain slug matches expected pattern (lowercased, non-alphanumerics replaced with `-`, random suffix appended).

40. **Partial failure logging**
    - Optionally mock one of the later calls (e.g., `NotificationSettings.create`) to throw.
    - Ensure earlier calls still occur and the error is propagated (or logged) according to current behavior.

---

## 6. Market & Settings (`market.ts`, `market-includes.ts`, `market-settings.ts`, `market.utils.ts`)

### 6.1 Models

**Tests**
41. **Market handle uniqueness**
    - Assert duplicate `handle` yields duplicate key error.

42. **MarketIncludes composite uniqueness**
    - Attempts to create duplicate `(marketId, countryId)` should fail.

43. **MarketSettings one-per-market**
    - Duplicate `marketId` in MarketSettings should fail.

### 6.2 `createDefaultMarket`

**Tests**
44. **Happy path with seeded `countries` & `currencies`**
    - Mock `Market.create`, `MarketIncludes.findOneAndUpdate`, `MarketSettings.findOneAndUpdate`, `Country.findOne`, `Currency.findOne`.
    - Assert:
      - Market created with `name: 'India'`, `handle` pattern `in-<last6OfStoreId>`.
      - `MarketIncludes` upsert called with `IN` country.
      - `MarketSettings` upsert called with:
        - `locale: 'en-IN'`, `languageCode: 'en'`, `countryCode: 'IN'`, `subfolder: '/en-IN'`, `isPrimary: true`.

45. **Missing country/INR currency logs warning but does not throw**
    - Mock `Country.findOne` and/or `Currency.findOne` → null.
    - Spy on `console.warn`.
    - Assert:
      - Function resolves (no throw).
      - `console.warn` called with message mentioning missing entity.

---

## 7. General & Notification Settings (`general-settings.model.ts`, `notification-settings.model.ts`)

**Tests**
46. **GeneralSettings defaults**
    - When created without overrides, assert:
      - `backupRegion === 'India'` (or current default).
      - `unitSystem`, `timeZone`, `weightUnit` match defaults.

47. **NotificationSettings defaults**
    - New record: `isEmailVerified === false`.

48. **Unique per store**
    - Attempt to create two `GeneralSettings` or two `NotificationSettings` for same `storeId` and assert duplicate key error.

---

## 8. Types & Env Typings (`types/env.d.ts`, `types/index.ts`)

**Tests**
49. **Type-level tests (optional)**
    - Compile-time only: ensure `process.env` can access required keys without `as string` casts.
    - Ensure `Express.Request.user` is available in middleware code.

---

## 9. Regression & Integration Scenarios

These are higher-level flows that stitch together multiple modules.

**Tests**
50. **Full register → login → me flow (HTTP)**
    - Use `supertest(app)`:
      - `POST /api/auth/register` with valid body.
      - `POST /api/auth/login` with same credentials.
      - Extract `accessToken`.
      - `GET /api/auth/me` with `Authorization: Bearer <token>`.
      - Assert consistent user data across all three steps.

51. **New user gets default store + subdomain (integration level)**
    - With an in-memory Mongo or well-mocked models:
      - Register user.
      - Query `Store`, `Location`, `GeneralSettings`, `NotificationSettings`, `Market`, `StoreSubdomain` for that user/store.
      - Assert exactly one of each exists and matches expected default values.

52. **Error path end-to-end**
    - Hit `POST /api/auth/login` with unknown email.
    - Assert:
      - Response is 400.
      - Shape: `{ success: false, error: 'Invalid credentials' }`.
      - Confirms controller + error middleware integration.

---

## 10. Priorities / Next Steps

1. **Solidify existing tests**: ensure all currently present tests pass and map them to this plan.
2. **Fill critical gaps first**:
   - Additional `createDefaultResourcesForNewUser` coverage.
   - Additional `createDefaultMarket` edge cases.
   - More explicit tests around `auth-middleware` and JWT payload coupling.
3. **Then cover remaining items** as needed, focusing on:
   - Unique index behaviors (to prevent data inconsistencies).
   - Error normalization for new failure modes as features are added.

