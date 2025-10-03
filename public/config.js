// API Configuration
const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  apiKey: 'baileys-gateway-secret-key-2024'
};

// API Helper Functions
const api = {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': API_CONFIG.apiKey,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Session endpoints
  async createSession(sessionId, webhook) {
    return this.request('/api/session/create', {
      method: 'POST',
      body: JSON.stringify({ sessionId, webhook })
    });
  },

  async getSessionStatus(sessionId) {
    return this.request(`/api/session/${sessionId}/status`);
  },

  async getAllSessions() {
    return this.request('/api/sessions');
  },

  async deleteSession(sessionId) {
    return this.request(`/api/session/${sessionId}`, {
      method: 'DELETE'
    });
  },

  // Message endpoints
  async sendTextMessage(sessionId, to, message) {
    return this.request('/api/message/text', {
      method: 'POST',
      body: JSON.stringify({ sessionId, to, message })
    });
  },

  async sendMediaMessage(sessionId, to, mediaUrl, mediaType, caption, fileName) {
    return this.request('/api/message/media', {
      method: 'POST',
      body: JSON.stringify({ sessionId, to, mediaUrl, mediaType, caption, fileName })
    });
  },

  async sendMediaBase64(sessionId, to, mediaBase64, mediaType, caption, fileName) {
    return this.request('/api/message/media-base64', {
      method: 'POST',
      body: JSON.stringify({ sessionId, to, mediaBase64, mediaType, caption, fileName })
    });
  },

  async sendBulkMessages(sessionId, recipients, message, delay) {
    return this.request('/api/message/bulk', {
      method: 'POST',
      body: JSON.stringify({ sessionId, recipients, message, delay })
    });
  },

  // Message Management
  async getChats(sessionId) {
    return this.request(`/api/chats/${sessionId}`);
  },

  async getMessages(sessionId, jid, limit = 50) {
    return this.request(`/api/messages/${sessionId}/${jid}?limit=${limit}`);
  },

  async markAsRead(sessionId, jid, messageId) {
    return this.request('/api/message/read', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, messageId })
    });
  },

  async replyMessage(sessionId, jid, messageId, replyText) {
    return this.request('/api/message/reply', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, messageId, replyText })
    });
  },

  async forwardMessage(sessionId, fromJid, messageId, toJid) {
    return this.request('/api/message/forward', {
      method: 'POST',
      body: JSON.stringify({ sessionId, fromJid, messageId, toJid })
    });
  },

  async deleteMessage(sessionId, jid, messageId, forEveryone = false) {
    return this.request('/api/message/delete', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, messageId, forEveryone })
    });
  },

  async pinMessage(sessionId, jid, messageId, pin = true) {
    return this.request('/api/message/pin', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, messageId, pin })
    });
  },

  // Presence & Status
  async setPresence(sessionId, jid, presence) {
    return this.request('/api/presence/set', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, presence })
    });
  },

  async getPresence(sessionId, jid) {
    return this.request(`/api/presence/${sessionId}/${jid}`);
  },

  async sendTyping(sessionId, jid, isTyping = true) {
    return this.request('/api/presence/typing', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, isTyping })
    });
  },

  async getStatus(sessionId, jid) {
    return this.request(`/api/status/${sessionId}/${jid}`);
  },

  async uploadStatus(sessionId, mediaBase64, mediaType, caption) {
    return this.request('/api/status/upload', {
      method: 'POST',
      body: JSON.stringify({ sessionId, mediaBase64, mediaType, caption })
    });
  },

  async viewStatus(sessionId, jid, statusId) {
    return this.request('/api/status/view', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jid, statusId })
    });
  },

  // Contacts
  async getContacts(sessionId) {
    return this.request(`/api/contacts/${sessionId}`);
  },

  async checkNumberRegistered(sessionId, phoneNumber) {
    return this.request('/api/contact/check', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phoneNumber })
    });
  },

  async getContactInfo(sessionId, jid) {
    return this.request(`/api/contact/info/${sessionId}/${jid}`);
  }
};

// Utility Functions
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Format phone number
function formatPhoneNumber(number) {
  return number.replace(/[^0-9]/g, '');
}

// Local Storage Helper
const storage = {
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  
  remove(key) {
    localStorage.removeItem(key);
  }
};
