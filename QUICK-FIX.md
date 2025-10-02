# 🔧 Quick Fix - Loading Issue

## Problem
Page shows "Loading koneksi..." terus menerus.

## Solutions

### 1. Test API Connection

Buka di browser:
```
http://localhost:3000/test.html
```

Klik tombol:
- Test 1: Server Root (cek server running)
- Test 2: Get Sessions (cek API)
- Test 3: Create Session (test create)

### 2. Manual Test via Browser Console

Buka dashboard (`http://localhost:3000`), tekan `F12` untuk buka console, paste:

```javascript
// Test 1: Check API Config
console.log('API Config:', API_CONFIG);

// Test 2: Test API directly
fetch('http://localhost:3000/api/sessions', {
  headers: { 'X-API-KEY': 'baileys-gateway-secret-key-2024' }
})
.then(r => r.json())
.then(data => console.log('Sessions:', data))
.catch(err => console.error('Error:', err));
```

### 3. Check Server

Terminal harus menunjukkan:
```
Server running on port 3000
```

Jika tidak ada, jalankan:
```bash
npm run dev
```

### 4. Check Console Errors

Di browser (F12 → Console), cek ada error:
- ❌ **CORS error**: Server perlu restart
- ❌ **401/403 error**: API Key salah
- ❌ **Network error**: Server tidak jalan
- ❌ **404 error**: Endpoint salah

### 5. Manual Fixes

**If "Server not running":**
```bash
cd E:\FILE\website\PORTOFOLIO\baileys-api
npm run dev
```

**If "Port already in use":**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm run dev
```

**If "API Key invalid":**
Check `.env` file:
```
API_KEY=baileys-gateway-secret-key-2024
```

Must match `config.js`:
```javascript
apiKey: 'baileys-gateway-secret-key-2024'
```

### 6. Debug Mode

Edit `public/config.js`, enable logging:

```javascript
const api = {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    console.log('API Request:', url, options); // ADD THIS
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      console.log('API Response:', response.status); // ADD THIS
      const data = await response.json();
      console.log('API Data:', data); // ADD THIS

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error); // ALREADY THERE
      throw error;
    }
  }
}
```

### 7. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Loading..." forever | API call fails | Check console for errors |
| CORS error | Server needs restart | Restart `npm run dev` |
| 401 Unauthorized | Wrong API key | Check `.env` and `config.js` |
| 404 Not Found | Wrong endpoint | Check URL in config |
| Network error | Server not running | Run `npm run dev` |
| Blank page | JS error | Check browser console |

### 8. Fresh Start

If all else fails:

```bash
# 1. Stop server (Ctrl+C)

# 2. Kill port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# 3. Restart
npm run dev

# 4. Clear browser cache
# Ctrl+Shift+R (hard refresh)

# 5. Open
http://localhost:3000/test.html
```

### 9. Expected Behavior

**When working correctly:**

1. Open `http://localhost:3000`
2. See Dashboard with 3 cards
3. Console shows:
   ```
   Dashboard loaded
   API Config: {baseURL: "http://localhost:3000", apiKey: "..."}
   Loading sessions from: http://localhost:3000/api/sessions
   Sessions data: {sessions: []}
   ```
4. If no sessions: "Belum ada koneksi. Klik..."
5. If has sessions: Session cards appear

**When NOT working:**

1. Console shows error (red text)
2. "Loading koneksi..." never changes
3. Error card appears with message

### 10. Quick Diagnostic

Run this in browser console (F12):

```javascript
// Diagnostic Script
console.log('=== DIAGNOSTIC START ===');

// Check config
console.log('1. Config:', API_CONFIG);

// Test server
fetch('http://localhost:3000')
  .then(r => r.json())
  .then(d => console.log('2. Server:', d))
  .catch(e => console.error('2. Server ERROR:', e));

// Test API
fetch('http://localhost:3000/api/sessions', {
  headers: {'X-API-KEY': 'baileys-gateway-secret-key-2024'}
})
  .then(r => r.json())
  .then(d => console.log('3. API:', d))
  .catch(e => console.error('3. API ERROR:', e));

console.log('=== DIAGNOSTIC END ===');
```

Result should show:
```
1. Config: {baseURL: ..., apiKey: ...}
2. Server: {status: "running", ...}
3. API: {sessions: [...]}
```

---

## Still Not Working?

1. Take screenshot of browser console (F12)
2. Take screenshot of terminal (where npm run dev)
3. Check which test fails on `/test.html`
4. Share the error messages

---

**Quick Links:**
- Test Page: http://localhost:3000/test.html
- Debug Page: http://localhost:3000/debug.html
- Dashboard: http://localhost:3000
