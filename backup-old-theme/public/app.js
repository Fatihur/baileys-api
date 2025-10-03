// Dashboard Page JavaScript

let sessions = [];
let activeConnections = storage.get('activeConnections') || {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard loaded');
  console.log('API Config:', API_CONFIG);
  loadSessions();
  loadStats();
  loadContactGroups();
  loadRecentActivity();
  setInterval(loadSessions, 5000); // Refresh every 5 seconds
  setInterval(loadContactGroups, 3000); // Refresh groups
});

// Load all sessions
async function loadSessions() {
  try {
    console.log('Loading sessions from:', API_CONFIG.baseURL + '/api/sessions');
    const data = await api.getAllSessions();
    console.log('Sessions data:', data);
    sessions = data.sessions || [];
    renderActiveConnections();
  } catch (error) {
    console.error('Failed to load sessions:', error);
    document.getElementById('activeConnections').innerHTML = `
      <p class="text-muted" style="color: #ef4444;">
        <i class="fas fa-exclamation-triangle"></i> Gagal memuat koneksi
      </p>
    `;
  }
}

// Render active connections (Read-only display)
function renderActiveConnections() {
  const container = document.getElementById('activeConnections');
  const activeConnections = storage.get('activeConnections') || {};
  const connectedSessions = sessions.filter(s => s.status === 'connected');
  
  if (connectedSessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-plug" style="font-size: 48px; color: #ccc;"></i>
        <p>Belum ada koneksi aktif</p>
        <a href="connections.html" class="btn btn-primary btn-sm">
          <i class="fas fa-plus"></i> Tambah Koneksi
        </a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = connectedSessions.map(session => {
    const isActive = activeConnections[session.sessionId] !== false;
    const phoneNumber = session.phoneNumber || session.sessionId;
    
    return `
      <div class="connection-item">
        <div class="connection-info">
          <div class="connection-avatar">
            <i class="fab fa-whatsapp"></i>
          </div>
          <div class="connection-details">
            <h4>${session.sessionId}</h4>
            <p><i class="fas fa-phone"></i> ${phoneNumber}</p>
          </div>
        </div>
        <div class="connection-controls">
          <span class="connection-status ${isActive ? 'active' : 'inactive'}">
            ${isActive ? 'Aktif' : 'Nonaktif'}
          </span>
          <a href="connections.html" class="btn btn-sm btn-secondary">
            <i class="fas fa-cog"></i> Kelola
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// Load contact groups
function loadContactGroups() {
  const groups = storage.get('contactGroups') || [];
  const contacts = storage.get('contacts') || [];
  const container = document.getElementById('contactGroups');
  
  if (groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users" style="font-size: 48px; color: #ccc;"></i>
        <p>Belum ada grup kontak</p>
        <a href="contacts.html" class="btn btn-primary btn-sm">
          <i class="fas fa-plus"></i> Buat Grup
        </a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = groups.map(group => {
    const memberCount = contacts.filter(c => c.group === group.id).length;
    
    return `
      <div class="group-card">
        <div class="group-icon">
          <i class="fas fa-users"></i>
        </div>
        <h4>${group.name}</h4>
        <p>${memberCount} kontak</p>
        <a href="contacts.html" class="btn btn-sm btn-secondary">
          <i class="fas fa-edit"></i> Kelola
        </a>
      </div>
    `;
  }).join('');
}

// Load stats
function loadStats() {
  const stats = storage.get('stats') || {
    totalSent: 0,
    totalContacts: 0,
    totalPending: 0,
    totalFailed: 0
  };

  document.getElementById('totalSent').textContent = stats.totalSent;
  document.getElementById('totalContacts').textContent = stats.totalContacts;
  document.getElementById('totalPending').textContent = stats.totalPending;
  document.getElementById('totalFailed').textContent = stats.totalFailed;
}

// Load recent activity
function loadRecentActivity() {
  const history = storage.get('blastHistory') || [];
  const container = document.getElementById('recentActivity');
  
  if (history.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada aktivitas</p>';
    return;
  }
  
  const recent = history.slice(0, 5);
  container.innerHTML = recent.map(item => {
    const date = new Date(item.date);
    return `
      <div class="activity-item">
        <i class="fas fa-paper-plane"></i>
        <div>
          <strong>${item.sessionId}</strong> - ${item.sent}/${item.total} terkirim
          <br>
          <small>${date.toLocaleString()}</small>
        </div>
      </div>
    `;
  }).join('');
}

// Notification helper
function showNotification(message, type = 'info') {
  // Use existing notification system or create simple one
  const notif = document.createElement('div');
  notif.className = `notification notification-${type}`;
  notif.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  notif.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; animation: slideInRight 0.3s;';
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.remove();
  }, 3000);
}
