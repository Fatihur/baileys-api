// Contacts Management JavaScript

let contacts = [];
let groups = [];
let filteredContacts = [];

document.addEventListener('DOMContentLoaded', () => {
  loadContacts();
  loadGroups();
  setupSearch();
});

// Load contacts
function loadContacts() {
  contacts = storage.get('contacts') || [];
  filteredContacts = [...contacts];
  updateContactStats();
  renderContacts();
  updateGroupFilter();
}

// Load groups
function loadGroups() {
  groups = storage.get('contactGroups') || [];
  renderGroups();
  updateGroupSelects();
}

// Update stats
function updateContactStats() {
  document.getElementById('totalContacts').textContent = contacts.length;
  document.getElementById('totalGroups').textContent = groups.length;
}

// Render contacts
function renderContacts() {
  const container = document.getElementById('contactsList');
  
  console.log('📋 Rendering contacts:', filteredContacts.length);
  
  if (filteredContacts.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada kontak.</p>';
    return;
  }

  const tableHTML = `
    <table class="contacts-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Nomor</th>
          <th>Grup</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        ${filteredContacts.map(contact => `
          <tr>
            <td>${contact.name || '-'}</td>
            <td>${contact.number}</td>
            <td>${contact.group ? `<span class="badge badge-primary">${getGroupName(contact.group)}</span>` : '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editContact('${contact.id}')" style="margin-right: 5px;" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteContact('${contact.id}')" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

// Render groups
function renderGroups() {
  const container = document.getElementById('groupsList');
  
  console.log('📊 Rendering groups:', groups);
  console.log('📋 All contacts:', contacts);
  
  if (groups.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada grup.</p>';
    return;
  }

  container.innerHTML = groups.map(group => {
    const groupContacts = contacts.filter(c => c.group === group.id);
    const count = groupContacts.length;
    console.log(`✅ Group "${group.name}" (ID: ${group.id}): ${count} contacts`, groupContacts);
    
    return `
      <div class="group-card" style="background: ${group.color};" onclick="filterByGroup('${group.id}')">
        <div class="group-card-content">
          <h4>${group.name}</h4>
          <p>${count} kontak</p>
        </div>
        <div class="group-card-actions">
          <button class="btn-icon" onclick="event.stopPropagation(); editGroup('${group.id}')" title="Edit Grup">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" onclick="event.stopPropagation(); deleteGroup('${group.id}')" title="Hapus Grup">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Import CSV
function handleImportCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    let imported = 0;
    lines.forEach(line => {
      const parts = line.split(',');
      const number = formatPhoneNumber(parts[0]);
      const name = parts[1] || '';
      
      if (number && number.length >= 10) {
        const exists = contacts.find(c => c.number === number);
        if (!exists) {
          contacts.push({
            id: Date.now() + Math.random(),
            number,
            name,
            group: null,
            createdAt: new Date().toISOString()
          });
          imported++;
        }
      }
    });

    storage.save('contacts', contacts);
    console.log('📥 Imported', imported, 'contacts');
    loadContacts();
    loadGroups();
    showNotification(`Berhasil import ${imported} kontak`);
  };

  reader.readAsText(file);
}

// Export CSV
function exportContactsCSV() {
  if (contacts.length === 0) {
    showNotification('Tidak ada kontak untuk di-export', 'error');
    return;
  }

  const csv = contacts.map(c => `${c.number},${c.name || ''}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contacts_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showNotification('Kontak berhasil di-export');
}

// Modals
function showAddContactModal() {
  // Reset editing state if opening fresh
  if (!window.editingContactId) {
    document.getElementById('contactNumber').value = '';
    document.getElementById('contactName').value = '';
    document.getElementById('contactGroup').value = '';
    
    const modal = document.getElementById('addContactModal');
    const title = modal.querySelector('h2');
    if (title) title.textContent = 'Tambah Kontak';
  }
  
  document.getElementById('addContactModal').classList.add('show');
}

function showCreateGroupModal() {
  // Reset editing state if opening fresh
  if (!window.editingGroupId) {
    document.getElementById('groupName').value = '';
    document.getElementById('groupColor').value = '#667eea';
    
    const modal = document.getElementById('createGroupModal');
    const title = modal.querySelector('h2');
    if (title) title.textContent = 'Buat Grup Baru';
  }
  
  document.getElementById('createGroupModal').classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
  
  // Reset editing state when closing
  if (modalId === 'addContactModal') {
    window.editingContactId = null;
    const modal = document.getElementById('addContactModal');
    const title = modal.querySelector('h2');
    if (title) title.textContent = 'Tambah Kontak';
  }
  
  if (modalId === 'createGroupModal') {
    window.editingGroupId = null;
    const modal = document.getElementById('createGroupModal');
    const title = modal.querySelector('h2');
    if (title) title.textContent = 'Buat Grup Baru';
  }
}

// Save contact
function saveContact() {
  const number = formatPhoneNumber(document.getElementById('contactNumber').value);
  const name = document.getElementById('contactName').value.trim();
  const group = document.getElementById('contactGroup').value;

  if (!number || number.length < 10) {
    showNotification('Nomor tidak valid', 'error');
    return;
  }

  // Check if editing
  if (window.editingContactId) {
    // Update existing contact
    const index = contacts.findIndex(c => c.id == window.editingContactId);
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        number,
        name,
        group: group || null
      };
      console.log('✏️ Contact updated:', contacts[index]);
      
      storage.save('contacts', contacts);
      loadContacts();
      loadGroups();
      closeModal('addContactModal');
      
      // Reset editing state
      window.editingContactId = null;
      const modal = document.getElementById('addContactModal');
      const title = modal.querySelector('h2');
      if (title) title.textContent = 'Tambah Kontak';
      
      // Clear form
      document.getElementById('contactNumber').value = '';
      document.getElementById('contactName').value = '';
      document.getElementById('contactGroup').value = '';
      
      showNotification('Kontak berhasil diupdate');
      return;
    }
  }

  // Check duplicate (only for new contact)
  const exists = contacts.find(c => c.number === number);
  if (exists) {
    showNotification('Nomor sudah ada', 'error');
    return;
  }

  // Add new contact
  const newContact = {
    id: Date.now(),
    number,
    name,
    group: group || null,
    createdAt: new Date().toISOString()
  };
  
  contacts.push(newContact);
  console.log('➕ New contact added:', newContact);

  storage.save('contacts', contacts);
  loadContacts();
  loadGroups();
  closeModal('addContactModal');
  
  document.getElementById('contactNumber').value = '';
  document.getElementById('contactName').value = '';
  document.getElementById('contactGroup').value = '';
  
  showNotification('Kontak berhasil ditambahkan');
}

// Save group
function saveGroup() {
  const name = document.getElementById('groupName').value.trim();
  const color = document.getElementById('groupColor').value;

  if (!name) {
    showNotification('Masukkan nama grup', 'error');
    return;
  }

  // Check if editing
  if (window.editingGroupId) {
    // Update existing group
    const index = groups.findIndex(g => g.id == window.editingGroupId);
    if (index !== -1) {
      groups[index] = {
        ...groups[index],
        name,
        color
      };
      console.log('✏️ Group updated:', groups[index]);
      
      storage.save('contactGroups', groups);
      loadGroups();
      closeModal('createGroupModal');
      
      // Reset editing state
      window.editingGroupId = null;
      const modal = document.getElementById('createGroupModal');
      const title = modal.querySelector('h2');
      if (title) title.textContent = 'Buat Grup Baru';
      
      // Clear form
      document.getElementById('groupName').value = '';
      document.getElementById('groupColor').value = '#667eea';
      
      showNotification('Grup berhasil diupdate');
      return;
    }
  }

  // Add new group
  const newGroup = {
    id: Date.now(),
    name,
    color,
    createdAt: new Date().toISOString()
  };
  
  groups.push(newGroup);
  console.log('➕ New group created:', newGroup);

  storage.save('contactGroups', groups);
  loadGroups();
  closeModal('createGroupModal');
  
  document.getElementById('groupName').value = '';
  
  showNotification('Grup berhasil dibuat');
}

// Edit group
function editGroup(id) {
  const group = groups.find(g => g.id == id);
  if (!group) return;
  
  console.log('✏️ Editing group:', group);
  
  // Fill form with existing data
  document.getElementById('groupName').value = group.name;
  document.getElementById('groupColor').value = group.color || '#667eea';
  
  // Store editing ID
  window.editingGroupId = id;
  
  // Change modal title
  const modal = document.getElementById('createGroupModal');
  const title = modal.querySelector('h2');
  if (title) title.textContent = 'Edit Grup';
  
  showCreateGroupModal();
}

// Delete group
function deleteGroup(id) {
  console.log('🗑️ Deleting group ID:', id);
  
  const group = groups.find(g => g.id == id);
  if (!group) return;
  
  // Check if group has contacts
  const groupContacts = contacts.filter(c => c.group == id);
  
  if (groupContacts.length > 0) {
    const confirmMsg = `Grup "${group.name}" memiliki ${groupContacts.length} kontak. Hapus grup ini? (Kontak tidak akan dihapus, hanya grup-nya)`;
    if (!confirm(confirmMsg)) return;
    
    // Remove group from contacts
    contacts.forEach(c => {
      if (c.group == id) {
        c.group = null;
      }
    });
    storage.save('contacts', contacts);
  } else {
    if (!confirm(`Hapus grup "${group.name}"?`)) return;
  }
  
  const beforeCount = groups.length;
  groups = groups.filter(g => g.id != id);
  const afterCount = groups.length;
  
  console.log(`Deleted: ${beforeCount} → ${afterCount} groups`);
  
  storage.save('contactGroups', groups);
  loadContacts();
  loadGroups();
  showNotification('Grup berhasil dihapus');
}

// Edit contact
function editContact(id) {
  const contact = contacts.find(c => c.id == id);
  if (!contact) return;
  
  console.log('✏️ Editing contact:', contact);
  
  // Fill form with existing data
  document.getElementById('contactNumber').value = contact.number;
  document.getElementById('contactName').value = contact.name || '';
  document.getElementById('contactGroup').value = contact.group || '';
  
  // Store editing ID
  window.editingContactId = id;
  
  // Change button text
  const modal = document.getElementById('addContactModal');
  const title = modal.querySelector('h2');
  if (title) title.textContent = 'Edit Kontak';
  
  showAddContactModal();
}

// Delete contact
function deleteContact(id) {
  console.log('🗑️ Deleting contact ID:', id);
  
  if (!confirm('Hapus kontak ini?')) return;
  
  const beforeCount = contacts.length;
  contacts = contacts.filter(c => c.id != id);
  const afterCount = contacts.length;
  
  console.log(`Deleted: ${beforeCount} → ${afterCount}`);
  
  storage.save('contacts', contacts);
  loadContacts();
  loadGroups();
  showNotification('Kontak berhasil dihapus');
}

// Filter
function filterContacts() {
  const groupFilter = document.getElementById('filterGroup').value;
  
  if (!groupFilter) {
    filteredContacts = [...contacts];
  } else {
    filteredContacts = contacts.filter(c => c.group == groupFilter);
  }
  
  renderContacts();
}

function filterByGroup(groupId) {
  document.getElementById('filterGroup').value = groupId;
  filterContacts();
}

// Search
function setupSearch() {
  const searchInput = document.getElementById('searchContact');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filteredContacts = contacts.filter(c => 
      c.number.includes(query) || 
      (c.name && c.name.toLowerCase().includes(query))
    );
    renderContacts();
  });
}

// Helpers
function getGroupName(groupId) {
  const group = groups.find(g => g.id == groupId);
  return group ? group.name : 'Unknown';
}

function updateGroupFilter() {
  const select = document.getElementById('filterGroup');
  select.innerHTML = '<option value="">Semua Grup</option>' +
    groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
}

function updateGroupSelects() {
  const selects = ['contactGroup'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = '<option value="">Tanpa Grup</option>' +
        groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    }
  });
}

function downloadSampleCSV() {
  const csv = '6281234567890,John Doe\n6281234567891,Jane Smith\n6281234567892,Bob Johnson';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_contacts.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Styles
if (!document.getElementById('contacts-styles')) {
  const style = document.createElement('style');
  style.id = 'contacts-styles';
  style.textContent = `
.contacts-table {
  width: 100%;
  border-collapse: collapse;
}

.contacts-table th {
  text-align: left;
  padding: 12px;
  background: var(--light);
  font-weight: 600;
  border-bottom: 2px solid var(--border);
}

.contacts-table td {
  padding: 15px 12px;
  border-bottom: 1px solid var(--border);
}

.contacts-table tr:hover {
  background: var(--light);
}

.group-card {
  position: relative;
  cursor: pointer;
}

.group-card-content {
  flex: 1;
}

.group-card h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.group-card p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.group-card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.group-card:hover .group-card-actions {
  opacity: 1;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-icon:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.btn-icon:active {
  transform: scale(0.95);
}
`;
  document.head.appendChild(style);
}
