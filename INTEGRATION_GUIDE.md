# PredictHub Backend Integration Guide

This document describes how the frontend has been integrated with the `predicthub_backend` Django REST API.

## Overview

The frontend has been successfully integrated with the Django backend located at `../First-Django-backend/predicthub_backend/`. All API endpoints have been updated to match the backend's URL structure and data formats.

## API Configuration

### Base URL
- **Default**: `http://localhost:8000/api`
- **Configuration**: Set via `NEXT_PUBLIC_API_URL` environment variable in `.env.local`
- **Note**: The `/api` prefix is now included in the base URL

### Authentication
The backend uses JWT tokens with the following structure:
```json
{
  "user": { ... },
  "tokens": {
    "access": "...",
    "refresh": "..."
  }
}
```

## Updated Endpoints

### Authentication (`/api/users/`)
- **Login**: `POST /api/users/login/`
- **Signup**: `POST /api/users/signup/`
- **Get Current User**: `GET /api/users/me/`
- **Get User Trades**: `GET /api/users/me/trades/`
- **Get User Positions**: `GET /api/users/me/positions/`

### Markets (`/api/markets/`)
- **List Markets**: `GET /api/markets/`
- **Get Market**: `GET /api/markets/{id}/`
- **Create Market**: `POST /api/markets/create/`

### Trades (`/api/trades/`)
- **Create Trade**: `POST /api/trades/`
- **List Trades**: `GET /api/trades/`
- **Get Trade**: `GET /api/trades/{id}/`
- **Filter by Market**: `GET /api/trades/?market_id={id}`

### Analytics/Leaderboard (`/api/analytics/`)
- **Global Leaderboard**: `GET /api/analytics/global/`
- **Weekly Leaderboard**: `GET /api/analytics/weekly/`
- **Monthly Leaderboard**: `GET /api/analytics/monthly/`
- **User Rank**: `GET /api/analytics/user/{user_id}/`

## Data Format Changes

### Markets (Events)
The backend uses binary markets (YES/NO) instead of multi-option markets:
- Markets have `outcome_tokens` with `outcome_type` of 'YES' or 'NO'
- Prices are calculated using AMM (Automated Market Maker) logic
- Market structure includes:
  - `title`, `description`, `category`, `status`
  - `ends_at` (instead of `end_date`)
  - `outcome_tokens` array with YES/NO tokens
  - `prices` object with `yes_price` and `no_price`

### Trades (Predictions)
Trades require:
- `market_id`: Integer ID of the market
- `outcome_type`: 'YES' or 'NO' (not option IDs)
- `trade_type`: 'buy' or 'sell'
- `amount_staked`: Decimal amount

The frontend prediction form has been updated to map form data to this format.

### Leaderboard
The leaderboard returns user rankings with:
- `rank`: User's rank
- `user`: User information
- `total_pnl`: Total profit and loss
- Additional statistics

## Service Updates

### Auth Service (`src/services/auth.js`)
- Updated endpoints to use `/api/users/` prefix
- Added `getCurrentUserSync()` for synchronous user access
- `getCurrentUser()` is now async and fetches from API
- Token handling remains the same (stored in localStorage)

### Events Service (`src/services/events.js`)
- Updated to use `/api/markets/` endpoints
- Handles paginated responses (`results` array)
- Categories are extracted from markets (no separate endpoint)

### Predictions Service (`src/services/predictions.js`)
- Updated to use `/api/trades/` endpoints
- Maps frontend form data to backend trade format
- Handles outcome mapping (option IDs → YES/NO)
- Uses `/api/users/me/trades/` for user predictions
- Uses `/api/users/me/positions/` for statistics

### Leaderboard Service (`src/services/leaderboard.js`)
- Updated to use `/api/analytics/` endpoints
- All leaderboard endpoints now under `/api/analytics/`

## Component Updates

All components that use `authService.getCurrentUser()` have been updated:
- `src/components/Navbar.jsx` → uses `getCurrentUserSync()`
- `pages/profile.js` → uses `getCurrentUserSync()`
- `pages/predictions.js` → uses `getCurrentUserSync()`
- `pages/leaderboard.js` → uses `getCurrentUserSync()`
- `pages/admin.js` → uses `getCurrentUserSync()`

## Environment Setup

1. Create `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

2. Ensure the Django backend is running:
```bash
cd ../First-Django-backend/predicthub_backend
python manage.py runserver
```

3. Start the Next.js frontend:
```bash
npm run dev
```

## CORS Configuration

Make sure the Django backend has CORS configured to allow requests from the frontend. The backend should have `corsheaders` middleware enabled and configured in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## Testing the Integration

1. **Authentication**:
   - Sign up a new user at `/signup`
   - Log in at `/login`
   - Verify token is stored in localStorage

2. **Markets**:
   - Browse markets at `/events`
   - View market details at `/events/{id}`
   - Verify market data displays correctly

3. **Predictions**:
   - Create a prediction on a market
   - View your predictions at `/predictions`
   - Verify trades are created in the backend

4. **Leaderboard**:
   - View leaderboard at `/leaderboard`
   - Switch between global/weekly/monthly views
   - Verify rankings display correctly

## Known Limitations

1. **Binary Markets Only**: The backend only supports YES/NO markets, not multi-option markets. The frontend form may need additional updates to better reflect this.

2. **Outcome Mapping**: The prediction form currently uses option IDs, but the backend expects 'YES' or 'NO'. The service handles basic mapping, but you may need to update the form UI to explicitly show YES/NO options.

3. **Market Options**: The frontend expects an `options` array on events, but the backend provides `outcome_tokens`. The frontend may need to transform `outcome_tokens` into an `options` format for display.

## Next Steps

1. Update the event detail page to properly display YES/NO options from `outcome_tokens`
2. Update the prediction form to explicitly show YES/NO choices
3. Add proper error handling for API failures
4. Add loading states for async operations
5. Consider adding token refresh logic for long sessions

