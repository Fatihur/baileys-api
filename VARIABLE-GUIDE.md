# 📝 Panduan Penggunaan Variabel

## 🎯 Fitur Variabel

Gunakan variabel untuk personalisasi pesan otomatis ke setiap penerima.

---

## ✨ Variabel Yang Tersedia

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `{nama}` | Nama penerima | Budi |
| `{nomor}` | Nomor telepon | 628123456789 |
| `{email}` | Email penerima | budi@email.com |
| `{custom1}` | Field custom 1 | Jakarta |
| `{custom2}` | Field custom 2 | Premium |

---

## 🖊️ Cara Menggunakan Text Editor

### 1. **Formatting Text**
- **Bold**: Pilih teks → Klik tombol **B** atau gunakan `*teks*`
- **Italic**: Pilih teks → Klik tombol _I_ atau gunakan `_teks_`
- **Strikethrough**: Pilih teks → Klik tombol ~~S~~ atau gunakan `~teks~`
- **Monospace**: Pilih teks → Klik tombol `</>` atau gunakan ` ```teks``` `

### 2. **Insert Variabel**
- Klik tombol **"Variabel"** di toolbar
- Pilih variabel yang ingin digunakan
- Variabel akan otomatis ditambahkan di posisi kursor

---

## 📋 Format Input Penerima

### **Manual Input**
```
6281234567890,Budi,budi@email.com,Jakarta,Premium
6281234567891,Ani,ani@email.com,Bandung,Basic
6281234567892
```

**Format**: `nomor,nama,email,custom1,custom2`
- Jika hanya nomor: variabel `{nama}` akan diisi "Pengguna"

### **Upload CSV**
Buat file CSV dengan format yang sama:
```csv
6281234567890,Budi,budi@email.com,Jakarta,Premium
6281234567891,Ani,ani@email.com,Bandung,Basic
6281234567892,Citra,citra@email.com,Surabaya,Gold
```

---

## 💬 Contoh Penggunaan

### **Text Message**
```
Halo {nama}! 👋

Terima kasih sudah bergabung dengan kami.
Nomor Anda: {nomor}
Email: {email}
Lokasi: {custom1}
Paket: {custom2}

Salam hangat,
Tim Marketing
```

### **Hasil untuk Budi**
```
Halo Budi! 👋

Terima kasih sudah bergabung dengan kami.
Nomor Anda: 628123456789
Email: budi@email.com
Lokasi: Jakarta
Paket: Premium

Salam hangat,
Tim Marketing
```

### **Image Caption**
```
Hi {nama}! Ini katalog produk kami. 
Khusus untuk member {custom2} 🎉
```

---

## ⚡ Tips & Trik

1. **Preview Real-time**: Lihat preview dengan data contoh sebelum kirim
2. **Mix Format**: Gabungkan plain nomor dan CSV format
3. **Caption Variables**: Variabel juga bisa digunakan di caption gambar
4. **Empty Fields**: Jika field kosong, variabel akan diganti dengan string kosong
5. **Default Nama**: Jika nama tidak diisi, akan otomatis jadi "Pengguna"

---

## 🚀 Best Practices

✅ **DO:**
- Gunakan variabel untuk personalisasi
- Test dengan 1-2 nomor dulu
- Siapkan data CSV yang lengkap
- Cek preview sebelum kirim

❌ **DON'T:**
- Jangan gunakan variabel yang tidak ada datanya
- Jangan kirim mass message tanpa test
- Jangan lupa isi nama di data kontak

---

## 🎨 WhatsApp Formatting

Formatting yang didukung WhatsApp:
- `*bold*` → **bold**
- `_italic_` → _italic_
- `~strikethrough~` → ~~strikethrough~~
- ` ```monospace``` ` → `monospace`

Gunakan toolbar untuk formatting otomatis!

---

## 📞 Troubleshooting

**Q: Variabel tidak ter-replace?**
- Pastikan format data benar (ada koma sebagai separator)
- Cek preview, harus muncul data contoh

**Q: Nama muncul "Pengguna" semua?**
- Data nama belum diisi di CSV
- Format: `nomor,nama,email,custom1,custom2`

**Q: Variabel {email} kosong?**
- Email tidak diisi di data CSV kolom ke-3
- Biarkan kosong atau isi "-"

---

Selamat mencoba! 🎉
