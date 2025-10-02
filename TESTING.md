# Testing Guide - Baileys WhatsApp Gateway

## Step-by-Step Testing

### 1. Start Server

```bash
npm run dev
```

Server akan running di `http://localhost:3000`

---

### 2. Create Session

**Option A: Using curl**
```bash
curl -X POST http://localhost:3000/api/session/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d "{\"sessionId\": \"my-wa\"}"
```

**Option B: Using browser/Postman**
```
POST http://localhost:3000/api/session/create
Headers:
  Content-Type: application/json
  X-API-KEY: baileys-gateway-secret-key-2024
Body:
  {
    "sessionId": "my-wa"
  }
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session created successfully. Open /qr/my-wa in browser to scan QR code.",
  "sessionId": "my-wa",
  "qrUrl": "/qr/my-wa"
}
```

---

### 3. View QR Code

**IMPORTANT:** Tunggu 2-3 detik setelah create session, kemudian:

**Buka browser:** `http://localhost:3000/qr/my-wa`

Anda akan melihat:
- ✅ Loading screen (jika QR belum ready)
- ✅ QR Code besar yang bisa di-scan
- ✅ Instruksi cara scan

**Jika muncul "Session Not Found":**
- Berarti session belum dibuat, ulangi step 2

**Jika muncul "Generating QR Code...":**
- Tunggu beberapa detik, page akan auto-refresh

---

### 4. Scan QR Code

1. Buka WhatsApp di HP
2. Tap Menu/Settings (⚙️)
3. Tap "Linked Devices"
4. Tap "Link a Device"
5. Scan QR code di browser

Page akan auto-refresh, jika berhasil akan muncul "Session Connected!"

---

### 5. Check Logs

Cek terminal/console untuk melihat logs:
```
✅ QR Code generated successfully for session my-wa
QR Code length: 5000+ characters
```

Jika QR tidak muncul, cek logs untuk error.

---

### 6. Send Message (After Connected)

```bash
curl -X POST http://localhost:3000/api/message/text \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d "{\"sessionId\": \"my-wa\", \"to\": \"6281234567890\", \"message\": \"Hello!\"}"
```

---

## Troubleshooting

### Problem: QR Code tidak muncul (loading terus)

**Solution 1: Check logs**
```bash
# Cek di terminal yang running npm run dev
# Harusnya ada log: "✅ QR Code generated successfully"
```

**Solution 2: Restart session**
```bash
# Delete session
curl -X DELETE http://localhost:3000/api/session/my-wa \
  -H "X-API-KEY: baileys-gateway-secret-key-2024"

# Create again
curl -X POST http://localhost:3000/api/session/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d "{\"sessionId\": \"my-wa\"}"

# Wait 3 seconds, then open browser
```

**Solution 3: Check folder permissions**
```bash
# Pastikan folder sessions bisa dibuat
ls -la sessions/
```

**Solution 4: Try JSON endpoint**
```bash
curl http://localhost:3000/api/session/my-wa/status \
  -H "X-API-KEY: baileys-gateway-secret-key-2024"
```

Cek apakah ada field `qr` dalam response. Jika ada, copy paste ke online QR viewer.

---

### Problem: "Session Not Found"

Session belum dibuat. Jalankan step 2 dulu.

---

### Problem: Cannot connect to server

Port 3000 sudah dipakai. Edit `.env`:
```
PORT=3001
```

Restart server.

---

## Quick Test Script

Jalankan ini di terminal lain (bukan yang running npm run dev):

```bash
#!/bin/bash

echo "1. Creating session..."
curl -X POST http://localhost:3000/api/session/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d '{"sessionId": "test123"}'

echo -e "\n\n2. Waiting 3 seconds for QR generation..."
sleep 3

echo -e "\n3. Checking status..."
curl http://localhost:3000/api/session/test123/status \
  -H "X-API-KEY: baileys-gateway-secret-key-2024"

echo -e "\n\n4. Open browser: http://localhost:3000/qr/test123"
```

Save sebagai `test.sh`, chmod +x test.sh, run: `./test.sh`
