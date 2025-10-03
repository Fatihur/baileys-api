# ✅ Quick Verification - Schedule Blast

## 🔧 Fix Applied

Changed `schedule-functions.js` to use `localStorage` directly instead of `storage` object:

```javascript
// OLD (might fail if storage not loaded)
const schedules = storage.get('scheduledMessages') || [];
storage.save('scheduledMessages', schedules);

// NEW (always works)
const schedules = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
localStorage.setItem('scheduledMessages', JSON.stringify(schedules));
```

## 🚀 How to Test

### **Step 1: Refresh Messages Page**

```bash
# Hard refresh
Ctrl+F5 on http://localhost:3000/messages.html
```

### **Step 2: Create New Schedule**

1. Select session
2. Add recipients (1+)
3. Write message
4. Click "Schedule Blast"
5. Set date/time (+5 min from now)
6. Click "Schedule Blast" (in modal)
7. Should see: "✅ Blast scheduled for [datetime]!"

### **Step 3: Check localStorage**

Open console (F12) and run:

```javascript
// Check if saved
const schedules = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
console.log('Total schedules:', schedules.length);
console.log('Last schedule:', schedules[schedules.length - 1]);
```

**Expected output:**
```javascript
Total schedules: 1 (or more)
Last schedule: {
  id: "schedule_1736508123456",
  sessionId: "hyy",
  message: "Your message...",
  recipients: ["628xxx", ...],
  scheduledTime: "2025-01-10T10:30:00.000Z",
  status: "pending",
  ...
}
```

### **Step 4: Check Scheduled Page**

```bash
# Navigate to
http://localhost:3000/scheduled.html
```

**Should see:**
- Total Scheduled: 1+
- Pending: 1+
- Schedule card with your message

### **Step 5: Verify Card Shows**

Card should display:
- ✅ Session name
- ✅ Recipient count
- ✅ Message preview
- ✅ Scheduled time
- ✅ Status badge (Pending)
- ✅ Actions (View, Cancel, Delete)

## 🐛 If Schedule Still Not Showing

### **Debug 1: Check localStorage on Scheduled Page**

On `scheduled.html`, open console:

```javascript
// What scheduled.html reads
const schedules = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
console.log('Schedules from localStorage:', schedules);

// What the page variable has
console.log('Page schedules variable:', window.schedules);
```

Both should match!

### **Debug 2: Force Reload Scheduled Page**

```javascript
// On scheduled.html
location.reload();
```

### **Debug 3: Check Network Errors**

F12 → Console → Look for any red errors

### **Debug 4: Check Script Loading**

```javascript
// Check if config.js loaded
console.log(typeof storage);
// Should be: "object"

// Check if functions exist
console.log(typeof loadSchedules);
// Should be: "function"
```

## 🧪 Manual Test - Add Dummy Schedule

If still not working, add test schedule manually:

```javascript
// Run in console
const testSchedule = {
  id: 'test_' + Date.now(),
  sessionId: 'hyy',
  message: 'This is a test message for debugging',
  messageType: 'text',
  messagePreview: 'This is a test message for debugging',
  recipients: ['6281234567890', '6287654321098'],
  recipientsData: [],
  recipientCount: 2,
  scheduledTime: new Date(Date.now() + 3600000).toISOString(), // +1 hour
  createdAt: new Date().toISOString(),
  status: 'pending',
  mediaUrl: null,
  fileName: null
};

const schedules = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
schedules.push(testSchedule);
localStorage.setItem('scheduledMessages', JSON.stringify(schedules));

console.log('✅ Test schedule added!');
console.log('Navigate to scheduled.html to see it');
```

Then refresh scheduled.html - test schedule should appear!

## ✅ Success Checklist

- [ ] Hard refresh messages.html (Ctrl+F5)
- [ ] Create schedule successfully
- [ ] Console shows schedule in localStorage
- [ ] Navigate to scheduled.html
- [ ] See schedule card displayed
- [ ] Stats updated (Total Scheduled, Pending)
- [ ] Can view schedule details
- [ ] Can cancel schedule
- [ ] Can delete schedule

## 📝 Key Points

1. **storage object** = Helper in config.js
2. **localStorage** = Direct browser API
3. Both use same key: `'scheduledMessages'`
4. schedule-functions.js now uses localStorage directly
5. scheduled.html uses storage object (from config.js)
6. Both should read/write same data!

## 🎯 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Schedule not saved | Script error | Check console (F12) |
| Schedule saved but not showing | Cache issue | Hard refresh (Ctrl+F5) |
| Empty list on scheduled page | localStorage key mismatch | Run debug script above |
| Stats showing 0 | loadSchedules() not called | Refresh page |
| Card not rendering | Template error | Check console errors |

---

**Status:** Schedule storage fixed - now using localStorage directly

**Next:** Test by creating new schedule and checking scheduled.html
