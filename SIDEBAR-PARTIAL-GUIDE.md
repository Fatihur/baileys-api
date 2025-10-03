# Sidebar Partial System - Implementation Guide

## Overview
Sistem sidebar partial telah diimplementasikan untuk menghindari duplikasi kode sidebar di setiap halaman HTML.

## Structure

### Core Files
1. **`public/sidebar.html`** - File partial yang berisi HTML sidebar
2. **`public/sidebar-loader.js`** - Script yang load sidebar ke dalam halaman
3. **`public/sidebar.js`** - Logic untuk toggle/collapse sidebar (existing)
4. **`public/sidebar-categories.css`** - Styles untuk sidebar categories

### How It Works

#### 1. Sidebar Container
Setiap halaman memiliki container kosong:
```html
<body>
  <div id="sidebar-container"></div>
  <script src="sidebar-loader.js"></script>
  <!-- rest of page content -->
</body>
```

#### 2. Automatic Loading
Script `sidebar-loader.js` akan:
- Fetch `sidebar.html` via AJAX
- Inject HTML ke dalam `#sidebar-container`
- Set active link berdasarkan current page
- Restore sidebar state dari localStorage (collapsed/expanded)

#### 3. Active Link Detection
Script otomatis mendeteksi halaman aktif dan menambahkan class `active`:
```javascript
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
```

## Files Using Sidebar Partial

✅ index.html
✅ connections.html  
✅ messages.html
✅ scheduled.html
✅ contacts.html
✅ templates.html
✅ blacklist.html
✅ history.html
✅ settings.html
✅ blast.html

❌ debug.html (intentionally excluded - special purpose)
❌ test.html (intentionally excluded - special purpose)

## How to Edit Sidebar

### Adding New Menu Item

Edit **`public/sidebar.html`** saja, tambahkan link baru:

```html
<div class="category-items">
  <a href="new-page.html" data-page="new-page">
    <i class="fas fa-icon-name"></i>
    <span>New Page</span>
  </a>
</div>
```

Perubahan akan otomatis muncul di semua halaman!

### Adding New Category

```html
<!-- New Category -->
<div class="nav-category" id="catNewCategory">
  <div class="category-header" onclick="toggleCategory('catNewCategory')" data-tooltip="New Category">
    <div class="category-title">
      <i class="fas fa-icon"></i>
      <span>New Category</span>
    </div>
    <i class="fas fa-chevron-right category-icon"></i>
  </div>
  <div class="category-items">
    <a href="page1.html" data-page="page1">
      <i class="fas fa-icon"></i>
      <span>Page 1</span>
    </a>
  </div>
</div>
```

### Changing Logo/Branding

Edit bagian logo di `public/sidebar.html`:
```html
<div class="logo">
  <i class="fab fa-whatsapp"></i>
  <h2>WA Blast</h2>
</div>
```

## Benefits

✅ **Single Source of Truth** - Edit sidebar cukup di 1 file  
✅ **Consistent** - Semua halaman pasti sama  
✅ **Easy Maintenance** - Tidak perlu edit 10+ files  
✅ **Auto Active State** - Link aktif terdeteksi otomatis  
✅ **State Persistence** - Collapsed state tersimpan di localStorage  
✅ **No Build Tool** - Pure vanilla JavaScript, no webpack/bundler  

## Technical Details

### Script Load Order
```html
<body>
  <div id="sidebar-container"></div>
  <script src="sidebar-loader.js"></script>  <!-- Load sidebar first -->
  
  <!-- Then other content -->
  
  <script src="config.js"></script>
  <script src="sidebar.js"></script>         <!-- Sidebar functionality -->
  <script src="app.js"></script>             <!-- Page-specific logic -->
</body>
```

### Error Handling
Script akan log error ke console jika:
- File `sidebar.html` tidak ditemukan
- Container `#sidebar-container` tidak ada di halaman

### Browser Compatibility
- Modern browsers dengan Fetch API support
- IE11+ (dengan polyfill untuk fetch)

## Troubleshooting

### Sidebar tidak muncul?
1. Check console untuk error
2. Pastikan `sidebar.html` ada di folder `public/`
3. Pastikan `<div id="sidebar-container"></div>` ada di HTML
4. Pastikan `sidebar-loader.js` di-load

### Active link tidak ter-highlight?
- Check `data-page` attribute di link
- Check console untuk errors di `setActiveLink()`

### State tidak tersimpan?
- Check localStorage di browser DevTools
- Check fungsi `initializeSidebarState()` di loader

## Future Improvements

Potential enhancements:
- [ ] Add loading skeleton while fetching sidebar
- [ ] Cache sidebar HTML in sessionStorage
- [ ] Support for nested sub-menus
- [ ] Breadcrumb integration
