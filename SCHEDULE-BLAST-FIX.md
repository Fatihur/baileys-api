# ✅ Schedule Blast Fix - Tombol Tidak Merespon

## 🔴 Masalah

**Tombol "Schedule Blast" tidak merespon** saat diklik di halaman Kirim Pesan.

## 🔧 Penyebab

File `schedule-functions.js` **tidak di-load** di `messages.html`, sehingga fungsi `openScheduleModal()` tidak terdefinisi.

## ✅ Solusi

Sudah ditambahkan script tag untuk `schedule-functions.js` di `messages.html`:

```html
<script src="config.js"></script>
<script src="messages.js"></script>
<script src="recipient-modal.js"></script>
<script src="schedule-functions.js"></script>  <!-- ✅ DITAMBAHKAN -->
<script src="sidebar.js"></script>
```

## 🚀 Cara Test

### **1. Refresh Halaman**

```bash
# Buka browser
http://localhost:3000/messages.html

# Tekan Ctrl+F5 (hard refresh)
```

### **2. Isi Form**

1. **Pilih Koneksi** - Select session yang aktif
2. **Pilih Penerima** - Klik "Pilih Penerima" dan tambah minimal 1 nomor
3. **Tulis Pesan** - Ketik pesan di text area

### **3. Klik Schedule Blast**

- Klik tombol **"Schedule Blast"** (tombol abu-abu)
- Modal akan muncul ✅
- Set tanggal & waktu
- Klik "Schedule Blast" untuk konfirmasi

## ✅ Fitur Yang Berfungsi

### **Validasi:**
- ✅ Cek session sudah dipilih
- ✅ Cek minimal 1 penerima
- ✅ Cek pesan tidak kosong
- ✅ Waktu schedule minimal 5 menit ke depan

### **Schedule Modal:**
- ✅ Input datetime
- ✅ Summary (session, penerima, tipe, waktu)
- ✅ Simpan ke localStorage
- ✅ Redirect ke halaman scheduled

### **Schedule Data:**

```javascript
{
  id: 'schedule_1234567890',
  sessionId: 'session1',
  message: 'Pesan Anda...',
  messageType: 'text',
  recipients: ['628xxx', '628yyy'],
  recipientsData: [{...}, {...}],
  scheduledTime: '2025-01-10T15:30:00.000Z',
  status: 'pending',
  mediaUrl: null
}
```

## 🔍 Debug

### **Check Console (F12):**

```javascript
// Cek apakah fungsi ada
console.log(typeof openScheduleModal);
// Should return: "function"

// Jika "undefined":
// → Refresh page dengan Ctrl+F5
// → Check network tab - schedule-functions.js loaded?
```

### **Check Network Tab:**

1. Open DevTools (F12)
2. Tab "Network"
3. Refresh page
4. Cari `schedule-functions.js`
5. Status harus **200 OK**

## 📊 Flow Schedule Blast

```
1. User klik "Schedule Blast"
   ↓
2. Validasi form (session, penerima, pesan)
   ↓
3. Show modal dengan datetime picker
   ↓
4. User set tanggal & waktu
   ↓
5. User klik "Schedule Blast" (di modal)
   ↓
6. Save ke localStorage (scheduledMessages)
   ↓
7. Show notification "Blast scheduled!"
   ↓
8. Confirm: "Lihat scheduled blasts?"
   ↓
9. Redirect ke scheduled.html (jika Yes)
```

## 🎯 Testing Checklist

- [ ] Refresh halaman (Ctrl+F5)
- [ ] Pilih session
- [ ] Tambah penerima (min 1)
- [ ] Tulis pesan
- [ ] Klik "Schedule Blast" button
- [ ] Modal muncul ✅
- [ ] Set datetime (min +5 menit dari sekarang)
- [ ] Klik "Schedule Blast" di modal
- [ ] Notification muncul ✅
- [ ] Data tersimpan di localStorage ✅

## 🐛 Common Issues

### **Issue 1: Modal Tidak Muncul**

**Symptom:** Klik tombol, tidak ada respon

**Solution:**
```bash
# 1. Check console
F12 → Console → Ada error?

# 2. Hard refresh
Ctrl+F5

# 3. Clear cache
Ctrl+Shift+Delete → Clear browsing data
```

### **Issue 2: "Pilih koneksi terlebih dahulu"**

**Symptom:** Notification error muncul

**Solution:**
```bash
# Select session dari dropdown di header
# Pastikan ada session yang connected
```

### **Issue 3: "Pilih minimal 1 penerima"**

**Symptom:** Notification error

**Solution:**
```bash
# Klik tombol "Pilih Penerima"
# Tambah minimal 1 nomor
# Klik "Konfirmasi"
```

### **Issue 4: "Tulis pesan terlebih dahulu"**

**Symptom:** Notification error (untuk tipe text)

**Solution:**
```bash
# Ketik pesan di text area
# Minimal 1 karakter
```

## ✅ Verifikasi Fix

### **1. Check File Exists:**

```powershell
# File schedule-functions.js
Get-Item "E:\FILE\website\PORTOFOLIO\baileys-api\public\schedule-functions.js"

# Should exist
```

### **2. Check Script Tag:**

```powershell
# messages.html contains script tag
Get-Content "E:\FILE\website\PORTOFOLIO\baileys-api\public\messages.html" | Select-String "schedule-functions.js"

# Should show:
# <script src="schedule-functions.js"></script>
```

### **3. Test in Browser:**

```javascript
// Open console (F12)
// Type:
openScheduleModal

// Should show:
// ƒ openScheduleModal() { ... }
```

## 📝 Summary

**Problem:** Schedule Blast button tidak merespon

**Root Cause:** `schedule-functions.js` tidak di-load

**Fix:** ✅ Tambahkan `<script src="schedule-functions.js"></script>` di messages.html

**Status:** FIXED

**Test:** Refresh page → Fill form → Click Schedule Blast → Modal muncul!

---

**Next Steps:**
1. Refresh halaman (Ctrl+F5)
2. Test schedule blast functionality
3. Check scheduled page untuk melihat blast yang dijadwalkan

**Ready to use!** 🎉
