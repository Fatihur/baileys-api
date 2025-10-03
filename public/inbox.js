// Inbox Page JavaScript

let currentSessionId = null;
let currentChatJid = null;
let chats = [];
let messages = [];

document.addEventListener('DOMContentLoaded', () => {
  loadSessions();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('sessionSelect').addEventListener('change', handleSessionChange);
}

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
    
    // Auto-select first session
    if (connectedSessions.length > 0) {
      select.value = connectedSessions[0].sessionId;
      handleSessionChange();
    }
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showNotification('Failed to load sessions', 'error');
  }
}

async function handleSessionChange() {
  currentSessionId = document.getElementById('sessionSelect').value;
  
  if (!currentSessionId) {
    renderEmptyChats();
    return;
  }
  
  await loadChats();
}

async function loadChats() {
  try {
    // Get chats from real API
    const data = await api.getChats(currentSessionId);
    chats = data.chats || [];
    
    // Store in localStorage for caching
    storage.save(`chats_${currentSessionId}`, chats);
    
    renderChats();
  } catch (error) {
    console.error('Failed to load chats:', error);
    showNotification('Failed to load chats', 'error');
    
    // Fallback to localStorage if API fails
    chats = storage.get(`chats_${currentSessionId}`) || [];
    if (chats.length > 0) {
      renderChats();
      showNotification('Showing cached chats (offline)', 'warning');
    }
  }
}

function renderChats() {
  const container = document.getElementById('chatsList');
  
  if (chats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <p>No chats yet</p>
        <small>Start a conversation from WhatsApp app first, then refresh here</small>
        <button class="btn btn-sm btn-primary" onclick="loadChats()" style="margin-top: 10px;">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = chats.map(chat => `
    <div class="chat-item ${currentChatJid === chat.jid ? 'active' : ''}" onclick="openChat('${chat.jid}')">
      <div class="chat-avatar">
        <i class="fas fa-${chat.isGroup ? 'users' : 'user'}"></i>
      </div>
      <div class="chat-info">
        <div class="chat-name">
          ${chat.name}
          ${chat.isGroup ? '<span class="badge badge-secondary">Group</span>' : ''}
        </div>
        <div class="chat-preview">${chat.lastMessage || 'No messages'}</div>
      </div>
      <div class="chat-meta">
        <div>${formatTime(chat.timestamp)}</div>
        ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderEmptyChats() {
  const container = document.getElementById('chatsList');
  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-comments"></i>
      <p>No chats yet</p>
      <small>Select a connection to load chats</small>
    </div>
  `;
}

async function openChat(jid) {
  currentChatJid = jid;
  renderChats(); // Update active state
  
  const chat = chats.find(c => c.jid === jid);
  
  // Mark chat as read
  if (chat) {
    chat.unread = 0;
    storage.save(`chats_${currentSessionId}`, chats);
    renderChats();
  }
  
  await loadMessages(jid);
  renderChatWindow(chat);
}

async function loadMessages(jid) {
  try {
    // Get messages from real API
    const data = await api.getMessages(currentSessionId, jid, 50);
    messages = data.messages || [];
    
    // Store in localStorage for caching
    storage.save(`messages_${currentSessionId}_${jid}`, messages);
  } catch (error) {
    console.error('Failed to load messages:', error);
    
    // Fallback to localStorage if API fails
    messages = storage.get(`messages_${currentSessionId}_${jid}`) || [];
    if (messages.length > 0) {
      showNotification('Showing cached messages (offline)', 'warning');
    }
  }
}

function renderChatWindow(chat) {
  const container = document.getElementById('chatWindow');
  
  if (!chat) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comment-dots"></i>
        <p>Select a chat to start</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="chat-window-header">
      <div class="chat-window-header-left">
        <div class="chat-avatar">
          <i class="fas fa-${chat.type === 'group' ? 'users' : 'user'}"></i>
        </div>
        <div class="header-contact-info">
          <h3>${chat.name}</h3>
          <p class="status-online">
            <i class="fas fa-circle"></i> Online
          </p>
        </div>
      </div>
      <div class="chat-window-header-right">
        <button class="btn btn-sm btn-secondary" onclick="refreshMessages()" title="Refresh">
          <i class="fas fa-sync"></i>
        </button>
        <button class="btn btn-sm btn-secondary" onclick="checkNumberStatus()" title="Check Status">
          <i class="fas fa-info-circle"></i>
        </button>
      </div>
    </div>
    
    <div class="messages-container" id="messagesContainer">
      ${renderMessages()}
    </div>
    
    <div class="chat-input-area">
      <div class="chat-input-container">
        <textarea 
          id="messageInput" 
          class="chat-input" 
          placeholder="Type a message..." 
          rows="1"
          onkeypress="handleInputKeyPress(event)"
          oninput="handleTyping()"
        ></textarea>
        <div class="input-actions">
          <button class="btn btn-secondary" onclick="sendMessage()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Auto scroll to bottom
  setTimeout(() => {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 100);
}

function renderMessages() {
  if (messages.length === 0) {
    return '<div class="empty-state"><i class="fas fa-comments"></i><p>No messages</p></div>';
  }
  
  return messages.map(msg => `
    <div class="message ${msg.fromMe ? 'sent' : 'received'}">
      <div class="message-bubble ${msg.pinned ? 'pinned' : ''}">
        <div class="message-actions">
          <button class="message-action-btn" onclick="replyToMessage('${msg.id}')" title="Reply">
            <i class="fas fa-reply"></i>
          </button>
          <button class="message-action-btn" onclick="forwardMessage('${msg.id}')" title="Forward">
            <i class="fas fa-share"></i>
          </button>
          <button class="message-action-btn" onclick="togglePinMessage('${msg.id}')" title="${msg.pinned ? 'Unpin' : 'Pin'}">
            <i class="fas fa-thumbtack"></i>
          </button>
          <button class="message-action-btn" onclick="deleteMessage('${msg.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <p class="message-text">${msg.text}</p>
        <div class="message-meta">
          <span>${formatTime(msg.timestamp)}</span>
          ${msg.fromMe ? `<i class="fas fa-${getStatusIcon(msg.status)}"></i>` : ''}
          ${msg.pinned ? '<i class="fas fa-thumbtack" style="color: var(--warning);"></i>' : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function getStatusIcon(status) {
  switch(status) {
    case 'sent': return 'check';
    case 'delivered': return 'check-double';
    case 'read': return 'check-double" style="color: var(--info);';
    default: return 'clock';
  }
}

function handleInputKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

let typingTimeout;
function handleTyping() {
  if (!currentSessionId || !currentChatJid) return;
  
  // Send typing indicator
  api.sendTyping(currentSessionId, currentChatJid, true).catch(console.error);
  
  // Clear typing after 3 seconds
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    api.sendTyping(currentSessionId, currentChatJid, false).catch(console.error);
  }, 3000);
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text || !currentSessionId || !currentChatJid) return;
  
  try {
    // Send message
    await api.sendTextMessage(currentSessionId, currentChatJid.replace('@s.whatsapp.net', ''), text);
    
    // Add to messages
    const newMessage = {
      id: 'msg_' + Date.now(),
      from: currentSessionId,
      to: currentChatJid,
      text: text,
      timestamp: Date.now(),
      fromMe: true,
      status: 'sent',
      pinned: false
    };
    
    messages.push(newMessage);
    storage.save(`messages_${currentSessionId}_${currentChatJid}`, messages);
    
    // Update chat last message
    const chat = chats.find(c => c.jid === currentChatJid);
    if (chat) {
      chat.lastMessage = text;
      chat.timestamp = Date.now();
      storage.save(`chats_${currentSessionId}`, chats);
      renderChats();
    }
    
    // Re-render messages
    renderChatWindow(chat);
    
    // Clear input
    input.value = '';
    
    showNotification('Message sent!', 'success');
  } catch (error) {
    console.error('Failed to send message:', error);
    showNotification('Failed to send message: ' + error.message, 'error');
  }
}

async function replyToMessage(messageId) {
  const message = messages.find(m => m.id === messageId);
  if (!message) return;
  
  const replyText = prompt('Reply to: "' + message.text.substring(0, 50) + '..."\n\nYour reply:');
  if (!replyText) return;
  
  try {
    await api.replyMessage(currentSessionId, currentChatJid, messageId, replyText);
    
    // Add reply message
    const newMessage = {
      id: 'msg_' + Date.now(),
      from: currentSessionId,
      to: currentChatJid,
      text: `Reply to: "${message.text.substring(0, 30)}..."\n\n${replyText}`,
      timestamp: Date.now(),
      fromMe: true,
      status: 'sent',
      pinned: false
    };
    
    messages.push(newMessage);
    storage.save(`messages_${currentSessionId}_${currentChatJid}`, messages);
    
    const chat = chats.find(c => c.jid === currentChatJid);
    renderChatWindow(chat);
    
    showNotification('Reply sent!', 'success');
  } catch (error) {
    console.error('Failed to reply:', error);
    showNotification('Failed to send reply', 'error');
  }
}

async function forwardMessage(messageId) {
  const message = messages.find(m => m.id === messageId);
  if (!message) return;
  
  const targetNumber = prompt('Forward to (phone number):');
  if (!targetNumber) return;
  
  try {
    const targetJid = targetNumber + '@s.whatsapp.net';
    await api.forwardMessage(currentSessionId, currentChatJid, messageId, targetJid);
    showNotification('Message forwarded!', 'success');
  } catch (error) {
    console.error('Failed to forward:', error);
    showNotification('Failed to forward message', 'error');
  }
}

async function togglePinMessage(messageId) {
  const message = messages.find(m => m.id === messageId);
  if (!message) return;
  
  try {
    const newPinState = !message.pinned;
    await api.pinMessage(currentSessionId, currentChatJid, messageId, newPinState);
    
    message.pinned = newPinState;
    storage.save(`messages_${currentSessionId}_${currentChatJid}`, messages);
    
    const chat = chats.find(c => c.jid === currentChatJid);
    renderChatWindow(chat);
    
    showNotification(newPinState ? 'Message pinned!' : 'Message unpinned!', 'success');
  } catch (error) {
    console.error('Failed to pin/unpin:', error);
    showNotification('Failed to pin/unpin message', 'error');
  }
}

async function deleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;
  
  const forEveryone = confirm('Delete for everyone? (Click Cancel to delete for you only)');
  
  try {
    await api.deleteMessage(currentSessionId, currentChatJid, messageId, forEveryone);
    
    // Remove from messages
    messages = messages.filter(m => m.id !== messageId);
    storage.save(`messages_${currentSessionId}_${currentChatJid}`, messages);
    
    const chat = chats.find(c => c.jid === currentChatJid);
    renderChatWindow(chat);
    
    showNotification('Message deleted!', 'success');
  } catch (error) {
    console.error('Failed to delete:', error);
    showNotification('Failed to delete message', 'error');
  }
}

async function refreshMessages() {
  await loadMessages(currentChatJid);
  const chat = chats.find(c => c.jid === currentChatJid);
  renderChatWindow(chat);
  showNotification('Messages refreshed!', 'success');
}

async function checkNumberStatus() {
  if (!currentChatJid) return;
  
  try {
    const phoneNumber = currentChatJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    const result = await api.checkNumberRegistered(currentSessionId, phoneNumber);
    
    if (result.registered) {
      showNotification('✓ Number is registered on WhatsApp', 'success');
    } else {
      showNotification('✗ Number is not registered on WhatsApp', 'warning');
    }
  } catch (error) {
    console.error('Failed to check status:', error);
    showNotification('Failed to check number status', 'error');
  }
}

function filterChats() {
  const search = document.getElementById('chatSearch').value.toLowerCase();
  const filtered = chats.filter(chat => 
    chat.name.toLowerCase().includes(search) || 
    chat.lastMessage?.toLowerCase().includes(search)
  );
  
  const container = document.getElementById('chatsList');
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No chats found</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(chat => `
    <div class="chat-item ${currentChatJid === chat.jid ? 'active' : ''}" onclick="openChat('${chat.jid}')">
      <div class="chat-avatar">
        <i class="fas fa-${chat.type === 'group' ? 'users' : 'user'}"></i>
      </div>
      <div class="chat-info">
        <div class="chat-name">
          ${chat.name}
          ${chat.type === 'group' ? '<span class="badge badge-secondary">Group</span>' : ''}
        </div>
        <div class="chat-preview">${chat.lastMessage || 'No messages'}</div>
      </div>
      <div class="chat-meta">
        <div>${formatTime(chat.timestamp)}</div>
        ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'Just now';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
  
  // Show date
  return date.toLocaleDateString();
}
