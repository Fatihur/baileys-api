# 📱 WhatsApp Blast - Panduan Aplikasi (Updated)

Aplikasi Web Blast WhatsApp dengan struktur yang lebih terorganisir dan responsive design.

## 🎯 Perubahan Utama

### Sebelum (Old):
- ❌ Semua fitur tercampur dalam satu halaman
- ❌ Sidebar tidak responsive
- ❌ Sulit navigate di mobile

### Sekarang (New):
- ✅ **Terpisah per fungsi**: Koneksi, Kontak, Pesan
- ✅ **Fully responsive**: Desktop, tablet, mobile
- ✅ **Mobile-friendly**: Sidebar collapse, touch-friendly buttons
- ✅ **Better UX**: Quick actions, clear navigation

---

## 📂 Struktur Menu Baru

### 1. **Dashboard** 
- Overview statistik
- Quick actions (Koneksi, Kontak, Pesan)
- Aktivitas terbaru

### 2. **Koneksi** (WhatsApp Connections)
- Tambah/hapus koneksi WhatsApp
- Scan QR code
- Monitor status koneksi
- Manage multiple accounts

### 3. **Kontak** (Contacts Management)
- Import/export CSV
- Tambah kontak manual
- Buat grup kontak
- Filter & search

### 4. **Pesan** (Send Messages)
- Pilih penerima (manual, grup, CSV)
- Tipe pesan (text, image, document)
- Preview pesan
- Progress tracking

### 5. **Template** (Message Templates)
- Simpan template pesan
- Quick use template
- Copy to clipboard

### 6. **Riwayat** (History)
- Lihat riwayat blast
- Statistik keberhasilan
- Export report

---

## 🚀 Cara Menggunakan

### A. Setup Koneksi WhatsApp

1. **Buka halaman Koneksi**
   ```
   Sidebar → Koneksi
   ```

2. **Tambah Koneksi Baru**
   - Klik "Tambah Koneksi"
   - Masukkan nama (contoh: `wa-utama`)
   - (Opsional) Masukkan webhook URL
   - Klik "Buat Koneksi"

3. **Scan QR Code**
   - Modal QR akan muncul otomatis
   - Buka WhatsApp di HP
   - Settings → Linked Devices → Link a Device
   - Scan QR code
   - Status akan berubah menjadi "Terhubung"

---

### B. Kelola Kontak

1. **Import Kontak via CSV**
   ```
   Sidebar → Kontak → Import dari CSV
   ```
   Format CSV:
   ```
   6281234567890,John Doe
   6281234567891,Jane Smith
   ```

2. **Buat Grup Kontak**
   - Klik "Buat Grup"
   - Nama grup: "Pelanggan VIP"
   - Pilih warna
   - Simpan

3. **Tambah Kontak Manual**
   - Klik "Tambah Kontak"
   - Masukkan nomor: 6281234567890
   - Nama: John Doe
   - Pilih grup (opsional)
   - Simpan

---

### C. Kirim Pesan Blast

1. **Buka halaman Pesan**
   ```
   Sidebar → Pesan
   ```

2. **Pilih Koneksi**
   - Pilih koneksi yang sudah terhubung

3. **Pilih Penerima**
   
   **Opsi 1: Input Manual**
   ```
   6281234567890
   6281234567891
   6281234567892
   ```
   
   **Opsi 2: Dari Grup Kontak**
   - Pilih "Dari Grup Kontak"
   - Pilih grup yang sudah dibuat
   
   **Opsi 3: Upload CSV**
   - Pilih "Upload CSV"
   - Upload file CSV

4. **Pilih Tipe Pesan**
   - **Text**: Pesan teks biasa
   - **Image**: Gambar + caption
   - **Document**: File PDF, Word, dll

5. **Tulis Pesan**
   - Tulis pesan Anda
   - Lihat preview di sidebar kanan
   - Gunakan variabel: `{name}`, `{number}`

6. **Set Jeda**
   - Slide untuk pilih jeda (1-10 detik)
   - Recommended: 2-5 detik

7. **Kirim**
   - Klik "Kirim Pesan Blast"
   - Lihat progress real-time
   - Tunggu sampai selesai

---

## 📱 Mobile Usage

### Navigasi di Mobile

1. **Buka Menu**
   - Tap icon **☰** di pojok kiri atas
   - Sidebar akan slide dari kiri

2. **Pilih Menu**
   - Tap menu yang diinginkan
   - Sidebar akan auto-close

3. **Gesture**
   - Swipe dari kiri: Buka sidebar
   - Tap di luar sidebar: Tutup sidebar

### Tips Mobile:

- ✅ Portrait mode recommended
- ✅ Buttons full-width untuk mudah di-tap
- ✅ Card layout stack vertikal
- ✅ Sticky header untuk quick access

---

## 🎨 Responsive Breakpoints

### Desktop (> 768px)
- Sidebar selalu visible
- Multi-column layouts
- Larger cards & buttons

### Tablet (768px - 992px)
- Sidebar collapse optional
- 2-column grids
- Medium-sized elements

### Mobile (< 768px)
- Sidebar hidden by default
- Single column layout
- Full-width buttons
- Touch-friendly spacing

---

## 💡 Fitur Baru

### 1. Quick Actions (Dashboard)
Cards besar dengan icon untuk:
- Kelola Koneksi
- Kelola Kontak
- Kirim Pesan

### 2. Contact Groups
Organisir kontak dengan grup:
- Pelanggan VIP
- Member Premium
- Leads Baru
- Custom groups dengan warna

### 3. Better Preview
- Real-time preview saat ketik
- WhatsApp-style bubble
- Image preview

### 4. Progress Tracking
- Progress bar real-time
- Logs per recipient
- Success/failed count

### 5. Mobile Optimized
- Sidebar collapse
- Touch-friendly
- Responsive grids

---

## 📊 Dashboard Metrics

### Messages Sent Today
Total pesan terkirim hari ini

### Total Contacts
Jumlah kontak yang tersimpan

### Pending Messages
Pesan dalam antrian

### Failed Messages
Pesan yang gagal terkirim

---

## 🎯 Best Practices

### Koneksi
- Gunakan nama koneksi yang jelas (wa-bisnis, wa-personal)
- Jangan logout dari HP saat blast
- Monitor status koneksi secara berkala

### Kontak
- Import CSV untuk jumlah besar
- Gunakan grup untuk segmentasi
- Backup kontak secara berkala (Export CSV)

### Pesan
- Test dengan 5-10 kontak dulu
- Gunakan delay 2-5 detik
- Variasikan pesan dengan variable
- Jangan spam dengan pesan sama

### Mobile
- Gunakan WiFi stabil
- Portrait mode untuk UX terbaik
- Swipe gesture untuk sidebar

---

## 🐛 Troubleshooting

### Sidebar tidak muncul di mobile
- Tap icon ☰ di header
- Atau swipe dari kiri layar

### QR code tidak tampil
- Refresh page
- Delete koneksi dan buat ulang
- Cek API logs

### Kontak tidak tersimpan
- Cek format nomor (62xxx)
- Clear browser cache
- Gunakan browser modern

### Pesan gagal terkirim
- Cek koneksi status (harus "Terhubung")
- Validasi nomor penerima
- Periksa koneksi internet

---

## 🔧 Development Notes

### File Structure
```
public/
├── index.html          # Dashboard
├── connections.html    # Koneksi WhatsApp
├── contacts.html       # Manajemen Kontak
├── messages.html       # Kirim Pesan
├── templates.html      # Template
├── history.html        # Riwayat
├── styles.css          # Responsive CSS
├── config.js           # API Config
├── sidebar.js          # Mobile Sidebar
├── connections.js      # Koneksi Logic
├── contacts.js         # Kontak Logic
├── messages.js         # Pesan Logic
└── app.js              # Dashboard Logic
```

### CSS Architecture
- Mobile-first approach
- Breakpoints: 768px, 992px, 1200px
- Flexbox & Grid layouts
- CSS Variables for theming

### JavaScript Modules
- Separation of concerns
- Local storage for persistence
- API wrapper functions
- Event-driven updates

---

## 🚀 Performance

### Optimization
- Lazy load images
- Debounced search
- Pagination for large lists
- Auto-refresh intervals

### Mobile Performance
- Touch events optimized
- Minimal animations
- Compressed assets
- Service worker ready

---

## 📞 Support

Jika ada masalah:
1. Cek console browser (F12)
2. Lihat network requests
3. Validate API responses
4. Test di incognito mode

---

**Happy Blasting! 🎉**
Aplikasi sekarang lebih terorganisir dan mobile-friendly!
