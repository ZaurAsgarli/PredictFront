# Installation Guide

Follow these steps to set up and run the PredictHub frontend.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Django backend API (see BACKEND_SETUP.md)

## Step-by-Step Installation

### 1. Clone or Download the Project

If you haven't already, navigate to your project directory:

```bash
cd virtual-p
```

### 2. Install Node.js Dependencies

```bash
npm install
```

This will install all the required packages:
- Next.js
- React & React DOM
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (icons)
- date-fns

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Windows (PowerShell)
New-Item .env.local

# Or manually create the file
```

Add the following content to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Important:** Replace `http://localhost:8000/api` with your actual Django backend URL.

### 4. Start the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 5. Verify the Setup

Open your browser and navigate to:
- Home: http://localhost:3000
- Events: http://localhost:3000/events
- Login: http://localhost:3000/login

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:** Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Issue: API requests failing

**Solution:** 
1. Verify your `.env.local` file has the correct API URL
2. Make sure your Django backend is running
3. Check CORS configuration in Django (see BACKEND_SETUP.md)
4. Open browser DevTools > Network tab to see the actual error

### Issue: Tailwind styles not working

**Solution:** 
1. Make sure you've run `npm install`
2. Restart the dev server with `npm run dev`
3. Clear browser cache

### Issue: Dark mode not working

**Solution:** 
Tailwind's dark mode is set to use system preferences. Check your OS theme settings.

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

### 2. Start Production Server

```bash
npm start
```

The production server will run on port 3000 by default.

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Follow the prompts to complete deployment.

## Environment Variables for Production

For production deployment, set these environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Testing Without Backend

If you want to test the frontend without the backend, you can:

1. **Use Mock Data:** Create mock API responses in the service files
2. **Use JSON Server:** Set up a quick mock API
3. **Use MSW (Mock Service Worker):** Intercept API calls and return mock data

Example with mock data in `src/services/events.js`:

```javascript
export const eventsService = {
  getAllEvents: async () => {
    // Return mock data instead of API call
    return [
      {
        id: 1,
        title: "Sample Event",
        description: "This is a sample event",
        category: "Sports",
        status: "active",
        // ... more fields
      }
    ];
  },
  // ... other methods
};
```

## Next Steps

After installation:

1. ✅ Set up your Django backend (see BACKEND_SETUP.md)
2. ✅ Customize branding and colors (see README.md)
3. ✅ Add your own events and categories
4. ✅ Test the full user flow
5. ✅ Deploy to production

## Support

If you encounter any issues:

1. Check the browser console for errors (F12)
2. Check the terminal for build errors
3. Verify all dependencies are installed
4. Make sure the backend API is running and accessible
5. Review the README.md and BACKEND_SETUP.md

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## File Permissions (Linux/Mac)

If you encounter permission errors:

```bash
# Make sure you have write permissions
chmod -R 755 virtual-p/

# If needed, take ownership
sudo chown -R $USER:$USER virtual-p/
```

## Windows-Specific Notes

- Use PowerShell or Command Prompt as administrator if you encounter permission issues
- Make sure Windows Defender or antivirus isn't blocking Node.js
- If you see ENOENT errors, try running with administrator privileges

---

**Ready to start?** Run `npm run dev` and visit http://localhost:3000 🚀

