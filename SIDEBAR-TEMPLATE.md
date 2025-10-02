# Collapsible Sidebar Template

Use this template for all HTML pages:

## Head Section:
```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="sidebar-categories.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

## Sidebar HTML:
```html
<div class="sidebar">
  <div class="logo">
    <i class="fab fa-whatsapp"></i>
    <h2>WA Blast</h2>
  </div>
  <button class="sidebar-toggle" onclick="toggleSidebar()">
    <i class="fas fa-bars"></i>
  </button>
  <nav>
    <!-- Main -->
    <div class="nav-category" id="catMain">
      <div class="category-header" onclick="toggleCategory('catMain')" data-tooltip="Main">
        <div class="category-title">
          <i class="fas fa-home"></i>
          <span>Main</span>
        </div>
        <i class="fas fa-chevron-right category-icon"></i>
      </div>
      <div class="category-items">
        <a href="index.html">
          <i class="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </a>
      </div>
    </div>

    <!-- WhatsApp -->
    <div class="nav-category" id="catWhatsApp">
      <div class="category-header" onclick="toggleCategory('catWhatsApp')" data-tooltip="WhatsApp">
        <div class="category-title">
          <i class="fab fa-whatsapp"></i>
          <span>WhatsApp</span>
        </div>
        <i class="fas fa-chevron-right category-icon"></i>
      </div>
      <div class="category-items">
        <a href="connections.html">
          <i class="fas fa-link"></i>
          <span>Koneksi</span>
        </a>
        <a href="messages.html">
          <i class="fas fa-paper-plane"></i>
          <span>Kirim Pesan</span>
        </a>
        <a href="scheduled.html">
          <i class="fas fa-clock"></i>
          <span>Scheduled</span>
        </a>
      </div>
    </div>

    <!-- Management -->
    <div class="nav-category" id="catManagement">
      <div class="category-header" onclick="toggleCategory('catManagement')" data-tooltip="Management">
        <div class="category-title">
          <i class="fas fa-tasks"></i>
          <span>Management</span>
        </div>
        <i class="fas fa-chevron-right category-icon"></i>
      </div>
      <div class="category-items">
        <a href="contacts.html">
          <i class="fas fa-address-book"></i>
          <span>Kontak</span>
        </a>
        <a href="templates.html">
          <i class="fas fa-file-alt"></i>
          <span>Template</span>
        </a>
        <a href="blacklist.html">
          <i class="fas fa-ban"></i>
          <span>Blacklist</span>
        </a>
      </div>
    </div>

    <!-- Reports -->
    <div class="nav-category" id="catReports">
      <div class="category-header" onclick="toggleCategory('catReports')" data-tooltip="Reports">
        <div class="category-title">
          <i class="fas fa-chart-line"></i>
          <span>Reports</span>
        </div>
        <i class="fas fa-chevron-right category-icon"></i>
      </div>
      <div class="category-items">
        <a href="history.html">
          <i class="fas fa-history"></i>
          <span>Riwayat</span>
        </a>
      </div>
    </div>

    <!-- System -->
    <div class="nav-category" id="catSystem">
      <div class="category-header" onclick="toggleCategory('catSystem')" data-tooltip="System">
        <div class="category-title">
          <i class="fas fa-cog"></i>
          <span>System</span>
        </div>
        <i class="fas fa-chevron-right category-icon"></i>
      </div>
      <div class="category-items">
        <a href="settings.html">
          <i class="fas fa-sliders-h"></i>
          <span>Settings</span>
        </a>
      </div>
    </div>
  </nav>
</div>
```

## Before </body>:
```html
<script src="sidebar.js"></script>
```

## Categories:
1. **Main** - Dashboard
2. **WhatsApp** - Connections, Messages, Scheduled
3. **Management** - Contacts, Templates, Blacklist
4. **Reports** - History
5. **System** - Settings

## Features:
- Click category header to expand/collapse
- State saved to localStorage
- Auto-highlights current page
- Smooth animations
- Mobile responsive
- Tooltips on hover when collapsed
