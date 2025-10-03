# 🐛 Quick Debug - Schedule Not Showing

## Check localStorage

Buka console (F12) dan paste code ini:

```javascript
// Check what's in localStorage
const schedules = localStorage.getItem('scheduledMessages');
console.log('Raw:', schedules);
console.log('Parsed:', JSON.parse(schedules || '[]'));
```

## Expected Output

**If schedules exist:**
```javascript
[
  {
    id: "schedule_1234567890",
    sessionId: "hyy",
    message: "Your message...",
    recipients: ["628xxx", "628yyy"],
    scheduledTime: "2025-01-10T15:30:00.000Z",
    status: "pending",
    ...
  }
]
```

**If empty:**
```javascript
[]
```

## Fix If Empty

1. Create schedule again from messages page
2. Check console for errors
3. After creating, run this:
   ```javascript
   localStorage.getItem('scheduledMessages');
   ```

## Force Reload Scheduled Page

```javascript
// On scheduled.html page
location.reload();
```

## Manual Test - Add Dummy Schedule

```javascript
// Add test schedule
const testSchedule = {
  id: 'test_' + Date.now(),
  sessionId: 'hyy',
  message: 'Test message',
  messageType: 'text',
  recipients: ['6281234567890'],
  recipientsData: [],
  recipientCount: 1,
  scheduledTime: new Date(Date.now() + 3600000).toISOString(),
  createdAt: new Date().toISOString(),
  status: 'pending',
  mediaUrl: null
};

const schedules = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
schedules.push(testSchedule);
localStorage.setItem('scheduledMessages', JSON.stringify(schedules));

console.log('Test schedule added! Refresh page.');
location.reload();
```
