// Blast Page JavaScript

let recipients = [];
let selectedSession = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSessions();
  loadSavedData();
  setupEventListeners();
  
  // Auto-select session if coming from dashboard
  const savedSession = sessionStorage.getItem('selectedSession');
  if (savedSession) {
    setTimeout(() => {
      document.getElementById('sessionSelect').value = savedSession;
      sessionStorage.removeItem('selectedSession');
    }, 500);
  }
});

// Load sessions for dropdown
async function loadSessions() {
  try {
    const data = await api.getAllSessions();
    const sessions = data.sessions || [];
    
    const connectedSessions = sessions.filter(s => s.status === 'connected');
    
    const select = document.getElementById('sessionSelect');
    
    if (connectedSessions.length === 0) {
      select.innerHTML = '<option value="">No connected sessions</option>';
      return;
    }
    
    select.innerHTML = '<option value="">Select a session...</option>' +
      connectedSessions.map(s => `<option value="${s.sessionId}">${s.sessionId}</option>`).join('');
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  const messageText = document.getElementById('messageText');
  messageText.addEventListener('input', () => {
    updateCharCount();
    updatePreview();
  });
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const text = e.target.result;
    const numbers = text.split(/\r?\n/).filter(line => line.trim());
    
    recipients = numbers.map(num => formatPhoneNumber(num)).filter(num => num.length >= 10);
    
    document.getElementById('manualNumbers').value = recipients.join('\n');
    updateRecipientsList();
    
    showNotification(`Imported ${recipients.length} contacts`);
  };
  
  reader.readAsText(file);
}

// Update recipients from manual input
document.getElementById('manualNumbers')?.addEventListener('input', function() {
  const text = this.value;
  const numbers = text.split(/\r?\n/).filter(line => line.trim());
  recipients = numbers.map(num => formatPhoneNumber(num)).filter(num => num.length >= 10);
  updateRecipientsList();
});

// Update recipients list
function updateRecipientsList() {
  const container = document.getElementById('recipientsList');
  const count = document.getElementById('recipientCount');
  
  count.textContent = recipients.length;
  
  if (recipients.length === 0) {
    container.innerHTML = '<p class="text-muted">Upload CSV or enter numbers to see recipients</p>';
    return;
  }
  
  container.innerHTML = recipients.slice(0, 10).map((num, idx) => `
    <div class="recipient-item">
      <span><i class="fas fa-user"></i> ${num}</span>
      <button class="btn btn-sm btn-danger" onclick="removeRecipient(${idx})" style="padding: 4px 8px;">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
  
  if (recipients.length > 10) {
    container.innerHTML += `<p class="text-muted text-center" style="margin-top: 10px;">And ${recipients.length - 10} more...</p>`;
  }
}

// Remove recipient
function removeRecipient(index) {
  recipients.splice(index, 1);
  document.getElementById('manualNumbers').value = recipients.join('\n');
  updateRecipientsList();
}

// Toggle message inputs based on type
function toggleMessageInputs() {
  const type = document.getElementById('messageType').value;
  
  document.getElementById('textMessageInput').style.display = type === 'text' ? 'block' : 'none';
  document.getElementById('imageMessageInput').style.display = type === 'image' ? 'block' : 'none';
  document.getElementById('documentMessageInput').style.display = type === 'document' ? 'block' : 'none';
  
  updatePreview();
}

// Update character count
function updateCharCount() {
  const text = document.getElementById('messageText').value;
  document.getElementById('charCount').textContent = text.length;
}

// Update message preview
function updatePreview() {
  const type = document.getElementById('messageType').value;
  const preview = document.getElementById('messagePreview');
  
  let content = '';
  
  if (type === 'text') {
    const text = document.getElementById('messageText').value || 'Your message will appear here...';
    content = `<div class="whatsapp-bubble"><p>${text.replace(/\n/g, '<br>')}</p></div>`;
  } else if (type === 'image') {
    const imageUrl = document.getElementById('imageUrl').value;
    const caption = document.getElementById('imageCaption').value;
    content = `
      <div class="whatsapp-bubble">
        ${imageUrl ? `<img src="${imageUrl}" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;" onerror="this.src='https://via.placeholder.com/300x200?text=Image'">` : '<p class="text-muted">Enter image URL to preview</p>'}
        ${caption ? `<p>${caption}</p>` : ''}
      </div>
    `;
  } else if (type === 'document') {
    const fileName = document.getElementById('fileName').value || 'document.pdf';
    content = `
      <div class="whatsapp-bubble">
        <i class="fas fa-file-pdf" style="font-size: 48px; color: #ef4444;"></i>
        <p><strong>${fileName}</strong></p>
      </div>
    `;
  }
  
  preview.innerHTML = content;
}

// Download sample CSV
function downloadSampleCSV() {
  const csv = '6281234567890\n6281234567891\n6281234567892';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_contacts.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Send blast message
async function sendBlastMessage() {
  const sessionId = document.getElementById('sessionSelect').value;
  const messageType = document.getElementById('messageType').value;
  const delay = parseInt(document.getElementById('delaySeconds').value) * 1000;
  
  // Validation
  if (!sessionId) {
    showNotification('Please select a session', 'error');
    return;
  }
  
  if (recipients.length === 0) {
    showNotification('Please add at least one recipient', 'error');
    return;
  }
  
  let messageData = {};
  
  if (messageType === 'text') {
    const message = document.getElementById('messageText').value.trim();
    if (!message) {
      showNotification('Please enter a message', 'error');
      return;
    }
    messageData = { message };
  } else if (messageType === 'image') {
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const caption = document.getElementById('imageCaption').value.trim();
    if (!imageUrl) {
      showNotification('Please enter image URL', 'error');
      return;
    }
    messageData = { imageUrl, caption, mediaType: 'image' };
  } else if (messageType === 'document') {
    const documentUrl = document.getElementById('documentUrl').value.trim();
    const fileName = document.getElementById('fileName').value.trim();
    if (!documentUrl) {
      showNotification('Please enter document URL', 'error');
      return;
    }
    messageData = { documentUrl, fileName, mediaType: 'document' };
  }
  
  // Show sending status
  document.getElementById('sendingStatus').style.display = 'block';
  document.getElementById('totalCount').textContent = recipients.length;
  document.getElementById('sentCount').textContent = '0';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('sendingLogs').innerHTML = '';
  
  // Send messages one by one
  let sent = 0;
  let failed = 0;
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      if (messageType === 'text') {
        await api.sendTextMessage(sessionId, recipient, messageData.message);
      } else if (messageType === 'image') {
        await api.sendMediaMessage(sessionId, recipient, messageData.imageUrl, 'image', messageData.caption);
      } else if (messageType === 'document') {
        await api.sendMediaMessage(sessionId, recipient, messageData.documentUrl, 'document', undefined, messageData.fileName);
      }
      
      sent++;
      addLog(`✓ Sent to ${recipient}`, 'success');
    } catch (error) {
      failed++;
      addLog(`✗ Failed to ${recipient}: ${error.message}`, 'error');
    }
    
    // Update progress
    const progress = ((i + 1) / recipients.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('sentCount').textContent = (i + 1);
    
    // Delay before next message
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Update stats
  const stats = storage.get('stats') || { totalSent: 0, totalContacts: 0, totalPending: 0, totalFailed: 0 };
  stats.totalSent += sent;
  stats.totalFailed += failed;
  stats.totalContacts = Math.max(stats.totalContacts, recipients.length);
  storage.save('stats', stats);
  
  // Save to history
  saveToHistory(sessionId, messageType, recipients.length, sent, failed);
  
  // Show completion
  showNotification(`Blast completed! Sent: ${sent}, Failed: ${failed}`);
}

// Add log entry
function addLog(message, type) {
  const log = document.getElementById('sendingLogs');
  const logItem = document.createElement('div');
  logItem.className = `log-item log-${type}`;
  logItem.textContent = message;
  log.appendChild(logItem);
  log.scrollTop = log.scrollHeight;
}

// Save to history
function saveToHistory(sessionId, messageType, total, sent, failed) {
  const history = storage.get('blastHistory') || [];
  history.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    sessionId,
    messageType,
    total,
    sent,
    failed
  });
  
  // Keep only last 50
  if (history.length > 50) {
    history.length = 50;
  }
  
  storage.save('blastHistory', history);
}

// Load saved data
function loadSavedData() {
  const saved = storage.get('blastDraft');
  if (saved) {
    if (saved.recipients) {
      recipients = saved.recipients;
      document.getElementById('manualNumbers').value = recipients.join('\n');
      updateRecipientsList();
    }
    if (saved.message) {
      document.getElementById('messageText').value = saved.message;
      updateCharCount();
      updatePreview();
    }
  }
}

// Auto-save draft
setInterval(() => {
  const message = document.getElementById('messageText').value;
  storage.save('blastDraft', { recipients, message });
}, 5000);
