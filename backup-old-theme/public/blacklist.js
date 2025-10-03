// Blacklist & Whitelist Management

let blacklist = [];
let whitelist = [];
let filteredBlacklist = [];
let filteredWhitelist = [];

document.addEventListener('DOMContentLoaded', () => {
  loadBlacklist();
  loadWhitelist();
  updateStats();
});

// Load blacklist
function loadBlacklist() {
  blacklist = storage.get('blacklist') || [];
  filteredBlacklist = [...blacklist];
  renderBlacklist();
}

// Load whitelist
function loadWhitelist() {
  whitelist = storage.get('whitelist') || [];
  filteredWhitelist = [...whitelist];
  renderWhitelist();
}

// Update stats
function updateStats() {
  document.getElementById('blacklistCount').textContent = blacklist.length;
  document.getElementById('whitelistCount').textContent = whitelist.length;
  document.getElementById('protectedCount').textContent = blacklist.length + whitelist.length;
}

// Render blacklist table
function renderBlacklist() {
  const container = document.getElementById('blacklistTable');
  
  if (filteredBlacklist.length === 0) {
    container.innerHTML = '<p class="text-muted">Blacklist kosong. Nomor yang ditambahkan tidak akan menerima blast.</p>';
    return;
  }

  const tableHTML = `
    <table class="list-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Phone Number</th>
          <th>Reason</th>
          <th>Added Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filteredBlacklist.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${item.number}</strong></td>
            <td>${item.reason || '-'}</td>
            <td>${item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '-'}</td>
            <td>
              <button class="btn btn-sm btn-danger" onclick="removeFromBlacklist('${item.number}')" title="Remove">
                <i class="fas fa-trash"></i>
              </button>
              <button class="btn btn-sm btn-success" onclick="moveToWhitelist('${item.number}')" title="Move to Whitelist">
                <i class="fas fa-arrow-right"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

// Render whitelist table
function renderWhitelist() {
  const container = document.getElementById('whitelistTable');
  
  if (filteredWhitelist.length === 0) {
    container.innerHTML = '<p class="text-muted">Whitelist kosong. Nomor priority akan ditambahkan di sini.</p>';
    return;
  }

  const tableHTML = `
    <table class="list-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Phone Number</th>
          <th>Note</th>
          <th>Added Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filteredWhitelist.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${item.number}</strong></td>
            <td>${item.note || '-'}</td>
            <td>${item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '-'}</td>
            <td>
              <button class="btn btn-sm btn-danger" onclick="removeFromWhitelist('${item.number}')" title="Remove">
                <i class="fas fa-trash"></i>
              </button>
              <button class="btn btn-sm btn-warning" onclick="moveToBlacklist('${item.number}')" title="Move to Blacklist">
                <i class="fas fa-arrow-left"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

// Show modals
function showAddBlacklistModal() {
  document.getElementById('addBlacklistModal').classList.add('show');
  document.getElementById('blacklistNumber').value = '';
  document.getElementById('blacklistReason').value = '';
  document.getElementById('blacklistNumber').focus();
}

function showAddWhitelistModal() {
  document.getElementById('addWhitelistModal').classList.add('show');
  document.getElementById('whitelistNumber').value = '';
  document.getElementById('whitelistNote').value = '';
  document.getElementById('whitelistNumber').focus();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

// Add to blacklist
function addToBlacklist() {
  const number = formatPhoneNumber(document.getElementById('blacklistNumber').value);
  const reason = document.getElementById('blacklistReason').value.trim();
  
  if (!number || number.length < 10) {
    showNotification('Masukkan nomor yang valid', 'error');
    return;
  }
  
  // Check if already in blacklist
  if (blacklist.find(item => item.number === number)) {
    showNotification('Nomor sudah ada di blacklist', 'error');
    return;
  }
  
  // Remove from whitelist if exists
  if (whitelist.find(item => item.number === number)) {
    whitelist = whitelist.filter(item => item.number !== number);
    storage.save('whitelist', whitelist);
  }
  
  blacklist.push({
    number,
    reason: reason || 'No reason provided',
    addedAt: new Date().toISOString()
  });
  
  storage.save('blacklist', blacklist);
  loadBlacklist();
  loadWhitelist();
  updateStats();
  closeModal('addBlacklistModal');
  showNotification(`${number} ditambahkan ke blacklist`, 'success');
}

// Add to whitelist
function addToWhitelist() {
  const number = formatPhoneNumber(document.getElementById('whitelistNumber').value);
  const note = document.getElementById('whitelistNote').value.trim();
  
  if (!number || number.length < 10) {
    showNotification('Masukkan nomor yang valid', 'error');
    return;
  }
  
  // Check if already in whitelist
  if (whitelist.find(item => item.number === number)) {
    showNotification('Nomor sudah ada di whitelist', 'error');
    return;
  }
  
  // Remove from blacklist if exists
  if (blacklist.find(item => item.number === number)) {
    blacklist = blacklist.filter(item => item.number !== number);
    storage.save('blacklist', blacklist);
  }
  
  whitelist.push({
    number,
    note: note || 'VIP Contact',
    addedAt: new Date().toISOString()
  });
  
  storage.save('whitelist', whitelist);
  loadBlacklist();
  loadWhitelist();
  updateStats();
  closeModal('addWhitelistModal');
  showNotification(`${number} ditambahkan ke whitelist`, 'success');
}

// Remove from blacklist
function removeFromBlacklist(number) {
  if (!confirm(`Hapus ${number} dari blacklist?`)) return;
  
  blacklist = blacklist.filter(item => item.number !== number);
  storage.save('blacklist', blacklist);
  loadBlacklist();
  updateStats();
  showNotification(`${number} dihapus dari blacklist`, 'success');
}

// Remove from whitelist
function removeFromWhitelist(number) {
  if (!confirm(`Hapus ${number} dari whitelist?`)) return;
  
  whitelist = whitelist.filter(item => item.number !== number);
  storage.save('whitelist', whitelist);
  loadWhitelist();
  updateStats();
  showNotification(`${number} dihapus dari whitelist`, 'success');
}

// Move to whitelist
function moveToWhitelist(number) {
  const item = blacklist.find(i => i.number === number);
  if (!item) return;
  
  // Remove from blacklist
  blacklist = blacklist.filter(i => i.number !== number);
  storage.save('blacklist', blacklist);
  
  // Add to whitelist
  whitelist.push({
    number: item.number,
    note: `Moved from blacklist: ${item.reason}`,
    addedAt: new Date().toISOString()
  });
  storage.save('whitelist', whitelist);
  
  loadBlacklist();
  loadWhitelist();
  updateStats();
  showNotification(`${number} dipindahkan ke whitelist`, 'success');
}

// Move to blacklist
function moveToBlacklist(number) {
  const item = whitelist.find(i => i.number === number);
  if (!item) return;
  
  // Remove from whitelist
  whitelist = whitelist.filter(i => i.number !== number);
  storage.save('whitelist', whitelist);
  
  // Add to blacklist
  blacklist.push({
    number: item.number,
    reason: `Moved from whitelist: ${item.note}`,
    addedAt: new Date().toISOString()
  });
  storage.save('blacklist', blacklist);
  
  loadBlacklist();
  loadWhitelist();
  updateStats();
  showNotification(`${number} dipindahkan ke blacklist`, 'success');
}

// Filter blacklist
function filterBlacklist() {
  const search = document.getElementById('searchBlacklist').value.toLowerCase();
  filteredBlacklist = blacklist.filter(item => 
    item.number.includes(search) || 
    (item.reason && item.reason.toLowerCase().includes(search))
  );
  renderBlacklist();
}

// Filter whitelist
function filterWhitelist() {
  const search = document.getElementById('searchWhitelist').value.toLowerCase();
  filteredWhitelist = whitelist.filter(item => 
    item.number.includes(search) || 
    (item.note && item.note.toLowerCase().includes(search))
  );
  renderWhitelist();
}

// Import blacklist from CSV
function importBlacklist(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    let imported = 0;
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      const number = formatPhoneNumber(parts[0]);
      const reason = parts[1] || 'Imported from CSV';
      
      if (number && number.length >= 10) {
        // Check if not already in blacklist
        if (!blacklist.find(item => item.number === number)) {
          blacklist.push({
            number,
            reason,
            addedAt: new Date().toISOString()
          });
          imported++;
        }
      }
    });
    
    storage.save('blacklist', blacklist);
    loadBlacklist();
    updateStats();
    showNotification(`${imported} nomor diimport ke blacklist`, 'success');
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

// Import whitelist from CSV
function importWhitelist(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    let imported = 0;
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      const number = formatPhoneNumber(parts[0]);
      const note = parts[1] || 'Imported from CSV';
      
      if (number && number.length >= 10) {
        // Check if not already in whitelist
        if (!whitelist.find(item => item.number === number)) {
          whitelist.push({
            number,
            note,
            addedAt: new Date().toISOString()
          });
          imported++;
        }
      }
    });
    
    storage.save('whitelist', whitelist);
    loadWhitelist();
    updateStats();
    showNotification(`${imported} nomor diimport ke whitelist`, 'success');
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

// Export blacklist
function exportBlacklist() {
  if (blacklist.length === 0) {
    showNotification('Blacklist kosong', 'error');
    return;
  }
  
  const csv = blacklist.map(item => `${item.number},${item.reason || ''}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blacklist_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showNotification('Blacklist berhasil di-export', 'success');
}

// Export whitelist
function exportWhitelist() {
  if (whitelist.length === 0) {
    showNotification('Whitelist kosong', 'error');
    return;
  }
  
  const csv = whitelist.map(item => `${item.number},${item.note || ''}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whitelist_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showNotification('Whitelist berhasil di-export', 'success');
}

// Styles
if (!document.getElementById('blacklist-styles')) {
  const style = document.createElement('style');
  style.id = 'blacklist-styles';
  style.textContent = `
.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.list-table {
  width: 100%;
  border-collapse: collapse;
}

.list-table th {
  text-align: left;
  padding: 12px;
  background: var(--light);
  font-weight: 600;
  border-bottom: 2px solid var(--border);
  font-size: 13px;
}

.list-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.list-table tr:hover {
  background: var(--light);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  text-align: center;
  padding: 20px;
  background: var(--light);
  border-radius: 12px;
}

.info-item i {
  font-size: 48px;
  margin-bottom: 15px;
}

.info-item h4 {
  margin: 10px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.info-item p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.info-card {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .list-grid {
    grid-template-columns: 1fr;
  }
  
  .list-table {
    font-size: 12px;
  }
  
  .list-table th,
  .list-table td {
    padding: 8px;
  }
}
`;
  document.head.appendChild(style);
}
