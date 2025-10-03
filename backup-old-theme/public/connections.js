// Connections Page JavaScript

let sessions = [];
let qrCheckInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  loadSessions();
  setInterval(loadSessions, 5000); // Auto refresh
});

// Load sessions
async function loadSessions() {
  try {
    const data = await api.getAllSessions();
    sessions = data.sessions || [];
    document.getElementById('sessionCount').textContent = sessions.length;
    renderSessions();
  } catch (error) {
    console.error('Failed to load sessions:', error);
    document.getElementById('sessionsList').innerHTML = `
      <p class="text-muted" style="color: #ef4444;">
        <i class="fas fa-exclamation-triangle"></i> Gagal memuat koneksi. Pastikan API server berjalan.
      </p>
    `;
  }
}

// Render sessions
function renderSessions() {
  const container = document.getElementById('sessionsList');
  const activeConnections = storage.get('activeConnections') || {};
  
  if (sessions.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada koneksi. Klik "Tambah Koneksi" untuk memulai.</p>';
    return;
  }

  container.innerHTML = sessions.map(session => {
    const statusClass = session.status === 'connected' ? 'status-connected' : 
                       session.status === 'connecting' ? 'status-connecting' : 'status-disconnected';
    
    const statusText = session.status === 'connected' ? 'Terhubung' :
                      session.status === 'connecting' ? 'Menghubungkan' : 'Terputus';
    
    const statusColor = session.status === 'connected' ? '#10b981' :
                       session.status === 'connecting' ? '#f59e0b' : '#ef4444';
    
    const phoneNumber = session.phoneNumber || 'Tidak tersedia';
    const isActive = activeConnections[session.sessionId] !== false;

    return `
      <div class="session-card ${!isActive ? 'inactive-session' : ''}">
        <div class="session-header">
          <div class="session-info-row">
            <div class="session-status ${statusClass}"></div>
            <div class="session-details">
              <h3>${session.sessionId}</h3>
              ${session.status === 'connected' ? `
                <p class="session-phone">
                  <i class="fas fa-phone"></i> ${phoneNumber}
                </p>
              ` : ''}
            </div>
          </div>
          <div class="session-badges">
            <span class="badge" style="background: ${statusColor}20; color: ${statusColor};">${statusText}</span>
            ${session.status === 'connected' ? `
              <span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">
                ${isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            ` : ''}
          </div>
        </div>
        
        ${session.status === 'connected' ? `
          <div class="session-toggle">
            <span class="toggle-label">Status Koneksi</span>
            <div class="toggle-switch">
              <input type="checkbox" id="toggle-${session.sessionId}" ${isActive ? 'checked' : ''} 
                onchange="toggleConnection('${session.sessionId}', this.checked)">
              <label for="toggle-${session.sessionId}"></label>
            </div>
          </div>
        ` : ''}
        
        <div class="session-actions">
          ${session.status === 'connecting' ? `
            <button class="btn btn-warning btn-sm" onclick="showQRCode('${session.sessionId}')">
              <i class="fas fa-qrcode"></i> <span>Scan QR</span>
            </button>
          ` : ''}
          ${session.status === 'connected' ? `
            <button class="btn btn-success btn-sm" onclick="goToMessages('${session.sessionId}')">
              <i class="fas fa-paper-plane"></i> <span>Kirim Pesan</span>
            </button>
          ` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteSession('${session.sessionId}')">
            <i class="fas fa-trash"></i> <span>Hapus</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle connection active/inactive
function toggleConnection(sessionId, isActive) {
  const activeConnections = storage.get('activeConnections') || {};
  activeConnections[sessionId] = isActive;
  storage.save('activeConnections', activeConnections);
  
  renderSessions();
  
  showNotification(
    isActive ? `${sessionId} diaktifkan untuk blast` : `${sessionId} dinonaktifkan`,
    isActive ? 'success' : 'info'
  );
}

// Show create modal
function showCreateSessionModal() {
  document.getElementById('createSessionModal').classList.add('show');
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
  if (modalId === 'qrModal' && qrCheckInterval) {
    clearInterval(qrCheckInterval);
    qrCheckInterval = null;
  }
}

// Create session
async function createSession() {
  const sessionName = document.getElementById('sessionName').value.trim();
  const webhookUrl = document.getElementById('webhookUrl').value.trim();

  if (!sessionName) {
    showNotification('Masukkan nama koneksi', 'error');
    return;
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(sessionName)) {
    showNotification('Nama hanya boleh berisi huruf, angka, dan tanda hubung', 'error');
    return;
  }

  try {
    await api.createSession(sessionName, webhookUrl || undefined);
    showNotification('Koneksi berhasil dibuat!');
    
    closeModal('createSessionModal');
    document.getElementById('sessionName').value = '';
    document.getElementById('webhookUrl').value = '';
    
    setTimeout(() => {
      loadSessions();
      setTimeout(() => showQRCode(sessionName), 1000);
    }, 500);
  } catch (error) {
    showNotification(error.message || 'Gagal membuat koneksi', 'error');
  }
}

// Show QR Code
async function showQRCode(sessionId) {
  const modal = document.getElementById('qrModal');
  modal.classList.add('show');
  
  const qrStatus = document.getElementById('qrStatus');
  const qrContainer = document.getElementById('qrCodeContainer');
  
  qrStatus.style.display = 'block';
  qrContainer.style.display = 'none';

  const checkQR = async () => {
    try {
      const status = await api.getSessionStatus(sessionId);
      
      if (status.status === 'connected') {
        clearInterval(qrCheckInterval);
        closeModal('qrModal');
        showNotification('WhatsApp berhasil terhubung!');
        loadSessions();
        return;
      }
      
      if (status.qr) {
        qrStatus.style.display = 'none';
        qrContainer.style.display = 'block';
        document.getElementById('qrCodeImage').src = status.qr;
      }
    } catch (error) {
      console.error('Failed to check QR:', error);
      qrStatus.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ef4444;"></i>
        <p style="color: #ef4444;">Gagal memuat QR code</p>
        <button class="btn btn-primary btn-sm" onclick="showQRCode('${sessionId}')">Coba Lagi</button>
      `;
    }
  };

  checkQR();
  qrCheckInterval = setInterval(checkQR, 3000);
}

// Delete session
async function deleteSession(sessionId) {
  if (!confirm(`Hapus koneksi "${sessionId}"?`)) {
    return;
  }

  try {
    await api.deleteSession(sessionId);
    showNotification('Koneksi berhasil dihapus');
    loadSessions();
  } catch (error) {
    showNotification(error.message || 'Gagal menghapus koneksi', 'error');
  }
}

// Go to messages page
function goToMessages(sessionId) {
  sessionStorage.setItem('selectedSession', sessionId);
  window.location.href = 'messages.html';
}

// Close modal on outside click
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
    if (qrCheckInterval) {
      clearInterval(qrCheckInterval);
      qrCheckInterval = null;
    }
  }
}

// Add session card styles
if (!document.getElementById('connections-styles')) {
  const style = document.createElement('style');
  style.id = 'connections-styles';
  style.textContent = `
.session-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.session-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.1);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.session-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-card h3 {
  font-size: 18px;
  margin: 0;
}

.session-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .session-actions {
    flex-direction: column;
    width: 100%;
  }
}
`;
  document.head.appendChild(style);
}
