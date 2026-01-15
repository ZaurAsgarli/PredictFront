# Frontend User Interface

## Overview

The Frontend User Interface is a Next.js application that provides the user-facing interface for the prediction market platform. It enables users to browse markets, make predictions, view their trading history, and compete on leaderboards.

## Purpose

The frontend exists to provide users with an intuitive, responsive interface for participating in prediction markets. It solves the problem of making prediction markets accessible to users who may not be familiar with blockchain technology or complex trading interfaces.

The frontend focuses on user experience, providing clear interfaces for market participation while delegating all business logic and data validation to the backend. This separation ensures security, consistency, and maintainability.

## Platform Description

This is a prediction market platform where users can:

- Browse available prediction markets
- Make predictions (trades) on market outcomes
- Track their trading history and performance
- Compete on leaderboards (weekly, monthly, all-time)
- View market details, trading activity, and price evolution
- Manage their user profile and account settings

The platform combines Web2 user interfaces with Web3 smart contract settlement, providing a hybrid architecture that offers both user-friendly web experiences and on-chain transaction finality.

## Main Pages and Responsibilities

### Markets / Events

The markets page displays all available prediction markets. Users can browse markets by category, status, or search criteria. Each market shows basic information such as title, description, status, and current liquidity.

This page serves as the entry point for market discovery, allowing users to find markets of interest.

### Market Detail Pages

Market detail pages provide comprehensive information about individual markets:

- Market metadata (title, description, category, timeline)
- Current market state (liquidity, volume, price evolution)
- Trading interface for making predictions
- Trade history and activity
- Price charts showing market evolution over time

These pages enable users to understand market context, make informed predictions, and participate in trading.

### Profile

The profile page displays user-specific information:

- User account details
- Trading history and statistics
- Performance metrics
- Account settings

This page helps users understand their activity, track their performance, and manage their account.

### Leaderboards

Leaderboard pages display rankings of users based on trading performance:

- Weekly leaderboard: Rankings for the current week
- Monthly leaderboard: Rankings for the current month
- All-time leaderboard: Historical rankings across all time

Leaderboards enable competitive engagement and help users understand their relative performance.

### Charts and Statistics

Various pages include charts and visualizations:

- Market price evolution over time
- Trading volume trends
- User performance metrics
- Platform-wide statistics

These visualizations help users understand trends, patterns, and performance.

## How Data Is Fetched

### Centralized API Layer

All data fetching goes through a centralized API layer (`lib/api.ts`). This layer provides:

- Consistent request handling across all pages
- Automatic authentication token injection
- Error handling and response processing
- Request deduplication to prevent duplicate calls
- Rate limit management

The API layer ensures that all frontend components use the same data fetching patterns, reducing code duplication and ensuring consistency.

### Request Deduplication

The API layer includes request deduplication to prevent duplicate API calls. If multiple components request the same data simultaneously, only one HTTP request is made, and all components receive the same response.

This prevents request storms when multiple components mount simultaneously and reduces unnecessary backend load.

### Request Rate Limiting

The API layer includes a request governor that limits concurrent requests. This prevents the frontend from overwhelming the backend with too many simultaneous requests.

The governor queues requests when the concurrent limit is reached, ensuring smooth operation even during high-activity periods.

### Caching Layer

A data cache layer (`lib/dataCache.ts`) provides in-memory caching for frequently accessed data:

- Markets data
- User profile information
- Analytics and leaderboard data

Cached data is valid for a short period (5 minutes), after which fresh data is fetched. This reduces backend load while ensuring data freshness.

### Pagination and Filtering

Data endpoints support pagination and filtering:

- Pagination: Large datasets are split into pages
- Filtering: Data can be filtered by various criteria (status, category, date range)
- Sorting: Data can be sorted by different fields

The frontend handles pagination by requesting additional pages as needed, and filters are applied via query parameters in API requests.

## Error Handling Philosophy

### Empty States Preferred

When data cannot be loaded or is unavailable, the frontend displays empty states rather than errors or crashes:

- "No markets available" instead of error messages
- "No trades found" instead of crashes
- Empty tables with helpful messages instead of broken UI

This ensures that the UI remains functional and informative even when data is unavailable.

### Rate Limit Handling

Rate limits are handled gracefully:

- When a rate limit (429) is encountered, the request fails immediately (no retries)
- The UI displays appropriate feedback to the user
- No automatic retry loops that could worsen the situation
- Logging of rate limit events for debugging

This fail-fast approach prevents request storms and ensures the frontend respects backend limits.

### Why Retries Are Limited

The frontend does not automatically retry failed requests because:

- Retries can worsen rate limiting issues
- Retries can create request storms that overwhelm the backend
- User actions should be explicit (if a request fails, the user can retry manually)
- Failed requests indicate real problems that should be addressed, not hidden

Retries are limited to specific scenarios (e.g., network errors with backoff) and are not applied to rate limits, authentication errors, or validation errors.

### Network Error Handling

Network errors (connection failures, CORS issues) are handled separately:

- Clear error messages indicating network problems
- Guidance on checking backend connectivity
- No infinite retry loops
- Appropriate user feedback

This ensures users understand when problems are network-related versus application-related.

## Relationship to Admin Dashboard

### Same Backend

The frontend and admin dashboard use the same backend API:

- Same authentication endpoints (`/users/login/`, `/users/me/`)
- Same data endpoints (`/markets/`, `/trades/`, `/analytics/`)
- Same authentication mechanism (JWT tokens in localStorage)

This ensures consistency and reduces maintenance overhead.

### Different Permissions

The difference between the frontend and admin dashboard is permissions, not endpoints:

- Regular users see only their own data (e.g., their own trades)
- Administrators see broader data (e.g., all trades)
- The backend enforces permissions based on user roles
- The same endpoints return different data based on user permissions

This design ensures that administrative functionality uses the same tested, stable code paths as user functionality.

### Shared Data, Different Visibility

Both interfaces access the same data sources:

- Markets data (both see all markets)
- Trading data (users see their trades, admins see all trades)
- Analytics data (users see leaderboards, admins see additional metrics)

The backend filters data based on user roles, ensuring users only see data they are authorized to access.

## Architecture Decisions

### Client-Side Rendering

The frontend uses client-side rendering for most pages:

- Data fetching happens after component mount
- No server-side data fetching (except for static pages)
- This allows dynamic, interactive interfaces
- Reduces server load compared to server-side rendering

### State Management

Component state is managed locally using React hooks:

- `useState` for component-specific state
- `useEffect` for data fetching and side effects
- No global state management library (Redux, Zustand, etc.)
- Simplicity preferred over complex state management

This keeps the codebase simple and maintainable.

### Authentication

Authentication uses JWT tokens stored in localStorage:

- Tokens are sent with every API request via Axios interceptors
- Token validation happens on the backend for each request
- No server-side session management
- Stateless authentication reduces backend complexity

### API Client Design

The API client (`lib/api.ts`) is designed for reliability:

- Request deduplication prevents duplicate calls
- Rate limit handling prevents request storms
- Error handling ensures graceful failures
- Token injection is automatic and transparent

These design decisions ensure the frontend is stable, efficient, and respectful of backend resources.

## What the Frontend Does Not Do

### Does Not Enforce Business Rules

The frontend does not enforce business rules or validate data authoritatively:

- All validation happens in the backend
- The frontend may provide client-side validation for user experience
- But the backend is the source of truth
- Business rules cannot be bypassed by manipulating frontend code

This ensures security and consistency across all clients (web, mobile, API).

### Does Not Store Authoritative State

The frontend does not store authoritative application state:

- All authoritative state is in the backend database
- The frontend displays data from the backend
- User actions trigger backend operations
- The frontend reflects backend state, but does not define it

This ensures data consistency and eliminates synchronization issues.

### Does Not Make Authorization Decisions

The frontend does not make authorization decisions:

- Permission checks happen in the backend
- The frontend may hide UI elements based on user data
- But the backend enforces actual permissions
- Users cannot bypass restrictions by manipulating frontend code

This ensures that security is enforced consistently, regardless of how users interact with the platform.

## Technical Notes

### Next.js App Router

The frontend uses Next.js with the App Router:

- Pages are defined in the `app/` directory
- Route structure matches directory structure
- Server components and client components are used appropriately
- Static generation and dynamic rendering are used as needed

### API Layer Structure

The API layer provides:

- Axios instance with interceptors for authentication
- Request deduplication to prevent duplicate calls
- Rate limit handling and request governor
- Error handling and response processing
- Type-safe API methods

### Data Cache

The data cache provides:

- In-memory caching for frequently accessed data
- Cache invalidation after time-to-live expires
- Request deduplication at the cache layer
- Cache clearing utilities

These mechanisms ensure efficient API usage and prevent unnecessary backend load.
