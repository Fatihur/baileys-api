// Event Listener System for Real-time Notifications

class WhatsAppEventListener {
  constructor() {
    this.listeners = [];
    this.pollingInterval = null;
    this.isRunning = false;
    this.lastCheckTimestamp = Date.now();
  }

  // Start listening for events
  start(sessionId, options = {}) {
    if (this.isRunning) {
      console.warn('Event listener already running');
      return;
    }

    this.sessionId = sessionId;
    this.pollingDelay = options.pollingDelay || 5000; // 5 seconds default
    this.isRunning = true;

    console.log(`🎧 Event listener started for session: ${sessionId}`);
    
    // Start polling
    this.poll();
    this.pollingInterval = setInterval(() => this.poll(), this.pollingDelay);

    // Show notification
    this.showNotificationBadge('Listening for events...');
  }

  // Stop listening
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isRunning = false;
    console.log('🛑 Event listener stopped');
    this.removeNotificationBadge();
  }

  // Add event listener
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  // Remove event listener
  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => l.event !== event || l.callback !== callback
    );
  }

  // Trigger event
  trigger(event, data) {
    this.listeners
      .filter(l => l.event === event || l.event === '*')
      .forEach(l => {
        try {
          l.callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
  }

  // Poll for new events
  async poll() {
    if (!this.sessionId) return;

    try {
      // Check for new messages
      await this.checkNewMessages();

      // Check connection status
      await this.checkConnectionStatus();

      // Check for presence updates (if needed)
      // await this.checkPresenceUpdates();

      this.lastCheckTimestamp = Date.now();
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  // Check for new messages
  async checkNewMessages() {
    try {
      // Get recent chats
      const chats = storage.get(`chats_${this.sessionId}`) || [];
      
      // In a real implementation, this would call the API
      // const response = await api.getMessages(this.sessionId);
      
      // For demo, check if there are any new messages in storage
      chats.forEach(chat => {
        if (chat.unread > 0 && chat.lastUpdate > this.lastCheckTimestamp) {
          this.trigger('message.new', {
            jid: chat.jid,
            name: chat.name,
            message: chat.lastMessage,
            timestamp: chat.timestamp
          });

          // Show browser notification if permission granted
          this.showBrowserNotification(
            `New message from ${chat.name}`,
            chat.lastMessage
          );
        }
      });
    } catch (error) {
      console.error('Error checking new messages:', error);
    }
  }

  // Check connection status
  async checkConnectionStatus() {
    try {
      const data = await api.getSessionStatus(this.sessionId);
      
      if (data.status === 'connected') {
        this.trigger('connection.connected', { sessionId: this.sessionId });
      } else if (data.status === 'disconnected') {
        this.trigger('connection.disconnected', { sessionId: this.sessionId });
        this.showBrowserNotification(
          'WhatsApp Disconnected',
          `Session ${this.sessionId} has been disconnected`
        );
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }

  // Show browser notification
  showBrowserNotification(title, body) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      });
    }
  }

  // Show notification badge
  showNotificationBadge(message) {
    const badge = document.getElementById('eventListenerBadge');
    if (badge) {
      badge.textContent = '🔴 Live';
      badge.title = message;
      badge.style.display = 'inline-block';
    }
  }

  // Remove notification badge
  removeNotificationBadge() {
    const badge = document.getElementById('eventListenerBadge');
    if (badge) {
      badge.style.display = 'none';
    }
  }
}

// Create global instance
const eventListener = new WhatsAppEventListener();

// Auto-start on inbox page
if (window.location.pathname.includes('inbox.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for session to be selected
    const sessionSelect = document.getElementById('sessionSelect');
    if (sessionSelect) {
      sessionSelect.addEventListener('change', () => {
        const sessionId = sessionSelect.value;
        if (sessionId) {
          eventListener.stop();
          eventListener.start(sessionId);
        } else {
          eventListener.stop();
        }
      });
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Add event listeners for UI updates
    eventListener.on('message.new', (data) => {
      console.log('📨 New message:', data);
      
      // Play notification sound (optional)
      playNotificationSound();

      // Update UI if on inbox page
      if (typeof loadChats === 'function') {
        loadChats();
      }

      // Show in-app notification
      showNotification(`New message from ${data.name}`, 'info');
    });

    eventListener.on('connection.disconnected', (data) => {
      console.log('🔌 Connection disconnected:', data);
      showNotification('WhatsApp connection lost! Please reconnect.', 'error');
    });

    eventListener.on('connection.connected', (data) => {
      console.log('✅ Connection restored:', data);
      showNotification('WhatsApp connected!', 'success');
    });
  });

  // Stop listener when leaving page
  window.addEventListener('beforeunload', () => {
    eventListener.stop();
  });
}

// Play notification sound
function playNotificationSound() {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZURE+eK/r5qFXETVVpOHyvWUbBTuP0/HNeCcEI3fH8N2PQAoUXrTp66hVFAk/mtvy');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Could not play sound:', e));
  } catch (error) {
    console.log('Notification sound error:', error);
  }
}

// Export for use in other files
window.eventListener = eventListener;
