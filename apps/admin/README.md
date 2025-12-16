# Admin Panel - Separate Application

This is a separate Next.js application for the admin panel, running on **port 3001**.

## Setup

1. Install dependencies:
```bash
cd apps/admin
npm install
```

2. Run the admin app:
```bash
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

## Running Both Apps

To run both the user app (port 3000) and admin app (port 3001) simultaneously:

### Option 1: Using npm scripts (from root)
```bash
# Terminal 1 - User app
npm run dev

# Terminal 2 - Admin app
cd apps/admin && npm run dev
```

### Option 2: Using concurrently (if installed)
```bash
npm run dev:all
```

## Access

- **User App**: http://localhost:3000
- **Admin App**: http://localhost:3001

## Notes

- The admin app shares the same `src/` directory with the main app for shared components and services
- Authentication is shared via localStorage
- Admin routes are now at the root level (e.g., `/dashboard` instead of `/admin/dashboard`)

