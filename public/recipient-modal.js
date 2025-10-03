// Recipient Modal Functions

let tempSelectedRecipients = []; // Temporary storage for modal
let tempSelectedData = [];

// Open modal
function openRecipientModal() {
  document.getElementById('recipientModal').classList.add('show');
  loadModalContacts();
  loadModalGroups();
  renderSelectedRecipients();
}

// Close modal
function closeRecipientModal() {
  document.getElementById('recipientModal').classList.remove('show');
}

// Switch tabs
function switchRecipientTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.tab-btn').classList.add('active');
  
  // Show/hide tab content
  document.getElementById('manualTab').style.display = tab === 'manual' ? 'block' : 'none';
  document.getElementById('contactsTab').style.display = tab === 'contacts' ? 'block' : 'none';
  document.getElementById('groupsTab').style.display = tab === 'groups' ? 'block' : 'none';
  document.getElementById('csvTab').style.display = tab === 'csv' ? 'block' : 'none';
}

// Add manual recipients
function addManualRecipients() {
  const text = document.getElementById('manualNumbersModal').value;
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  let added = 0;
  
  lines.forEach(line => {
    if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim());
      const number = formatPhoneNumber(parts[0]);
      
      if (number.length >= 10 && !tempSelectedRecipients.includes(number)) {
        tempSelectedRecipients.push(number);
        tempSelectedData.push({
          nomor: number,
          nama: parts[1] || 'Pengguna',
          email: parts[2] || '',
          custom1: parts[3] || '',
          custom2: parts[4] || ''
        });
        added++;
      }
    } else {
      const number = formatPhoneNumber(line);
      if (number.length >= 10 && !tempSelectedRecipients.includes(number)) {
        tempSelectedRecipients.push(number);
        tempSelectedData.push({
          nomor: number,
          nama: 'Pengguna',
          email: '',
          custom1: '',
          custom2: ''
        });
        added++;
      }
    }
  });
  
  renderSelectedRecipients();
  document.getElementById('manualNumbersModal').value = '';
  showNotification(`${added} penerima ditambahkan`);
}

// Load contacts for modal
function loadModalContacts() {
  const contacts = storage.get('contacts') || [];
  const container = document.getElementById('contactsList');
  
  if (contacts.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada kontak. Tambahkan di halaman Kontak.</p>';
    return;
  }
  
  container.innerHTML = contacts.map(contact => {
    const isSelected = tempSelectedRecipients.includes(contact.number);
    return `
      <div class="contact-item-checkbox">
        <input type="checkbox" id="contact-${contact.number}" value="${contact.number}" 
          ${isSelected ? 'checked' : ''} onchange="toggleContact('${contact.number}', '${contact.name || 'Pengguna'}', '${contact.email || ''}')">
        <label for="contact-${contact.number}">
          <div class="contact-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="contact-info">
            <strong>${contact.name || contact.number}</strong>
            <small>${contact.number}</small>
          </div>
        </label>
      </div>
    `;
  }).join('');
}

// Toggle contact selection
function toggleContact(number, name, email) {
  const index = tempSelectedRecipients.indexOf(number);
  
  if (index > -1) {
    tempSelectedRecipients.splice(index, 1);
    tempSelectedData.splice(index, 1);
  } else {
    tempSelectedRecipients.push(number);
    tempSelectedData.push({
      nomor: number,
      nama: name,
      email: email,
      custom1: '',
      custom2: ''
    });
  }
  
  renderSelectedRecipients();
}

// Load groups for modal
function loadModalGroups() {
  const groups = storage.get('contactGroups') || [];
  const contacts = storage.get('contacts') || [];
  const container = document.getElementById('groupsList');
  
  if (groups.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada grup. Buat grup di halaman Kontak.</p>';
    return;
  }
  
  container.innerHTML = groups.map(group => {
    const groupContacts = contacts.filter(c => c.group === group.id);
    const memberCount = groupContacts.length;
    
    return `
      <div class="group-item-modal">
        <div class="group-info">
          <div class="group-icon-small">
            <i class="fas fa-users"></i>
          </div>
          <div>
            <strong>${group.name}</strong>
            <small>${memberCount} kontak</small>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="selectGroup('${group.id}')">
          <i class="fas fa-plus"></i> Pilih Semua
        </button>
      </div>
    `;
  }).join('');
}

// Select all from group
function selectGroup(groupId) {
  const contacts = storage.get('contacts') || [];
  const groupContacts = contacts.filter(c => c.group === groupId);
  
  let added = 0;
  
  groupContacts.forEach(contact => {
    if (!tempSelectedRecipients.includes(contact.number)) {
      tempSelectedRecipients.push(contact.number);
      tempSelectedData.push({
        nomor: contact.number,
        nama: contact.name || 'Pengguna',
        email: contact.email || '',
        custom1: contact.custom1 || '',
        custom2: contact.custom2 || ''
      });
      added++;
    }
  });
  
  renderSelectedRecipients();
  loadModalContacts(); // Refresh to update checkboxes
  showNotification(`${added} penerima dari grup ditambahkan`);
}

// Handle CSV upload
function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    let added = 0;
    
    lines.forEach(line => {
      if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        const number = formatPhoneNumber(parts[0]);
        
        if (number.length >= 10 && !tempSelectedRecipients.includes(number)) {
          tempSelectedRecipients.push(number);
          tempSelectedData.push({
            nomor: number,
            nama: parts[1] || 'Pengguna',
            email: parts[2] || '',
            custom1: parts[3] || '',
            custom2: parts[4] || ''
          });
          added++;
        }
      } else {
        const number = formatPhoneNumber(line);
        if (number.length >= 10 && !tempSelectedRecipients.includes(number)) {
          tempSelectedRecipients.push(number);
          tempSelectedData.push({
            nomor: number,
            nama: 'Pengguna',
            email: '',
            custom1: '',
            custom2: ''
          });
          added++;
        }
      }
    });
    
    renderSelectedRecipients();
    showNotification(`${added} penerima dari CSV ditambahkan`);
    event.target.value = ''; // Reset file input
  };
  
  reader.readAsText(file);
}

// Filter contacts
function filterContacts() {
  const search = document.getElementById('contactSearch').value.toLowerCase();
  const contacts = storage.get('contacts') || [];
  const container = document.getElementById('contactsList');
  
  const filtered = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(search) || 
    c.number.includes(search)
  );
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-muted">Tidak ada kontak ditemukan</p>';
    return;
  }
  
  container.innerHTML = filtered.map(contact => {
    const isSelected = tempSelectedRecipients.includes(contact.number);
    return `
      <div class="contact-item-checkbox">
        <input type="checkbox" id="contact-${contact.number}" value="${contact.number}" 
          ${isSelected ? 'checked' : ''} onchange="toggleContact('${contact.number}', '${contact.name || 'Pengguna'}', '${contact.email || ''}')">
        <label for="contact-${contact.number}">
          <div class="contact-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="contact-info">
            <strong>${contact.name || contact.number}</strong>
            <small>${contact.number}</small>
          </div>
        </label>
      </div>
    `;
  }).join('');
}

// Render selected recipients in modal
function renderSelectedRecipients() {
  const container = document.getElementById('selectedRecipientsList');
  const count = tempSelectedRecipients.length;
  
  document.getElementById('selectedCount').textContent = count;
  document.getElementById('confirmCount').textContent = count;
  
  if (count === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada penerima dipilih</p>';
    return;
  }
  
  container.innerHTML = tempSelectedRecipients.map((number, index) => {
    const data = tempSelectedData[index];
    return `
      <div class="selected-item">
        <div>
          <strong>${data.nama}</strong>
          <small>${number}</small>
        </div>
        <button class="btn-remove" onclick="removeRecipient('${number}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');
}

// Remove recipient
function removeRecipient(number) {
  const index = tempSelectedRecipients.indexOf(number);
  if (index > -1) {
    tempSelectedRecipients.splice(index, 1);
    tempSelectedData.splice(index, 1);
  }
  
  renderSelectedRecipients();
  loadModalContacts(); // Refresh checkboxes
}

// Clear all recipients
function clearAllRecipients() {
  if (tempSelectedRecipients.length === 0) return;
  
  if (confirm('Hapus semua penerima yang dipilih?')) {
    tempSelectedRecipients = [];
    tempSelectedData = [];
    renderSelectedRecipients();
    loadModalContacts();
    showNotification('Semua penerima dihapus');
  }
}

// Confirm recipients (apply to main form)
function confirmRecipients() {
  // Update both local and global references
  recipients = [...tempSelectedRecipients];
  recipientsData = [...tempSelectedData];
  
  // Update window global variables
  window.recipients = recipients;
  window.recipientsData = recipientsData;
  
  updateRecipientsList();
  
  // Update button count
  document.getElementById('recipientCountBtn').textContent = recipients.length;
  
  closeRecipientModal();
  showNotification(`${recipients.length} penerima dikonfirmasi`, 'success');
}

// Initialize temp from current recipients
document.addEventListener('DOMContentLoaded', () => {
  // When modal opens, copy current recipients to temp
  if (window.recipients && window.recipientsData) {
    tempSelectedRecipients = [...recipients];
    tempSelectedData = [...recipientsData];
  }
});
