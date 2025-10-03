// Schedule Blast Functions

function openScheduleModal() {
  // Validate
  const sessionId = document.getElementById('sessionSelect').value;
  // Get recipients from global scope or check button count
  const recipientCount = document.getElementById('recipientCountBtn')?.textContent || '0';
  const currentRecipients = parseInt(recipientCount);
  const messageText = document.getElementById('messageText').value.trim();
  
  if (!sessionId) {
    showNotification('Pilih koneksi terlebih dahulu!', 'error');
    return;
  }
  
  if (currentRecipients === 0) {
    showNotification('Pilih minimal 1 penerima!', 'error');
    return;
  }
  
  if (window.currentMessageType === 'text' && !messageText) {
    showNotification('Tulis pesan terlebih dahulu!', 'error');
    return;
  }
  
  // Set minimum datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
  const minDateTime = now.toISOString().slice(0, 16);
  document.getElementById('scheduleDateTime').min = minDateTime;
  document.getElementById('scheduleDateTime').value = minDateTime;
  
  // Update summary
  updateScheduleSummary();
  
  // Show modal
  document.getElementById('scheduleModal').classList.add('show');
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.remove('show');
}

function updateScheduleSummary() {
  const sessionId = document.getElementById('sessionSelect').value;
  const sessionText = document.getElementById('sessionSelect').selectedOptions[0]?.text || '-';
  const recipientCount = (window.recipients && window.recipients.length) ? window.recipients.length : parseInt(document.getElementById('recipientCountBtn')?.textContent || '0');
  const messageType = window.currentMessageType || 'text';
  const dateTime = document.getElementById('scheduleDateTime').value;
  
  document.getElementById('scheduleSummarySession').textContent = sessionText;
  document.getElementById('scheduleSummaryRecipients').textContent = recipientCount;
  document.getElementById('scheduleSummaryType').textContent = messageType;
  
  if (dateTime) {
    const date = new Date(dateTime);
    document.getElementById('scheduleSummaryTime').textContent = date.toLocaleString();
  } else {
    document.getElementById('scheduleSummaryTime').textContent = '-';
  }
}

async function confirmSchedule() {
  const scheduleDateTime = document.getElementById('scheduleDateTime').value;
  
  if (!scheduleDateTime) {
    showNotification('Pilih tanggal & waktu!', 'error');
    return;
  }
  
  const scheduleDate = new Date(scheduleDateTime);
  const now = new Date();
  
  if (scheduleDate <= now) {
    showNotification('Waktu schedule harus di masa depan!', 'error');
    return;
  }
  
  // Prepare schedule data
  const sessionId = document.getElementById('sessionSelect').value;
  const messageText = document.getElementById('messageText').value.trim();
  const imageCaption = document.getElementById('imageCaption')?.value.trim() || '';
  
  // Get media data if available
  let mediaBase64 = null;
  if (window.currentMessageType === 'image' && window.uploadedImageFile) {
    mediaBase64 = await fileToBase64(window.uploadedImageFile);
  } else if (window.currentMessageType === 'document' && window.uploadedDocumentFile) {
    mediaBase64 = await fileToBase64(window.uploadedDocumentFile);
  }
  
  const schedule = {
    id: 'schedule_' + Date.now(),
    sessionId: sessionId,
    message: (window.currentMessageType === 'text' ? messageText : imageCaption) || '',
    messageType: window.currentMessageType || 'text',
    messagePreview: ((window.currentMessageType === 'text' ? messageText : imageCaption) || '').substring(0, 100),
    recipients: window.recipients || [],
    recipientsData: window.recipientsData || [],
    recipientCount: (window.recipients && window.recipients.length) ? window.recipients.length : 0,
    scheduledTime: scheduleDate.toISOString(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    mediaUrl: mediaBase64,
    fileName: window.currentMessageType === 'document' && window.uploadedDocumentFile ? window.uploadedDocumentFile.name : null
  };
  
  // Save to storage
  const schedules = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
  schedules.push(schedule);
  localStorage.setItem('scheduledMessages', JSON.stringify(schedules));
  
  // Close modal
  closeScheduleModal();
  
  // Show success
  showNotification(`✅ Blast scheduled for ${scheduleDate.toLocaleString()}!`, 'success');
  
  // Redirect to scheduled page
  setTimeout(() => {
    if (confirm('Lihat scheduled blasts sekarang?')) {
      window.location.href = 'scheduled.html';
    }
  }, 1000);
}

// Update summary when datetime changes
document.addEventListener('DOMContentLoaded', () => {
  const dateTimeInput = document.getElementById('scheduleDateTime');
  if (dateTimeInput) {
    dateTimeInput.addEventListener('change', updateScheduleSummary);
  }
});
