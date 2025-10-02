// Messages Page JavaScript

let recipients = [];
let currentMessageType = 'text';
let uploadedImageFile = null;
let uploadedDocumentFile = null;
let recipientsData = []; // Store full recipient data with variables

document.addEventListener('DOMContentLoaded', () => {
  loadSessions();
  setupListeners();
  updateCharCount();
  updatePreview();
  
  // Initialize recipient count button
  updateRecipientCountBtn();
  
  // Update daily limit when session changes
  document.getElementById('sessionSelect')?.addEventListener('change', showDailyLimitStatus);
  
  // Close variable menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.variable-dropdown')) {
      const menu = document.getElementById('variableMenu');
      if (menu) menu.style.display = 'none';
    }
  });
  
  // Auto-select session from storage OR select first active connection
  const savedSession = sessionStorage.getItem('selectedSession');
  if (savedSession) {
    setTimeout(() => {
      document.getElementById('sessionSelect').value = savedSession;
      showDailyLimitStatus();
      sessionStorage.removeItem('selectedSession');
    }, 500);
  } else {
    // Auto-select first active connection
    setTimeout(() => {
      autoSelectActiveConnection();
      showDailyLimitStatus();
    }, 1000);
  }
});

// Update recipient count button
function updateRecipientCountBtn() {
  const btn = document.getElementById('recipientCountBtn');
  if (btn) {
    btn.textContent = recipients.length;
  }
}

// Auto-select first active connection
async function autoSelectActiveConnection() {
  const activeConnections = storage.get('activeConnections') || {};
  const select = document.getElementById('sessionSelect');
  
  // Find first active connection
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i];
    const sessionId = option.value;
    
    if (sessionId && activeConnections[sessionId] !== false) {
      select.value = sessionId;
      showNotification(`Koneksi ${sessionId} dipilih otomatis`);
      break;
    }
  }
  
  // If no active connection found, select first available
  if (!select.value && select.options.length > 1) {
    select.selectedIndex = 1; // Skip the first "Pilih..." option
  }
}

// Load sessions
async function loadSessions() {
  try {
    const data = await api.getAllSessions();
    const sessions = data.sessions || [];
    const connectedSessions = sessions.filter(s => s.status === 'connected');
    
    const select = document.getElementById('sessionSelect');
    
    if (connectedSessions.length === 0) {
      select.innerHTML = '<option value="">Tidak ada koneksi aktif</option>';
      return;
    }
    
    select.innerHTML = '<option value="">Pilih koneksi...</option>' +
      connectedSessions.map(s => `<option value="${s.sessionId}">${s.sessionId}</option>`).join('');
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

// Load groups (removed - now handled by modal)

// Setup listeners
function setupListeners() {
  const messageText = document.getElementById('messageText');
  const delayRange = document.getElementById('delayRange');
  
  messageText?.addEventListener('input', () => {
    updateCharCount();
    updatePreview();
  });
  
  delayRange?.addEventListener('input', updateDelayLabel);
}

// Message type selection
function selectMessageType(type) {
  currentMessageType = type;
  
  // Update buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) {
      btn.classList.add('active');
    }
  });
  
  // Toggle inputs
  document.getElementById('textInput').style.display = type === 'text' ? 'block' : 'none';
  document.getElementById('imageInput').style.display = type === 'image' ? 'block' : 'none';
  document.getElementById('documentInput').style.display = type === 'document' ? 'block' : 'none';
  
  updatePreview();
}

// Parse manual numbers (support CSV format: number,nama,email,custom1,custom2)
function parseManualNumbers() {
  const text = document.getElementById('manualNumbers').value;
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  recipients = [];
  recipientsData = [];
  
  lines.forEach(line => {
    // Check if line contains comma (CSV format)
    if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim());
      const number = formatPhoneNumber(parts[0]);
      
      if (number.length >= 10) {
        recipients.push(number);
        recipientsData.push({
          nomor: number,
          nama: parts[1] || 'Pengguna',
          email: parts[2] || '',
          custom1: parts[3] || '',
          custom2: parts[4] || ''
        });
      }
    } else {
      // Plain number only
      const number = formatPhoneNumber(line);
      if (number.length >= 10) {
        recipients.push(number);
        recipientsData.push({
          nomor: number,
          nama: 'Pengguna',
          email: '',
          custom1: '',
          custom2: ''
        });
      }
    }
  });
  
  updateRecipientsList();
}

// Functions removed - now handled by recipient-modal.js

// Update recipients list
function updateRecipientsList() {
  document.getElementById('recipientCount').textContent = recipients.length;
  
  const container = document.getElementById('recipientsList');
  
  if (recipients.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada penerima</p>';
    return;
  }
  
  container.innerHTML = recipients.slice(0, 10).map(num => `
    <div class="recipient-item">
      <i class="fas fa-user"></i> ${num}
    </div>
  `).join('');
  
  if (recipients.length > 10) {
    container.innerHTML += `<p class="text-muted text-center" style="margin-top: 10px;">+${recipients.length - 10} lainnya</p>`;
  }
}

// Update character count
function updateCharCount() {
  const text = document.getElementById('messageText').value;
  document.getElementById('charCount').textContent = text.length;
}

// Update delay label
function updateDelayLabel() {
  const value = document.getElementById('delayRange').value;
  document.getElementById('delayLabel').textContent = `${value} detik`;
}

// ============ TEXT EDITOR FUNCTIONS ============

// Format text (Bold, Italic, etc)
function formatText(format) {
  const textarea = document.getElementById('messageText');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  
  if (selectedText === '') {
    showNotification('Pilih teks terlebih dahulu', 'warning');
    return;
  }
  
  let formattedText = '';
  switch(format) {
    case 'bold':
      formattedText = `*${selectedText}*`;
      break;
    case 'italic':
      formattedText = `_${selectedText}_`;
      break;
    case 'strike':
      formattedText = `~${selectedText}~`;
      break;
    case 'mono':
      formattedText = `\`\`\`${selectedText}\`\`\``;
      break;
  }
  
  // Replace selected text with formatted text
  textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
  
  // Update cursor position
  textarea.selectionStart = start;
  textarea.selectionEnd = start + formattedText.length;
  textarea.focus();
  
  updateCharCount();
  updatePreview();
}

// Toggle variable menu
function toggleVariableMenu() {
  const menu = document.getElementById('variableMenu');
  const isVisible = menu.style.display === 'block';
  menu.style.display = isVisible ? 'none' : 'block';
}

// Insert variable at cursor position
function insertVariable(variable) {
  const textarea = document.getElementById('messageText');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  // Insert variable at cursor position
  textarea.value = textarea.value.substring(0, start) + variable + textarea.value.substring(end);
  
  // Update cursor position
  const newPosition = start + variable.length;
  textarea.selectionStart = newPosition;
  textarea.selectionEnd = newPosition;
  textarea.focus();
  
  // Close menu
  document.getElementById('variableMenu').style.display = 'none';
  
  updateCharCount();
  updatePreview();
  showNotification(`Variabel ${variable} ditambahkan`);
}

// Insert variable to caption
function insertVariableToCaption(variable) {
  const textarea = document.getElementById('imageCaption');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  textarea.value = textarea.value.substring(0, start) + variable + textarea.value.substring(end);
  
  const newPosition = start + variable.length;
  textarea.selectionStart = newPosition;
  textarea.selectionEnd = newPosition;
  textarea.focus();
  
  updatePreview();
  showNotification(`Variabel ${variable} ditambahkan ke caption`);
}

// Update character count
function updateCharCount() {
  const text = document.getElementById('messageText').value;
  document.getElementById('charCount').textContent = text.length;
}

// Replace variables in message
function replaceVariables(message, data) {
  let result = message;
  
  // Replace each variable with actual data
  result = result.replace(/{nama}/g, data.nama || data.name || 'Pengguna');
  result = result.replace(/{nomor}/g, data.nomor || data.number || '');
  result = result.replace(/{email}/g, data.email || '');
  result = result.replace(/{custom1}/g, data.custom1 || '');
  result = result.replace(/{custom2}/g, data.custom2 || '');
  
  return result;
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showNotification('File harus berupa gambar', 'error');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Ukuran gambar maksimal 5MB', 'error');
    return;
  }
  
  uploadedImageFile = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('imagePreview').src = e.target.result;
    document.getElementById('imagePreviewContainer').style.display = 'block';
    updatePreview();
  };
  reader.readAsDataURL(file);
  
  document.getElementById('imageFileName').textContent = file.name;
  showNotification('Gambar berhasil dipilih');
}

// Clear image
function clearImage() {
  uploadedImageFile = null;
  document.getElementById('imageFile').value = '';
  document.getElementById('imageFileName').textContent = 'Pilih file gambar (JPG, PNG, GIF)';
  document.getElementById('imagePreviewContainer').style.display = 'none';
  updatePreview();
}

// Handle document upload
function handleDocumentUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showNotification('Ukuran file maksimal 10MB', 'error');
    return;
  }
  
  uploadedDocumentFile = file;
  
  // Show info
  const fileSize = (file.size / 1024 / 1024).toFixed(2);
  document.getElementById('docInfo').innerHTML = `
    <strong>${file.name}</strong><br>
    <small>${fileSize} MB</small>
  `;
  document.getElementById('documentPreviewContainer').style.display = 'block';
  document.getElementById('documentFileName').textContent = file.name;
  
  updatePreview();
  showNotification('Dokumen berhasil dipilih');
}

// Clear document
function clearDocument() {
  uploadedDocumentFile = null;
  document.getElementById('documentFile').value = '';
  document.getElementById('documentFileName').textContent = 'Pilih file dokumen (PDF, Word, Excel, etc)';
  document.getElementById('documentPreviewContainer').style.display = 'none';
  updatePreview();
}

// Update preview
function updatePreview() {
  const preview = document.getElementById('messagePreview');
  let content = '';
  
  // Sample data for preview
  const sampleData = {
    nama: 'Budi',
    nomor: '628123456789',
    email: 'budi@email.com',
    custom1: 'Jakarta',
    custom2: 'Premium'
  };
  
  if (currentMessageType === 'text') {
    const text = document.getElementById('messageText').value || 'Preview pesan...';
    const previewText = replaceVariables(text, sampleData);
    content = `<div class="wa-bubble"><p>${previewText.replace(/\n/g, '<br>')}</p></div>`;
    
    // Show variable hint if variables are used
    if (text.includes('{')) {
      content += '<div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 8px; font-size: 12px;"><i class="fas fa-info-circle"></i> Preview dengan data contoh</div>';
    }
  } else if (currentMessageType === 'image') {
    const caption = document.getElementById('imageCaption').value;
    const sampleData = { nama: 'Budi', nomor: '628123456789', email: 'budi@email.com', custom1: '', custom2: '' };
    const previewCaption = caption ? replaceVariables(caption, sampleData) : '';
    
    if (uploadedImageFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.innerHTML = `
          <div class="wa-bubble">
            <img src="${e.target.result}" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;">
            ${previewCaption ? `<p>${previewCaption}</p>` : ''}
          </div>
          ${caption && caption.includes('{') ? '<div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 8px; font-size: 12px;"><i class="fas fa-info-circle"></i> Preview caption dengan data contoh</div>' : ''}
        `;
      };
      reader.readAsDataURL(uploadedImageFile);
    } else {
      content = `
        <div class="wa-bubble">
          <p class="text-muted">Upload gambar untuk preview</p>
          ${previewCaption ? `<p>${previewCaption}</p>` : ''}
        </div>
      `;
    }
  } else if (currentMessageType === 'document') {
    const fileName = uploadedDocumentFile ? uploadedDocumentFile.name : 'document.pdf';
    const icon = getFileIcon(fileName);
    content = `
      <div class="wa-bubble">
        <i class="${icon}" style="font-size: 48px; color: #667eea; margin-bottom: 10px;"></i>
        <p><strong>${fileName}</strong></p>
      </div>
    `;
  }
  
  if (currentMessageType !== 'image' || !uploadedImageFile) {
    preview.innerHTML = content;
  }
}

// Get file icon based on extension
function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive',
  };
  return iconMap[ext] || 'fas fa-file-alt';
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Daily limit settings
const DAILY_LIMIT_PER_SESSION = 500; // Max messages per session per day
const MIN_DELAY = 5000; // 5 seconds
const MAX_DELAY = 15000; // 15 seconds

// Check daily limit
function checkDailyLimit(sessionId) {
  const today = new Date().toDateString();
  const key = `daily_${sessionId}_${today}`;
  const count = storage.get(key) || 0;
  return {
    count,
    remaining: DAILY_LIMIT_PER_SESSION - count,
    percentage: (count / DAILY_LIMIT_PER_SESSION) * 100
  };
}

// Increment daily counter
function incrementDailyCounter(sessionId) {
  const today = new Date().toDateString();
  const key = `daily_${sessionId}_${today}`;
  const count = storage.get(key) || 0;
  storage.save(key, count + 1);
}

// Random delay between min and max
function getRandomDelay(baseDelay) {
  const randomMs = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY);
  return randomMs;
}

// Check if number is blacklisted
function isBlacklisted(number) {
  const blacklist = storage.get('blacklist') || [];
  return blacklist.includes(number);
}

// Send blast
async function sendBlast() {
  const sessionId = document.getElementById('sessionSelect').value;
  const delay = parseInt(document.getElementById('delayRange').value) * 1000;
  
  // Validation
  if (!sessionId) {
    showNotification('Pilih koneksi terlebih dahulu', 'error');
    return;
  }
  
  if (recipients.length === 0) {
    showNotification('Tambahkan minimal 1 penerima', 'error');
    return;
  }
  
  // Check daily limit
  const dailyCheck = checkDailyLimit(sessionId);
  if (dailyCheck.count >= DAILY_LIMIT_PER_SESSION) {
    showNotification(`Daily limit reached (${DAILY_LIMIT_PER_SESSION} messages/day). Try again tomorrow.`, 'error');
    return;
  }
  
  // Filter blacklisted numbers
  const originalCount = recipients.length;
  const filteredRecipients = recipients.filter(num => !isBlacklisted(num));
  const filteredData = recipients.map((num, i) => !isBlacklisted(num) ? recipientsData[i] : null).filter(d => d !== null);
  
  if (filteredRecipients.length < originalCount) {
    const blocked = originalCount - filteredRecipients.length;
    showNotification(`${blocked} nomor diblokir (blacklist). Melanjutkan dengan ${filteredRecipients.length} penerima.`, 'warning');
  }
  
  // Check if remaining daily limit is enough
  if (filteredRecipients.length > dailyCheck.remaining) {
    showNotification(`Hanya bisa kirim ${dailyCheck.remaining} pesan lagi hari ini (dari ${filteredRecipients.length} penerima)`, 'warning');
    if (!confirm(`Lanjutkan kirim ${dailyCheck.remaining} pesan pertama?`)) {
      return;
    }
    filteredRecipients.splice(dailyCheck.remaining);
    filteredData.splice(dailyCheck.remaining);
  }
  
  // Validate message content
  if (currentMessageType === 'text') {
    const message = document.getElementById('messageText').value;
    if (!message.trim()) {
      showNotification('Tulis pesan terlebih dahulu', 'error');
      return;
    }
  } else if (currentMessageType === 'image') {
    if (!uploadedImageFile) {
      showNotification('Upload gambar terlebih dahulu', 'error');
      return;
    }
  } else if (currentMessageType === 'document') {
    if (!uploadedDocumentFile) {
      showNotification('Upload dokumen terlebih dahulu', 'error');
      return;
    }
  }
  
  // Show progress
  document.getElementById('progressCard').style.display = 'block';
  document.getElementById('progressLogs').innerHTML = '';
  
  let sent = 0;
  let failed = 0;
  const failedMessages = []; // Track failed for retry
  
  // Prepare media data if needed
  let mediaBase64 = null;
  if (currentMessageType === 'image' && uploadedImageFile) {
    mediaBase64 = await fileToBase64(uploadedImageFile);
  } else if (currentMessageType === 'document' && uploadedDocumentFile) {
    mediaBase64 = await fileToBase64(uploadedDocumentFile);
  }
  
  for (let i = 0; i < filteredRecipients.length; i++) {
    const recipient = filteredRecipients[i];
    
    // Get recipient data (if available)
    const recipientData = filteredData[i] || {
      nomor: recipient,
      nama: 'Pengguna',
      email: '',
      custom1: '',
      custom2: ''
    };
    
    try {
      if (currentMessageType === 'text') {
        const messageTemplate = document.getElementById('messageText').value;
        const message = replaceVariables(messageTemplate, recipientData);
        await api.sendTextMessage(sessionId, recipient, message);
      } else if (currentMessageType === 'image') {
        const captionTemplate = document.getElementById('imageCaption').value;
        const caption = replaceVariables(captionTemplate, recipientData);
        await api.sendMediaBase64(sessionId, recipient, mediaBase64, 'image', caption);
      } else if (currentMessageType === 'document') {
        await api.sendMediaBase64(sessionId, recipient, mediaBase64, 'document', undefined, uploadedDocumentFile.name);
      }
      
      sent++;
      incrementDailyCounter(sessionId); // Increment counter on success
      const displayName = recipientData.nama !== 'Pengguna' ? recipientData.nama : recipient;
      addLog(`✓ Berhasil ke ${displayName} (${recipient})`, 'success');
    } catch (error) {
      failed++;
      const displayName = recipientData.nama !== 'Pengguna' ? recipientData.nama : recipient;
      addLog(`✗ Gagal ke ${displayName} (${recipient}): ${error.message}`, 'error');
      
      // Store failed message for retry
      failedMessages.push({
        recipient,
        recipientData,
        messageType: currentMessageType,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update progress
    const percent = Math.round(((i + 1) / filteredRecipients.length) * 100);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('progressCount').textContent = `${i + 1} / ${filteredRecipients.length}`;
    
    // Random delay with base delay (Anti-ban)
    if (i < filteredRecipients.length - 1) {
      const randomDelay = getRandomDelay(delay);
      addLog(`⏳ Delay ${(randomDelay/1000).toFixed(1)} detik...`, 'info');
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }
  }
  
  // Save failed messages for retry
  if (failedMessages.length > 0) {
    const existingFailed = storage.get('failedMessages') || [];
    storage.save('failedMessages', [...existingFailed, ...failedMessages]);
  }
  
  // Update stats
  const stats = storage.get('stats') || { totalSent: 0, totalContacts: 0, totalPending: 0, totalFailed: 0 };
  stats.totalSent += sent;
  stats.totalFailed += failed;
  storage.save('stats', stats);
  
  // Save to history
  const history = storage.get('blastHistory') || [];
  history.unshift({
    id: Date.now(),
    sessionId,
    messageType: currentMessageType,
    total: filteredRecipients.length,
    sent,
    failed,
    timestamp: new Date().toISOString(),
    dailyRemaining: checkDailyLimit(sessionId).remaining
  });
  storage.save('blastHistory', history.slice(0, 50)); // Keep last 50
  
  // Show completion
  const message = failedMessages.length > 0 
    ? `Selesai! Terkirim: ${sent}, Gagal: ${failed}. Klik tombol "Retry Failed" untuk coba lagi.`
    : `Selesai! Terkirim: ${sent}, Gagal: ${failed}`;
  
  showNotification(message, failed > 0 ? 'warning' : 'success');
  
  // Show daily limit info
  const finalDailyCheck = checkDailyLimit(sessionId);
  addLog(`📊 Sisa kuota hari ini: ${finalDailyCheck.remaining}/${DAILY_LIMIT_PER_SESSION}`, 'info');
  
  if (finalDailyCheck.percentage >= 80) {
    addLog(`⚠️ Peringatan: Kuota harian ${finalDailyCheck.percentage.toFixed(0)}%`, 'warning');
  }
}

function addLog(message, type = 'info') {
  const log = document.getElementById('progressLogs');
  const item = document.createElement('div');
  item.className = `log-item log-${type}`;
  item.textContent = message;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

// Show daily limit status
function showDailyLimitStatus() {
  const sessionId = document.getElementById('sessionSelect').value;
  if (!sessionId) return;
  
  const dailyCheck = checkDailyLimit(sessionId);
  const statusEl = document.getElementById('dailyLimitStatus');
  
  if (statusEl) {
    let color = 'var(--success)';
    let icon = 'fa-check-circle';
    
    if (dailyCheck.percentage >= 90) {
      color = 'var(--danger)';
      icon = 'fa-exclamation-triangle';
    } else if (dailyCheck.percentage >= 80) {
      color = 'var(--warning)';
      icon = 'fa-exclamation-circle';
    }
    
    statusEl.innerHTML = `
      <i class="fas ${icon}" style="color: ${color}"></i>
      <span style="color: ${color}">
        ${dailyCheck.remaining}/${DAILY_LIMIT_PER_SESSION} messages remaining today
      </span>
    `;
  }
}

// Retry failed messages
async function retryFailedMessages() {
  const failedMessages = storage.get('failedMessages') || [];
  
  if (failedMessages.length === 0) {
    showNotification('Tidak ada pesan gagal untuk di-retry', 'info');
    return;
  }
  
  const sessionId = document.getElementById('sessionSelect').value;
  if (!sessionId) {
    showNotification('Pilih koneksi terlebih dahulu', 'error');
    return;
  }
  
  if (!confirm(`Retry ${failedMessages.length} pesan yang gagal?`)) {
    return;
  }
  
  // Show progress
  document.getElementById('progressCard').style.display = 'block';
  document.getElementById('progressLogs').innerHTML = '';
  addLog(`🔄 Retrying ${failedMessages.length} failed messages...`, 'info');
  
  let sent = 0;
  let stillFailed = [];
  
  for (let i = 0; i < failedMessages.length; i++) {
    const { recipient, recipientData, messageType } = failedMessages[i];
    
    // Check daily limit
    const dailyCheck = checkDailyLimit(sessionId);
    if (dailyCheck.remaining <= 0) {
      addLog(`⚠️ Daily limit reached. Stopping retry.`, 'warning');
      stillFailed.push(...failedMessages.slice(i));
      break;
    }
    
    // Check blacklist
    if (isBlacklisted(recipient)) {
      addLog(`🚫 Skipped ${recipient} (blacklisted)`, 'warning');
      continue;
    }
    
    try {
      if (messageType === 'text') {
        const messageTemplate = document.getElementById('messageText').value;
        const message = replaceVariables(messageTemplate, recipientData);
        await api.sendTextMessage(sessionId, recipient, message);
      }
      // Add image/document retry if needed
      
      sent++;
      incrementDailyCounter(sessionId);
      const displayName = recipientData.nama;
      addLog(`✓ Retry berhasil: ${displayName} (${recipient})`, 'success');
    } catch (error) {
      stillFailed.push(failedMessages[i]);
      addLog(`✗ Masih gagal: ${recipient} - ${error.message}`, 'error');
    }
    
    // Random delay
    if (i < failedMessages.length - 1) {
      const randomDelay = getRandomDelay(5000);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }
    
    // Update progress
    const percent = Math.round(((i + 1) / failedMessages.length) * 100);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('progressCount').textContent = `${i + 1} / ${failedMessages.length}`;
  }
  
  // Update failed messages
  storage.save('failedMessages', stillFailed);
  
  showNotification(`Retry complete! Berhasil: ${sent}, Masih gagal: ${stillFailed.length}`, 'success');
  addLog(`📊 Sisa kuota: ${checkDailyLimit(sessionId).remaining}/${DAILY_LIMIT_PER_SESSION}`, 'info');
}

// Styles
if (!document.getElementById('messages-styles')) {
  const style = document.createElement('style');
  style.id = 'messages-styles';
  style.textContent = `
.recipient-item {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.recipient-item i {
  color: var(--primary);
}

.file-upload-box {
  margin-bottom: 15px;
}

.upload-file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px;
  border: 2px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--light);
  text-align: center;
}

.upload-file-label:hover {
  border-color: var(--primary);
  background: white;
}

.upload-file-label i {
  font-size: 36px;
  color: var(--primary);
}

.document-info {
  text-align: center;
  padding: 20px;
  background: var(--light);
  border-radius: 8px;
}

.document-info p {
  margin: 10px 0;
}

/* Editor Toolbar */
.editor-toolbar {
  display: flex;
  gap: 5px;
  padding: 8px;
  background: var(--light);
  border: 1px solid var(--border);
  border-radius: 8px 8px 0 0;
  flex-wrap: wrap;
  align-items: center;
}

.editor-textarea {
  border-radius: 0 0 8px 8px !important;
  border-top: none !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.toolbar-btn, .toolbar-btn-sm {
  background: white;
  border: 1px solid var(--border);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.toolbar-btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.toolbar-btn:hover, .toolbar-btn-sm:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 5px;
}

.variable-dropdown {
  position: relative;
}

.variable-btn {
  background: #667eea !important;
  color: white !important;
  border-color: #667eea !important;
}

.variable-btn:hover {
  background: #5568d3 !important;
}

.variable-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 200px;
  z-index: 1000;
}

.variable-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  font-size: 14px;
}

.variable-menu button:hover {
  background: var(--light);
}

.variable-menu button i {
  color: var(--primary);
  width: 20px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 12px;
  color: #666;
}

.variable-hints {
  font-size: 12px;
  color: #667eea;
}

.caption-toolbar {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
`;
  document.head.appendChild(style);
}
