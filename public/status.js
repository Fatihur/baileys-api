// Status Page JavaScript

let currentSessionId = null;
let currentMediaType = 'image';
let uploadedMediaFile = null;
let uploadedMediaBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
  loadSessions();
});

async function loadSessions() {
  try {
    const data = await api.getAllSessions();
    const sessions = data.sessions || [];
    const connectedSessions = sessions.filter(s => s.status === 'connected');
    
    const select = document.getElementById('sessionSelect');
    
    if (connectedSessions.length === 0) {
      select.innerHTML = '<option value="">No active connections</option>';
      return;
    }
    
    select.innerHTML = '<option value="">Select connection...</option>' +
      connectedSessions.map(s => `<option value="${s.sessionId}">${s.sessionId}</option>`).join('');
    
    select.addEventListener('change', () => {
      currentSessionId = select.value;
      if (currentSessionId) {
        loadMyStatus();
        loadOthersStatus();
      }
    });
    
    // Auto-select first session
    if (connectedSessions.length > 0) {
      select.value = connectedSessions[0].sessionId;
      currentSessionId = connectedSessions[0].sessionId;
      loadMyStatus();
      loadOthersStatus();
    }
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showNotification('Failed to load sessions', 'error');
  }
}

async function loadMyStatus() {
  if (!currentSessionId) {
    showNotification('Select a connection first', 'warning');
    return;
  }
  
  const container = document.getElementById('myStatusGrid');
  
  try {
    // Get my status from storage (demo data)
    const myStatus = storage.get(`my_status_${currentSessionId}`) || [];
    
    if (myStatus.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-circle-notch"></i>
          <p>No status updates</p>
          <small>Upload your first status!</small>
        </div>
      `;
      return;
    }
    
    container.innerHTML = myStatus.map(status => `
      <div class="status-card" onclick="viewStatus('${status.id}', 'my')">
        <div class="status-thumbnail">
          ${status.type === 'image' ? `<img src="${status.mediaUrl}">` : 
            status.type === 'video' ? `<video src="${status.mediaUrl}"></video>` :
            `<div style="background: ${status.bgColor}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; font-size: 18px; color: white;">${status.text}</div>`}
        </div>
        <div class="status-info">
          <div class="status-author">
            <div class="status-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="status-author-info">
              <h4>You</h4>
              <p>${formatTime(status.timestamp)}</p>
            </div>
          </div>
          ${status.caption ? `<div class="status-caption">${status.caption}</div>` : ''}
          <div class="status-meta">
            <div class="status-views">
              <i class="fas fa-eye"></i>
              <span>${status.views || 0} views</span>
            </div>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteStatus('${status.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load status:', error);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load status</p>
      </div>
    `;
  }
}

async function loadOthersStatus() {
  if (!currentSessionId) return;
  
  const container = document.getElementById('othersStatusGrid');
  
  try {
    // Get status from real API
    const data = await api.getStatus(currentSessionId);
    const othersStatus = data.statuses || [];
    
    // Store in localStorage for caching
    if (othersStatus.length > 0) {
      storage.save(`others_status_${currentSessionId}`, othersStatus);
    } else {
      // Try to load from cache
      const cachedStatus = storage.get(`others_status_${currentSessionId}`) || [];
      
      container.innerHTML = demoStatus.map(status => `
        <div class="status-card" onclick="viewStatus('${status.id}', 'others')">
          <div class="status-thumbnail">
            ${status.type === 'image' ? `<img src="${status.mediaUrl}">` : 
              status.type === 'video' ? `<video src="${status.mediaUrl}"></video>` :
              `<div style="background: ${status.bgColor}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; font-size: 18px; color: white;">${status.text}</div>`}
          </div>
          <div class="status-info">
            <div class="status-author">
              <div class="status-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="status-author-info">
                <h4>${status.author}</h4>
                <p>${formatTime(status.timestamp)}</p>
              </div>
            </div>
            ${status.caption ? `<div class="status-caption">${status.caption}</div>` : ''}
            <div class="status-meta">
              <div class="status-views">
                <i class="fas fa-eye"></i>
                <span>${status.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      return;
    }
    
    container.innerHTML = othersStatus.map(status => `
      <div class="status-card" onclick="viewStatus('${status.id}', 'others')">
        <div class="status-thumbnail">
          ${status.type === 'image' ? `<img src="${status.mediaUrl}">` : 
            status.type === 'video' ? `<video src="${status.mediaUrl}"></video>` :
            `<div style="background: ${status.bgColor}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; font-size: 18px; color: white;">${status.text}</div>`}
        </div>
        <div class="status-info">
          <div class="status-author">
            <div class="status-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="status-author-info">
              <h4>${status.author}</h4>
              <p>${formatTime(status.timestamp)}</p>
            </div>
          </div>
          ${status.caption ? `<div class="status-caption">${status.caption}</div>` : ''}
          <div class="status-meta">
            <div class="status-views">
              <i class="fas fa-eye"></i>
              <span>${status.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load status:', error);
  }
}

function openUploadModal() {
  if (!currentSessionId) {
    showNotification('Select a connection first', 'warning');
    return;
  }
  
  document.getElementById('uploadModal').classList.add('show');
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('show');
  resetUploadForm();
}

function selectMediaType(type) {
  currentMediaType = type;
  
  // Update buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) {
      btn.classList.add('active');
    }
  });
  
  // Toggle sections
  document.getElementById('imageUploadSection').style.display = type === 'image' ? 'block' : 'none';
  document.getElementById('videoUploadSection').style.display = type === 'video' ? 'block' : 'none';
  document.getElementById('textStatusSection').style.display = type === 'text' ? 'block' : 'none';
}

function handleStatusMediaUpload(event, type) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate
  if (type === 'image' && !file.type.startsWith('image/')) {
    showNotification('Please select an image file', 'error');
    return;
  }
  
  if (type === 'video' && !file.type.startsWith('video/')) {
    showNotification('Please select a video file', 'error');
    return;
  }
  
  // Size check
  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 16 * 1024 * 1024; // 5MB for image, 16MB for video
  if (file.size > maxSize) {
    showNotification(`File size must be less than ${type === 'image' ? '5MB' : '16MB'}`, 'error');
    return;
  }
  
  uploadedMediaFile = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedMediaBase64 = e.target.result;
    
    if (type === 'image') {
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('imageStatusPreview').style.display = 'block';
      document.getElementById('imageFileName').textContent = file.name;
    } else {
      document.getElementById('previewVideo').src = e.target.result;
      document.getElementById('videoStatusPreview').style.display = 'block';
      document.getElementById('videoFileName').textContent = file.name;
    }
  };
  reader.readAsDataURL(file);
}

async function uploadStatus() {
  if (!currentSessionId) {
    showNotification('Select a connection first', 'warning');
    return;
  }
  
  try {
    let statusData;
    const caption = document.getElementById('statusCaption').value.trim();
    
    if (currentMediaType === 'text') {
      const text = document.getElementById('textStatusInput').value.trim();
      if (!text) {
        showNotification('Please enter text', 'error');
        return;
      }
      
      const bgColor = document.getElementById('statusBgColor').value;
      
      statusData = {
        id: 'status_' + Date.now(),
        type: 'text',
        text: text,
        bgColor: bgColor,
        caption: caption,
        timestamp: Date.now(),
        views: 0
      };
    } else {
      if (!uploadedMediaBase64) {
        showNotification('Please select a file', 'error');
        return;
      }
      
      // Call API to upload status
      await api.uploadStatus(currentSessionId, uploadedMediaBase64, currentMediaType, caption);
      
      statusData = {
        id: 'status_' + Date.now(),
        type: currentMediaType,
        mediaUrl: uploadedMediaBase64,
        caption: caption,
        timestamp: Date.now(),
        views: 0
      };
    }
    
    // Save to storage
    const myStatus = storage.get(`my_status_${currentSessionId}`) || [];
    myStatus.unshift(statusData);
    storage.save(`my_status_${currentSessionId}`, myStatus);
    
    // Close modal and reload
    closeUploadModal();
    loadMyStatus();
    
    showNotification('Status uploaded successfully!', 'success');
  } catch (error) {
    console.error('Failed to upload status:', error);
    showNotification('Failed to upload status: ' + error.message, 'error');
  }
}

function resetUploadForm() {
  uploadedMediaFile = null;
  uploadedMediaBase64 = null;
  document.getElementById('statusCaption').value = '';
  document.getElementById('textStatusInput').value = '';
  document.getElementById('statusImageFile').value = '';
  document.getElementById('statusVideoFile').value = '';
  document.getElementById('imageStatusPreview').style.display = 'none';
  document.getElementById('videoStatusPreview').style.display = 'none';
  document.getElementById('imageFileName').textContent = 'Click to select image';
  document.getElementById('videoFileName').textContent = 'Click to select video';
  selectMediaType('image');
}

function viewStatus(statusId, source) {
  const statusList = source === 'my' ? 
    storage.get(`my_status_${currentSessionId}`) || [] :
    storage.get(`others_status_${currentSessionId}`) || [];
  
  const status = statusList.find(s => s.id === statusId);
  if (!status) return;
  
  // Mark as viewed
  if (source === 'others') {
    api.viewStatus(currentSessionId, status.authorJid, statusId).catch(console.error);
  }
  
  // Show modal
  const modal = document.getElementById('statusModal');
  const mediaContainer = document.getElementById('statusModalMedia');
  const captionContainer = document.getElementById('statusModalCaption');
  
  if (status.type === 'image') {
    mediaContainer.innerHTML = `<img src="${status.mediaUrl}" class="status-modal-media">`;
  } else if (status.type === 'video') {
    mediaContainer.innerHTML = `<video src="${status.mediaUrl}" class="status-modal-media" controls autoplay></video>`;
  } else {
    mediaContainer.innerHTML = `
      <div style="background: ${status.bgColor}; width: 400px; height: 600px; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 40px; text-align: center;">
        <h2 style="color: white; font-size: 28px; line-height: 1.4;">${status.text}</h2>
      </div>
    `;
  }
  
  captionContainer.innerHTML = status.caption ? 
    `<p><strong>${source === 'my' ? 'You' : status.author}:</strong> ${status.caption}</p>` :
    `<p><strong>${source === 'my' ? 'You' : status.author}</strong></p>`;
  
  modal.classList.add('show');
}

function closeStatusModal() {
  document.getElementById('statusModal').classList.remove('show');
}

function deleteStatus(statusId) {
  if (!confirm('Delete this status?')) return;
  
  try {
    let myStatus = storage.get(`my_status_${currentSessionId}`) || [];
    myStatus = myStatus.filter(s => s.id !== statusId);
    storage.save(`my_status_${currentSessionId}`, myStatus);
    
    loadMyStatus();
    showNotification('Status deleted!', 'success');
  } catch (error) {
    console.error('Failed to delete status:', error);
    showNotification('Failed to delete status', 'error');
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
