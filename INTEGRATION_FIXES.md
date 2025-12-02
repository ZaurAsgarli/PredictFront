# Frontend-Backend Integration Fixes

## Summary

This document outlines the minimal changes made to align the frontend (PredictFront) with the backend (PredictBack) API without changing the overall architecture.

## Changes Made

### 1. Environment Configuration

**File: `.env.local` (create if missing)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

The `src/services/api.js` already uses this environment variable correctly.

### 2. Authentication Service (`src/services/auth.js`)

**Fixes:**
- Enhanced token extraction to handle multiple response formats
- Added support for `password_confirm` field in signup (backend requires this)
- Improved error handling for wrapped responses

**Backend API:**
- `POST /api/users/login/` → Returns `{user: {...}, tokens: {access, refresh}}`
- `POST /api/users/signup/` → Expects `{username, email, password, password_confirm}` → Returns `{user: {...}, tokens: {access, refresh}}`
- `GET /api/users/me/` → Returns user object

### 3. Events Service (`src/services/events.js`)

**Fixes:**
- Enhanced `transformMarketToEvent` to handle backend MarketSerializer format
- Added fallback for missing fields (title, description, etc.)
- Improved price extraction from `prices` object or `outcome_tokens` array
- Better handling of category objects vs strings

**Backend API:**
- `GET /api/markets/` → Returns paginated list with MarketSerializer
- `GET /api/markets/{id}/` → Returns single market
- Market fields: `id`, `title`, `description`, `category`, `status`, `prices` (calculated), `outcome_tokens`, `liquidity_pool`, `ends_at`

### 4. Predictions Service (`src/services/predictions.js`)

**Fixes:**
- Aligned trade creation with backend `TradeCreateSerializer` format
- Ensured `outcome_type` is uppercase ('YES'/'NO')
- Ensured `trade_type` is lowercase ('buy'/'sell')
- Fixed `amount_staked` to be a number (not string)
- Improved response handling for wrapped success/error formats
- Enhanced `transformTradeToPrediction` to calculate confidence from `price_at_execution`

**Backend API:**
- `POST /api/trades/` → Expects `{market_id, outcome_type: 'YES'|'NO', trade_type: 'buy'|'sell', amount_staked: decimal}`
- `GET /api/users/me/trades/` → Returns user's trades
- `GET /api/trades/?market={id}` → Returns trades for a market

### 5. Profile Page (`pages/profile.js`)

**Fixes:**
- Updated to use `created_at` field (backend UserSerializer provides this)
- Removed fallback to `date_joined` (not in backend response)

## Backend API Endpoints Reference

### Authentication
- `POST /api/users/signup/` - User registration
- `POST /api/users/login/` - User login
- `GET /api/users/me/` - Get current user
- `GET /api/users/me/trades/` - Get user's trades
- `GET /api/users/me/positions/` - Get user's positions

### Markets
- `GET /api/markets/` - List markets (supports `?status=active&category=slug`)
- `GET /api/markets/{id}/` - Get market details
- `GET /api/markets/featured/` - Get featured markets
- `GET /api/markets/categories/` - Get categories

### Trades
- `POST /api/trades/` - Create trade
- `GET /api/trades/` - List trades (supports `?market={id}`)
- `GET /api/trades/{id}/` - Get trade details

### Analytics (Placeholder - returns "not implemented")
- `GET /api/analytics/global/` - Global leaderboard
- `GET /api/analytics/weekly/` - Weekly leaderboard
- `GET /api/analytics/monthly/` - Monthly leaderboard

## Testing Checklist

1. **Login Flow:**
   - [ ] Signup creates user and stores token
   - [ ] Login authenticates and stores token
   - [ ] Token is attached to subsequent requests
   - [ ] 401 errors redirect to login

2. **Events/Markets:**
   - [ ] Events page loads markets from `/api/markets/`
   - [ ] Event detail page shows market data
   - [ ] Categories filter works
   - [ ] Status filter works

3. **Predictions/Trades:**
   - [ ] Creating prediction calls `/api/trades/` with correct format
   - [ ] User predictions page shows trades from `/api/users/me/trades/`
   - [ ] Event predictions show trades filtered by market

4. **Profile:**
   - [ ] Profile page loads user data from `/api/users/me/`
   - [ ] Stats are calculated from user's trades
   - [ ] User info displays correctly

## Notes

- The analytics endpoints are placeholders in the backend. The frontend `leaderboard.js` service handles this gracefully with fallback mock data.
- All changes are minimal and focused on the service layer - no UI changes were made.
- The frontend already had good error handling - we just aligned the data formats.

