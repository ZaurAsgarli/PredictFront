# Admin App Troubleshooting

## Build Error: Module not found

If you see an error like:
```
Module not found: Can't resolve '../../src/styles/globals.css'
```

### Solution 1: Clear Cache and Restart
1. Stop the dev server (Ctrl+C)
2. Delete the `.next` folder:
   ```bash
   cd apps/admin
   rm -rf .next  # On Windows: rmdir /s /q .next
   ```
3. Restart the dev server:
   ```bash
   npm run dev
   ```

### Solution 2: Verify File Paths
The admin app is located at `apps/admin/`, so paths to shared resources need to go up 3 levels:
- From: `apps/admin/pages/_app.js`
- To: `src/styles/globals.css`
- Path: `../../../src/styles/globals.css` ✓

### Solution 3: Check File Exists
Verify the file exists:
```bash
# From project root
ls src/styles/globals.css  # On Windows: dir src\styles\globals.css
```

### Solution 4: Reinstall Dependencies
If the issue persists:
```bash
cd apps/admin
rm -rf node_modules .next
npm install
npm run dev
```

