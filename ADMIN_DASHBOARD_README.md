# Super Admin Dashboard

## Overview

A production-grade Super Admin Dashboard for a Polymarket-style prediction market platform. Built with Next.js 14, Tailwind CSS, Framer Motion, and React.

## Features

### 1. Admin Layout with Role-Based Protection
- **Location**: `app/admin/layout.tsx`
- Role-based access control (admin-only)
- Animated sidebar with navigation
- Real-time authentication checks
- Auto-redirect for unauthorized users

### 2. Real-Time Metrics Dashboard
- **Active Markets**: Live count with trend indicators
- **Total Liquidity**: Currency-formatted with change tracking
- **Daily Volume**: Real-time volume tracking
- **Active Users**: 24h and 7d metrics
- **Failed Transactions**: Error monitoring
- **API Health Status**: Latency and status monitoring

### 3. Market Management
- **Location**: `components/admin/MarketManagementTable.tsx`
- Full market listing with status indicators
- Actions:
  - Pause/Resume markets
  - Force close with confirmation
  - Manual resolution with evidence
  - Flag suspicious markets
- Real-time updates via SWR
- Animated table rows with Framer Motion

### 4. Risk & Fraud Monitoring
- **Location**: `components/admin/RiskMonitoringPanel.tsx`
- **Suspicious Users List**: ML-detected fraud patterns
- **Large Stake Alerts**: Transactions requiring review
- **Wash Trading Detection**: Pattern recognition
- **Risk Score Visualization**: Heatmap with progress bars
- Color-coded risk levels (High/Medium/Low)

### 5. User Management
- **Location**: `components/admin/UserManagementPanel.tsx`
- User list with comprehensive stats:
  - Total stake
  - PnL (Profit & Loss)
  - Win rate
  - Account status
- Actions:
  - Soft ban (temporary, with duration)
  - Hard ban (permanent)
  - Freeze withdrawals
- Modal confirmations for destructive actions

### 6. Resolution Center
- **Location**: `components/admin/ResolutionCenter.tsx`
- Pending market resolutions
- Evidence link management
- Manual override with confirmation modal
- Immutable audit trail

### 7. Audit Logs
- **Location**: `components/admin/AuditLogsPanel.tsx`
- Complete history of all admin actions
- Filterable by:
  - Action type
  - User ID
  - Date range
- Immutable records (cannot be modified)
- IP address tracking
- Action categorization with icons

### 8. Predictive Intelligence
- **Location**: `components/admin/PredictiveIntelligence.tsx`
- **Probability Drift Charts**: Track probability changes over time
- **Liquidity Flow Graphs**: Inflow/outflow analysis
- **Market Imbalance Heatmap**: Visual representation of market imbalances
- Real-time data updates

### 9. Framer Motion Animations
- Metric count animations
- Table row transitions
- Alert highlights
- Sidebar slide animations
- Modal entrance/exit animations
- Subtle, meaningful animations only

### 10. Real-Time Updates
- **WebSocket Support**: `hooks/useWebSocket.ts`
- Real-time metric updates
- Live alert notifications
- Connection status indicator
- Auto-reconnect on disconnect

## File Structure

```
app/
  admin/
    layout.tsx          # Admin layout with role protection
    page.tsx            # Main dashboard page

components/
  admin/
    MetricCard.tsx              # Reusable metric card component
    SkeletonLoader.tsx          # Loading skeletons
    MarketManagementTable.tsx   # Market management
    RiskMonitoringPanel.tsx     # Risk & fraud monitoring
    UserManagementPanel.tsx      # User management
    ResolutionCenter.tsx         # Resolution management
    AuditLogsPanel.tsx          # Audit logs
    PredictiveIntelligence.tsx   # Intelligence charts

src/
  admin/
    services/
      adminApiExtended.js       # Extended admin API methods

hooks/
  useWebSocket.ts               # WebSocket hook for real-time updates
```

## API Endpoints Required

The dashboard expects the following backend endpoints:

### Metrics
- `GET /admin/metrics/` - Dashboard metrics

### Markets
- `GET /markets/` - List markets
- `POST /admin/markets/{id}/pause/` - Pause market
- `POST /admin/markets/{id}/resume/` - Resume market
- `POST /admin/markets/{id}/force-close/` - Force close
- `POST /admin/markets/{id}/manual-resolve/` - Manual resolve
- `POST /admin/markets/{id}/flag/` - Flag market

### Users
- `GET /admin/users/` - List users
- `GET /admin/users/{id}/` - User details
- `POST /admin/users/{id}/soft-ban/` - Soft ban
- `POST /admin/users/{id}/hard-ban/` - Hard ban
- `POST /admin/users/{id}/freeze-withdrawals/` - Freeze withdrawals

### Risk & Fraud
- `GET /admin/risk/suspicious-users/` - Suspicious users
- `GET /admin/risk/large-stakes/` - Large stake alerts
- `GET /admin/risk/wash-trading/` - Wash trading detections
- `GET /ml/risk-scores` - Risk scores

### Resolutions
- `GET /admin/resolutions/pending/` - Pending resolutions
- `POST /admin/resolutions/{id}/override/` - Manual override

### Audit Logs
- `GET /admin/audit-logs/` - Audit logs with filters

### Intelligence
- `GET /admin/intelligence/probability-drift/{marketId}/` - Probability drift
- `GET /admin/intelligence/liquidity-flow/{marketId}/` - Liquidity flow
- `GET /admin/intelligence/market-imbalance/` - Market imbalance

### Health
- `GET /admin/health/` - API health check

## WebSocket

The dashboard uses WebSocket for real-time updates:
- **URL**: `ws://localhost:8000/ws/admin/` (configurable via `NEXT_PUBLIC_WS_URL`)
- **Message Types**:
  - `metrics_update` - Updates dashboard metrics
  - `alert` - Sends alert notifications

## Styling

- **Dark mode first**: All components use dark gray-950 background
- **Minimal design**: Clean, institutional look
- **Subtle gradients**: Soft shadows and borders
- **Color coding**:
  - Green: Positive/success
  - Red: Errors/high risk
  - Yellow: Warnings/medium risk
  - Blue: Information/actions

## Usage

1. **Access**: Navigate to `/admin` (requires admin role)
2. **Authentication**: Automatically checks `is_staff === true`
3. **Navigation**: Use sidebar to switch between sections
4. **Real-time**: Data auto-refreshes every 5-15 seconds
5. **Actions**: Click action buttons to manage markets/users

## Security

- Role-based access control
- Immutable audit logs
- Confirmation modals for destructive actions
- IP address tracking
- Token-based authentication

## Performance

- SWR for efficient data fetching
- Skeleton loaders for better UX
- Optimistic updates where appropriate
- WebSocket for real-time without polling overhead

