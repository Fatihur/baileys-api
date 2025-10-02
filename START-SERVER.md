# 🚀 Cara Start Server

## ✅ Port Sudah Dibersihkan

Process lama sudah di-kill, port 3000 sekarang free!

---

## 🚀 Start Server Sekarang

### **Option 1: Terminal Baru**
```bash
cd E:\FILE\website\PORTOFOLIO\baileys-api
npm run dev
```

### **Option 2: Command Prompt**
```cmd
cd /d E:\FILE\website\PORTOFOLIO\baileys-api
npm run dev
```

---

## ✅ Server Akan Show:

```
[INFO] ts-node-dev ver. 2.0.0
Server running on port 3000
API Key: your-secret-api-key-change-this
```

---

## 🧪 Test Setelah Server Running:

### **1. Test API:**
```
http://localhost:3000/test.html
```

### **2. Buka Dashboard:**
```
http://localhost:3000
```

### **3. Test Nomor WA:**
```
1. Buka: http://localhost:3000/connections.html
2. Delete session lama (jika ada)
3. Create session baru
4. Scan QR code
5. Wait for connected
6. Check log server: "connected with number: 628xxx"
7. Check frontend: 📞 628xxx harus muncul!
```

---

## 🐛 Jika Ada Error Lagi:

### **Error: EADDRINUSE (Port masih dipakai)**
```bash
# Cari process:
netstat -ano | findstr :3000

# Kill process (ganti PID):
taskkill /F /PID <PID>

# Start server:
npm run dev
```

### **Error: Module not found**
```bash
npm install
npm run dev
```

---

## 📝 Note Penting:

1. **Existing Session:** Session lama tidak punya nomor WA, HARUS reconnect
2. **Check Log:** Server log akan show nomor saat connected
3. **Refresh Browser:** Ctrl+Shift+R setelah reconnect

---

## 🎯 Expected Result:

After reconnect:
```
Server Log:
✅ Session whatsapp-utama connected with number: 6281234567890

Frontend:
┌──────────────────────────────────────────────┐
│ 🟢 whatsapp-utama    [Terhubung] [Aktif]    │
│    📞 6281234567890    ✅ MUNCUL!            │
└──────────────────────────────────────────────┘
```

---

**Status:** ✅ Port cleared, ready to start!
