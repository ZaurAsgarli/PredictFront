# Admin Panel - Separate Application Setup

## Overview

The admin panel has been separated into a standalone Next.js application running on **port 3001**, separate from the main user application on **port 3000**.

## Structure

```
PredictFront-0/
├── apps/
│   └── admin/          # Separate admin Next.js app (port 3001)
│       ├── pages/      # Admin pages (routes without /admin prefix)
│       ├── package.json
│       └── ...
├── pages/              # Main user app (port 3000)
├── src/                # Shared components and services
└── ...
```

## Setup Instructions

### 1. Install Admin App Dependencies

```bash
cd apps/admin
npm install
```

### 2. Run Both Applications

**Terminal 1 - User App (port 3000):**
```bash
npm run dev
```

**Terminal 2 - Admin App (port 3001):**
```bash
npm run dev:admin
# OR
cd apps/admin && npm run dev
```

## Access URLs

- **User Application**: http://localhost:3000
- **Admin Application**: http://localhost:3001

## Route Differences

In the admin app, routes are at the root level (no `/admin` prefix):
- `/login` - Admin login page
- `/dashboard` - Admin dashboard
- `/analytics` - Analytics page
- `/markets` - Markets management
- `/trades` - Trades management

## Navigation

The admin button in the main app's Navbar now links to `http://localhost:3001/dashboard` (opens in new tab).

## Shared Resources

Both apps share:
- `src/services/` - API services and auth
- `src/admin/components/` - Admin components
- `src/admin/services/` - Admin API services
- `src/styles/` - Global styles
- `src/contexts/` - Theme context

## Notes

- Authentication is shared via localStorage
- Both apps connect to the same backend API
- Admin routes in the main app (`/admin/*`) are still available but deprecated
- The separate admin app is the recommended way to access admin features

## Development

When developing:
1. Start the user app on port 3000
2. Start the admin app on port 3001
3. Both apps can run simultaneously without conflicts

