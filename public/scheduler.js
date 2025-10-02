// Scheduler Service - Handles scheduled message execution
let schedulerInterval = null;
let isSchedulerRunning = false;

function startScheduler() {
  if (isSchedulerRunning) return;
  
  console.log('🕐 Scheduler started');
  isSchedulerRunning = true;
  
  // Update UI
  updateSchedulerStatus(true);
  
  // Check immediately
  checkScheduler();
  
  // Then check every minute
  schedulerInterval = setInterval(checkScheduler, 60000);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  isSchedulerRunning = false;
  updateSchedulerStatus(false);
  console.log('🛑 Scheduler stopped');
}

function checkScheduler() {
  const schedules = storage.get('scheduledMessages') || [];
  const now = new Date();
  
  // Update last check time
  const lastCheckEl = document.getElementById('lastCheck');
  if (lastCheckEl) {
    lastCheckEl.textContent = `Last check: ${now.toLocaleTimeString()}`;
  }
  
  console.log(`⏰ Scheduler check: ${schedules.length} total schedules`);
  
  // Find schedules that should be executed
  const toExecute = schedules.filter(schedule => {
    if (schedule.status !== 'pending') return false;
    
    const scheduleTime = new Date(schedule.scheduledTime);
    return scheduleTime <= now;
  });
  
  if (toExecute.length > 0) {
    console.log(`📤 Found ${toExecute.length} schedule(s) to execute`);
    toExecute.forEach(schedule => executeSchedule(schedule));
  }
}

async function executeSchedule(schedule) {
  console.log(`🚀 Executing schedule: ${schedule.id}`);
  
  try {
    // Get schedules array
    let schedules = storage.get('scheduledMessages') || [];
    const index = schedules.findIndex(s => s.id === schedule.id);
    
    if (index === -1) {
      console.error('Schedule not found');
      return;
    }
    
    // Update status to executing
    schedules[index].status = 'executing';
    storage.save('scheduledMessages', schedules);
    
    // Prepare blast data
    const blastData = {
      sessionId: schedule.sessionId,
      message: schedule.message,
      recipients: schedule.recipients,
      messageType: schedule.messageType || 'text',
      mediaUrl: schedule.mediaUrl
    };
    
    // Execute the blast
    const result = await sendScheduledBlast(blastData);
    
    // Update schedule with result
    schedules = storage.get('scheduledMessages') || [];
    const updatedIndex = schedules.findIndex(s => s.id === schedule.id);
    
    if (updatedIndex !== -1) {
      schedules[updatedIndex].status = result.success ? 'sent' : 'failed';
      schedules[updatedIndex].executedAt = new Date().toISOString();
      schedules[updatedIndex].sentCount = result.sent || 0;
      schedules[updatedIndex].failedCount = result.failed || 0;
      schedules[updatedIndex].error = result.error;
      
      storage.save('scheduledMessages', schedules);
    }
    
    showNotification(
      result.success 
        ? `✅ Scheduled blast sent! ${result.sent}/${result.total} messages` 
        : `❌ Scheduled blast failed: ${result.error}`,
      result.success ? 'success' : 'error'
    );
    
    console.log('✅ Schedule executed:', result);
    
  } catch (error) {
    console.error('❌ Schedule execution error:', error);
    
    // Mark as failed
    let schedules = storage.get('scheduledMessages') || [];
    const index = schedules.findIndex(s => s.id === schedule.id);
    if (index !== -1) {
      schedules[index].status = 'failed';
      schedules[index].error = error.message;
      storage.save('scheduledMessages', schedules);
    }
    
    showNotification(`Schedule failed: ${error.message}`, 'error');
  }
}

async function sendScheduledBlast(data) {
  // This will send the actual blast
  // Similar to the logic in messages.js but for scheduled messages
  
  try {
    const { sessionId, recipients, message, messageType, mediaUrl } = data;
    
    // Validate session
    if (!sessionId) {
      throw new Error('No session selected');
    }
    
    // Get settings for delays and limits
    const settings = storage.get('appSettings') || {};
    const minDelay = (settings.minDelay || 5) * 1000;
    const maxDelay = (settings.maxDelay || 15) * 1000;
    
    // Get blacklist
    const blacklist = storage.get('blacklist') || [];
    
    // Filter out blacklisted recipients
    const validRecipients = recipients.filter(r => {
      const phone = r.replace(/\D/g, '');
      return !blacklist.some(b => b.number === phone);
    });
    
    console.log(`📤 Sending to ${validRecipients.length} recipients`);
    
    let sent = 0;
    let failed = 0;
    const failedMessages = [];
    
    for (const recipient of validRecipients) {
      try {
        // Random delay
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Send message
        const response = await fetch(`${API_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            to: recipient,
            text: message,
            type: messageType,
            mediaUrl: mediaUrl
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          sent++;
          console.log(`✅ Sent to ${recipient}`);
        } else {
          failed++;
          failedMessages.push({
            recipient,
            message,
            error: result.error,
            timestamp: new Date().toISOString()
          });
          console.error(`❌ Failed to ${recipient}:`, result.error);
        }
        
      } catch (error) {
        failed++;
        failedMessages.push({
          recipient,
          message,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.error(`❌ Error sending to ${recipient}:`, error);
      }
    }
    
    // Save failed messages if any
    if (failedMessages.length > 0) {
      const existingFailed = storage.get('failedMessages') || [];
      storage.save('failedMessages', [...existingFailed, ...failedMessages]);
    }
    
    // Save to history
    const history = storage.get('blastHistory') || [];
    history.unshift({
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      messageType: messageType || 'text',
      total: validRecipients.length,
      sent: sent,
      failed: failed,
      source: 'scheduled'
    });
    storage.save('blastHistory', history);
    
    return {
      success: failed === 0,
      total: validRecipients.length,
      sent,
      failed,
      error: failed > 0 ? `${failed} messages failed` : null
    };
    
  } catch (error) {
    console.error('Blast error:', error);
    return {
      success: false,
      total: 0,
      sent: 0,
      failed: 0,
      error: error.message
    };
  }
}

function updateSchedulerStatus(active) {
  const icon = document.getElementById('schedulerStatusIcon');
  const text = document.getElementById('schedulerStatusText');
  
  if (icon && text) {
    if (active) {
      icon.className = 'fas fa-circle active';
      icon.style.color = 'var(--success)';
      text.textContent = 'Scheduler Active';
    } else {
      icon.className = 'fas fa-circle';
      icon.style.color = '#ccc';
      text.textContent = 'Scheduler Inactive';
    }
  }
}

// Auto-start scheduler when page loads
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only start on scheduled page
    if (window.location.pathname.includes('scheduled.html')) {
      startScheduler();
    }
  });
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopScheduler();
  });
}
