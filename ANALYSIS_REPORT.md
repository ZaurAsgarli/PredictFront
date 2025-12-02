# PROJECT ANALYSIS REPORT
## Next.js + Django REST Framework Integration Issues

---

## SECTION A — PROJECT MAP

### Frontend Structure

**Pages Router (`/pages`):**
- `pages/index.js` → Uses `src/services/events.js` → Uses `src/services/api.js`
- `pages/events.js` → Uses `src/services/events.js` → Uses `src/services/api.js`
- `pages/login.js` → Uses `src/services/auth.js` → Uses `src/services/api.js`
- `pages/profile.js` → Uses `src/services/auth.js` → Uses `src/services/api.js`

**App Router (`/app`):**
- `app/admin/page.tsx` → Uses `lib/api.ts`
- `app/event/[id]/page.tsx` → Uses `lib/api.ts`

### Backend API Endpoints (Django)

**Base URL:** `http://localhost:8000`

**Actual Endpoints:**
- `/api/users/login/` (login)
- `/api/users/signup/` (signup)
- `/api/users/me/` (current user)
- `/api/markets/` (list markets)
- `/api/markets/{id}/` (market detail)
- `/api/trades/` (trades)
- `/api/admin/logs/` (security logs - ViewSet)
- `/api/admin/security-logs/` (security logs - function view)
- `/api/ml/...` (ML endpoints - if exists)

### API Service Files

**1. `src/services/api.js` (Pages Router):**
- BaseURL: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'`
- ✅ Correctly includes `/api` in baseURL
- Used by: `events.js`, `auth.js`, `predictions.js`, `leaderboard.js`

**2. `lib/api.ts` (App Router):**
- BaseURL: `process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'`
- ❌ **MISSING `/api` in fallback**
- Used by: `app/admin/page.tsx`, `app/event/[id]/page.tsx`

### Environment Configuration

**`.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
✅ Correct format

---

## SECTION B — CRITICAL ERRORS

### ERROR #1: API Base URL Mismatch in `lib/api.ts`

**File:** `lib/api.ts`  
**Line:** 3  
**Issue:** Fallback baseURL is missing `/api` prefix

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
```

**Why it breaks:**
- If `NEXT_PUBLIC_API_URL` is not loaded (SSR/build time), it falls back to `http://127.0.0.1:8000`
- Then calls like `/api/security/logs` become `http://127.0.0.1:8000/api/security/logs` ✅ (works)
- BUT: If env var is set to `http://localhost:8000/api`, it works
- **However**, the inconsistency between `localhost` vs `127.0.0.1` and missing `/api` in fallback causes confusion

**Impact:**
- Admin dashboard network errors
- Inconsistent behavior between dev/prod

---

### ERROR #2: Admin Dashboard Endpoint Mismatches

**File:** `app/admin/page.tsx`  
**Lines:** 18, 28, 37  
**Issue:** Endpoints don't match backend structure

**Frontend calls:**
- `apiEndpoints.securityLogs` → `/api/security/logs`
- `apiEndpoints.liquidityHealth` → `/api/ml/liquidity-health`
- `apiEndpoints.riskScores` → `/api/ml/risk-scores`

**Backend actual endpoints:**
- Security logs: `/api/admin/logs/` (ViewSet) OR `/api/admin/security-logs/` (function view)
- ML endpoints: Need to verify if `/api/ml/liquidity-health` exists

**Why it breaks:**
- 404 errors when endpoints don't exist
- Network errors shown in UI

---

### ERROR #3: Login Endpoint Path Issue

**File:** `src/services/auth.js`  
**Line:** 6  
**Issue:** Endpoint path is correct, but error suggests routing issue

**Frontend calls:**
- `api.post('/users/login/', ...)` 
- With baseURL `http://localhost:8000/api` → `http://localhost:8000/api/users/login/` ✅

**Backend expects:**
- `/api/users/login/` ✅ (matches)

**Why it might break:**
- Screenshot shows 404 for `/users/login/` (without `/api`)
- This suggests `NEXT_PUBLIC_API_URL` might not be loaded correctly
- OR there's a redirect/proxy issue

---

### ERROR #4: Markets Endpoint - Home Page 404

**File:** `pages/index.js`  
**Line:** 30  
**Issue:** 404 error for `/markets/` (screenshot shows Django 404)

**Frontend calls:**
- `eventsService.getAllEvents()` → `api.get('/markets/')`
- With baseURL `http://localhost:8000/api` → `http://localhost:8000/api/markets/` ✅

**Backend expects:**
- `/api/markets/` ✅ (matches)

**Why it breaks:**
- Screenshot shows 404 for `/markets/` (without `/api`)
- This suggests the API call is going to wrong URL
- Possible causes:
  1. `NEXT_PUBLIC_API_URL` not loaded (using fallback without `/api`)
  2. CORS issue causing wrong URL
  3. Server-side rendering issue

---

### ERROR #5: Events Page Shows 0 Events

**File:** `pages/events.js`  
**Line:** 22  
**Issue:** `eventsService.getAllEvents()` returns empty array

**Possible causes:**
1. API returns empty results (backend has no markets)
2. Data transformation fails silently
3. Filter logic removes all events
4. API error caught and returns `[]`

---

## SECTION C — RECOMMENDED FIX PLAN

### Priority 1: Fix API Base URL Consistency

**Step 1:** Fix `lib/api.ts` fallback to include `/api`
- Change: `'http://127.0.0.1:8000'` → `'http://localhost:8000/api'`
- Why: Ensures consistency with `src/services/api.js`

**Step 2:** Verify `.env.local` is loaded
- Check if `NEXT_PUBLIC_API_URL` is accessible in browser console
- Add debug log in `lib/api.ts` to print actual baseURL

### Priority 2: Fix Admin Dashboard Endpoints

**Step 1:** Verify backend security endpoints
- Check if `/api/admin/logs/` returns data
- Check if `/api/admin/security-logs/` exists
- Update `lib/api.ts` `apiEndpoints.securityLogs` to match backend

**Step 2:** Verify ML endpoints exist
- Check if `/api/ml/liquidity-health` exists
- If not, create mock endpoints or remove from UI

### Priority 3: Fix Home Page Markets Loading

**Step 1:** Add error logging
- Log the actual URL being called
- Log the response/error from API

**Step 2:** Verify API response format
- Check if backend returns `{results: [...]}` or `[...]`
- Ensure `transformMarketToEvent` handles all cases

### Priority 4: Fix Login 404

**Step 1:** Verify auth service baseURL
- Add console.log to see actual URL
- Check if token is being sent correctly

**Step 2:** Test with curl/Postman
- Verify backend endpoint works: `POST http://localhost:8000/api/users/login/`

---

## SECTION D — DIFF PATCHES

### PATCH 1: Fix `lib/api.ts` Base URL

```diff
--- a/lib/api.ts
+++ b/lib/api.ts
@@ -1,6 +1,6 @@
 import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
 
-const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
+const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
 
 // Retry configuration
 const MAX_RETRIES = 3;
```

**Why:** Ensures fallback includes `/api` and uses `localhost` for consistency.

---

### PATCH 2: Fix Admin Security Logs Endpoint

```diff
--- a/lib/api.ts
+++ b/lib/api.ts
@@ -112,7 +112,7 @@
   holders: (eventId: string) => `/api/holders?event_id=${eventId}`,
   
   // Security (Admin)
-  securityLogs: '/api/security/logs',
+  securityLogs: '/api/admin/logs/',
   
   // ML/Intelligence (Admin)
   liquidityHealth: '/api/ml/liquidity-health',
```

**Why:** Matches backend ViewSet endpoint `/api/admin/logs/`.

---

### PATCH 3: Add Debug Logging to `pages/index.js`

```diff
--- a/pages/index.js
+++ b/pages/index.js
@@ -23,6 +23,8 @@
       try {
         setLoading(true);
         setError("");
+        
+        console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
 
         // Try to get all events first (more reliable)
         const allEvents = await eventsService.getAllEvents();
+        console.log('Fetched events:', allEvents);
         
         // Filter active events - be more lenient with status matching
```

**Why:** Helps diagnose if API URL is loaded and what data is returned.

---

### PATCH 4: Add Error Details to `pages/index.js`

```diff
--- a/pages/index.js
+++ b/pages/index.js
@@ -44,6 +44,8 @@
       } catch (err) {
         console.error("Failed to load active markets:", err);
+        console.error("Error response:", err.response);
+        console.error("Error URL:", err.config?.url);
         const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not load active markets from backend.";
         setError(errorMsg);
```

**Why:** Shows exact URL that failed and response details.

---

### PATCH 5: Fix `src/services/api.js` to Match Backend Response Format

```diff
--- a/src/services/api.js
+++ b/src/services/api.js
@@ -29,6 +29,10 @@
 // Handle 401 errors (unauthorized) and transform responses
 api.interceptors.response.use(
   (response) => {
+    // Debug: Log response for development
+    if (process.env.NODE_ENV === 'development') {
+      console.log('API Response:', response.config.url, response.data);
+    }
     // Backend may wrap responses in {success: true, data: ...} format
     // or return paginated responses with {results: ..., count: ..., next: ..., previous: ...}
     // or return data directly
```

**Why:** Helps debug what backend actually returns.

---

## SECTION E — VALIDATION CHECKLIST

### Manual Testing Steps

#### 1. Home Page Markets
- [ ] Open browser console
- [ ] Navigate to `/`
- [ ] Check console for "API Base URL:" log
- [ ] Check console for "Fetched events:" log
- [ ] Verify "Backend Snapshot" shows correct count
- [ ] Verify markets appear in grid

**Expected:**
- Console shows: `API Base URL: http://localhost:8000/api`
- Console shows: `Fetched events: [...]` (array of events)
- Markets display in grid

**If fails:**
- Check if backend is running: `curl http://localhost:8000/api/markets/`
- Check CORS headers
- Check network tab for actual request URL

---

#### 2. Events Page
- [ ] Navigate to `/events`
- [ ] Check console for errors
- [ ] Verify events list displays
- [ ] Test search/filter functionality

**Expected:**
- Events display in grid
- Search works
- Filters work

**If fails:**
- Check if `eventsService.getAllEvents()` returns data
- Check if `transformMarketToEvent` handles all fields

---

#### 3. Login
- [ ] Navigate to `/login`
- [ ] Enter credentials
- [ ] Submit form
- [ ] Check network tab for request URL

**Expected:**
- Request goes to: `http://localhost:8000/api/users/login/`
- Response: `200 OK` with tokens
- Redirects to home or admin

**If fails:**
- Check network tab for actual URL
- Verify backend endpoint: `POST http://localhost:8000/api/users/login/`
- Check CORS settings

---

#### 4. Admin Dashboard
- [ ] Login as admin
- [ ] Navigate to `/admin`
- [ ] Check console for errors
- [ ] Verify Security Ops tab loads
- [ ] Verify Predictive Intelligence tab loads

**Expected:**
- Security logs table displays (or "No events" message)
- Liquidity forecast shows data or error message
- Risk scores show data or error message

**If fails:**
- Check network tab for failed requests
- Verify endpoints exist: 
  - `GET http://localhost:8000/api/admin/logs/`
  - `GET http://localhost:8000/api/ml/liquidity-health`
  - `GET http://localhost:8000/api/ml/risk-scores`

---

#### 5. Backend Status Check
- [ ] Run: `curl http://localhost:8000/api/markets/`
- [ ] Run: `curl http://localhost:8000/api/users/login/ -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'`
- [ ] Run: `curl http://localhost:8000/api/admin/logs/`

**Expected:**
- All endpoints return JSON (even if error)
- No 404 errors

---

## SUMMARY OF ISSUES

1. ✅ **`.env.local` is correct** - `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
2. ❌ **`lib/api.ts` fallback missing `/api`** - Needs fix
3. ❌ **Admin endpoints may not match backend** - Needs verification
4. ❌ **Login 404 suggests API URL not loaded** - Needs debugging
5. ❌ **Home page 404 suggests wrong URL** - Needs debugging
6. ⚠️ **Events page shows 0 events** - May be backend data issue or transformation issue

---

## RECOMMENDED ACTION ORDER

1. **Apply PATCH 1** (Fix `lib/api.ts` baseURL)
2. **Apply PATCH 2** (Fix admin security logs endpoint)
3. **Apply PATCH 3 & 4** (Add debugging to home page)
4. **Test home page** - Check console logs
5. **Verify backend endpoints** - Use curl/Postman
6. **Fix remaining endpoint mismatches** - Based on test results
7. **Remove debug logs** - After issues resolved

---

**DO NOT:**
- Rewrite entire files
- Change routing structure
- Modify 3D components
- Touch working pages
- Add new libraries

**ONLY:**
- Fix API URLs
- Add minimal debugging
- Fix endpoint paths
- Verify backend matches

