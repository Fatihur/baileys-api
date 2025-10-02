# 📱 WhatsApp Blast Application - User Guide

Aplikasi Web untuk Blast WhatsApp dengan fitur lengkap dan UI yang user-friendly.

## 🚀 Cara Menggunakan

### 1. Start Server

```bash
npm run dev
```

Server akan running di `http://localhost:3000`

---

### 2. Buka Web App

Buka browser dan akses: **`http://localhost:3000`**

Anda akan melihat dashboard aplikasi blast WhatsApp.

---

### 3. Create WhatsApp Session

Di halaman **Dashboard**:

1. Klik tombol **"+ New Session"**
2. Masukkan nama session (contoh: `my-whatsapp`)
3. (Opsional) Masukkan webhook URL
4. Klik **"Create Session"**

Modal QR code akan muncul otomatis.

---

### 4. Scan QR Code

1. Buka WhatsApp di HP Anda
2. Tap Menu/Settings (⚙️)
3. Tap **"Linked Devices"**
4. Tap **"Link a Device"**
5. Scan QR code yang muncul di browser

Setelah berhasil scan, status akan berubah menjadi **"Connected"** (hijau).

---

### 5. Blast Message

1. Klik menu **"Blast Message"** di sidebar
2. **Pilih Session** yang sudah connected
3. **Import Contacts**:
   - **Upload CSV** (format: satu nomor per baris)
   - Atau **ketik manual** di textarea
   - Download sample CSV jika perlu contoh

4. **Pilih Tipe Message**:
   - **Text Message**: Pesan teks biasa
   - **Image with Caption**: Gambar dengan caption
   - **Document**: File dokumen (PDF, Word, dll)

5. **Tulis Pesan Anda**
   - Gunakan variable `{name}` dan `{number}` jika perlu
   - Lihat preview di sidebar kanan

6. **Set Delay**: 
   - Recommended: 2-5 detik
   - Untuk menghindari spam detection WhatsApp

7. Klik **"Send Blast Message"**

Progress bar akan menampilkan status pengiriman real-time.

---

### 6. Message Templates

Simpan template pesan untuk digunakan kembali:

1. Klik menu **"Templates"**
2. Klik **"+ New Template"**
3. Beri nama template
4. Tulis template pesan
5. Klik **"Save Template"**

Gunakan template dengan klik **"Use Template"** saat blast message.

---

### 7. View History

Lihat riwayat blast message:

1. Klik menu **"History"**
2. Lihat statistik: Date, Session, Total, Sent, Failed, Success Rate
3. Clear history dengan klik **"Clear History"**

---

## 📋 Format CSV untuk Import Contacts

```
6281234567890
6281234567891
6281234567892
6287812345678
```

**Notes:**
- Satu nomor per baris
- Format: 62xxxxxxxxxx (tanpa +, tanpa spasi)
- Tanpa header/judul kolom
- File extension: `.csv` atau `.txt`

---

## ✨ Fitur Aplikasi

### Dashboard
- ✅ Session management (create, view, delete)
- ✅ Real-time session status
- ✅ QR code scanner dengan auto-refresh
- ✅ Statistics (messages sent, contacts, failed, pending)

### Blast Message
- ✅ CSV import contacts
- ✅ Manual input contacts
- ✅ Send text, image, document
- ✅ Message preview
- ✅ Recipient list preview
- ✅ Custom delay between messages
- ✅ Real-time sending progress
- ✅ Live logs (success/failed)
- ✅ Auto-save draft

### Templates
- ✅ Create message templates
- ✅ Use template for blast
- ✅ Copy to clipboard
- ✅ Delete template

### History
- ✅ View all blast history
- ✅ Statistics per blast
- ✅ Success rate calculation
- ✅ Clear history

---

## 🎯 Tips & Best Practices

### 1. Delay Antar Pesan
- **Recommended**: 2-5 detik
- **Minimum**: 1 detik
- **Maximum**: 10 detik untuk safety
- Terlalu cepat bisa kena spam detection WhatsApp

### 2. Jumlah Penerima
- **Optimal**: 50-100 penerima per batch
- Untuk jumlah besar (>500), bagi menjadi beberapa batch
- Tunggu 10-15 menit antar batch

### 3. Konten Pesan
- Jangan spam dengan konten sama berulang kali
- Variasikan pesan menggunakan variable `{name}`
- Hindari kata-kata spam (GRATIS, PROMO BESAR, dll)

### 4. Session Management
- Buat session terpisah untuk tiap WhatsApp account
- Logout session yang tidak digunakan
- Backup folder `sessions/` untuk restore

### 5. Monitoring
- Cek history secara berkala
- Perhatikan success rate
- Jika banyak failed, periksa nomor atau session status

---

## 🐛 Troubleshooting

### QR Code tidak muncul
1. Refresh browser
2. Delete session dan create ulang
3. Cek console browser (F12) untuk error
4. Pastikan API server running

### Pesan tidak terkirim
1. Cek session status (harus "Connected")
2. Cek format nomor penerima (62xxxxxxxxxx)
3. Cek koneksi internet
4. Cek API logs di terminal

### Session disconnected
1. Re-scan QR code
2. Atau delete dan create session baru
3. Pastikan WhatsApp di HP tidak logout

### CSV import gagal
1. Cek format CSV (satu nomor per baris)
2. Pastikan file extension .csv atau .txt
3. Jangan ada header/judul
4. Hapus spasi dan karakter aneh

---

## 🔒 Security Notes

- **API Key**: Default key ada di `config.js`, ganti untuk production
- **Webhook**: Gunakan HTTPS untuk webhook URL
- **Sessions Folder**: Jangan share folder `sessions/`, berisi data sensitif
- **Public Access**: Jangan expose aplikasi ke public tanpa authentication

---

## 📊 Dashboard Metrics

### Messages Sent Today
Total pesan yang berhasil dikirim hari ini

### Total Contacts
Total unique contacts yang pernah dikirimi pesan

### Pending Messages
Pesan yang sedang dalam antrian (jika ada)

### Failed Messages
Total pesan yang gagal dikirim

---

## 🎨 Tampilan Aplikasi

### Colors
- **Green (#25D366)**: WhatsApp color, success
- **Purple (#667eea)**: Primary actions
- **Orange (#f59e0b)**: Warning, pending
- **Red (#ef4444)**: Error, failed

### Icons
- Font Awesome 6.4.0
- WhatsApp icon di logo
- Material icons untuk actions

---

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek bagian Troubleshooting di atas
2. Lihat console browser (F12) untuk error details
3. Cek terminal server untuk API logs
4. Restart server: `Ctrl+C` lalu `npm run dev`

---

## 🚀 Next Steps

Setelah mahir menggunakan aplikasi:
1. Buat templates untuk pesan yang sering digunakan
2. Gunakan variable untuk personalisasi
3. Monitor success rate di History
4. Optimize delay berdasarkan hasil
5. Scale up dengan multiple sessions

**Happy Blasting! 🎉**
