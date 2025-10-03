# 🔧 Variable Scope Fix - Schedule Blast

## 🔴 Problem

**"Pilih minimal 1 penerima!"** error muncul padahal penerima sudah dipilih.

## 🐛 Root Cause

Variabel `recipients` di `messages.js` adalah **local variable** (`let`), tidak bisa diakses dari `schedule-functions.js`.

```javascript
// messages.js (OLD - BROKEN)
let recipients = [];  // ❌ Not accessible from other scripts

// schedule-functions.js
const currentRecipients = window.recipients || [];  // ❌ undefined
```

## ✅ Solution

### **1. Expose as Global Variables**

Changed all main variables to `window.*` di `messages.js`:

```javascript
// messages.js (NEW - FIXED)
window.recipients = [];        // ✅ Global
window.recipientsData = [];    // ✅ Global
window.currentMessageType = 'text';  // ✅ Global
window.uploadedImageFile = null;     // ✅ Global
window.uploadedDocumentFile = null;  // ✅ Global

// Local references for convenience
let recipients = window.recipients;
let recipientsData = window.recipientsData;
// ... etc
```

### **2. Update on Confirm**

Modified `recipient-modal.js` to update global:

```javascript
// recipient-modal.js
function confirmRecipients() {
  recipients = [...tempSelectedRecipients];
  recipientsData = [...tempSelectedData];
  
  // ✅ Update window global variables
  window.recipients = recipients;
  window.recipientsData = recipientsData;
  
  // ... rest of code
}
```

### **3. Check from Button Count (Fallback)**

Modified `schedule-functions.js` untuk fallback:

```javascript
// schedule-functions.js
function openScheduleModal() {
  // ✅ Primary: Check window.recipients
  // ✅ Fallback: Check button text content
  const recipientCount = document.getElementById('recipientCountBtn')?.textContent || '0';
  const currentRecipients = parseInt(recipientCount);
  
  if (currentRecipients === 0) {
    showNotification('Pilih minimal 1 penerima!', 'error');
    return;
  }
  // ...
}
```

## 🎯 How It Works Now

### **Flow:**

1. **User clicks "Pilih Penerima"**
   ```
   recipient-modal.js opens
   ```

2. **User selects contacts**
   ```
   tempSelectedRecipients = ['628xxx', '628yyy']
   ```

3. **User clicks "Konfirmasi"**
   ```javascript
   confirmRecipients() {
     recipients = [...tempSelectedRecipients];
     window.recipients = recipients;  // ✅ Update global
     // Button shows: "2"
   }
   ```

4. **User clicks "Schedule Blast"**
   ```javascript
   openScheduleModal() {
     // Check window.recipients OR button count
     const count = window.recipients?.length || parseInt(buttonText);
     if (count > 0) {
       // ✅ Modal opens!
     }
   }
   ```

## 🧪 Testing

### **Test 1: Check Global Access**

```javascript
// Open console (F12)
console.log(window.recipients);
// Should show: ['628xxx', '628yyy', ...]

console.log(window.recipientsData);
// Should show: [{number: '628xxx', variables: {...}}, ...]
```

### **Test 2: Validation Works**

```bash
# 1. DON'T select recipients
# 2. Click "Schedule Blast"
# ✅ Should show: "Pilih minimal 1 penerima!"

# 3. Click "Pilih Penerima", add 1 contact
# 4. Click "Schedule Blast"
# ✅ Should show modal!
```

### **Test 3: Button Count Sync**

```javascript
// After selecting recipients
const btn = document.getElementById('recipientCountBtn');
console.log(btn.textContent);
// Should match: window.recipients.length
```

## 📝 Files Changed

### **1. messages.js**
- ✅ Changed to `window.recipients`
- ✅ Changed to `window.recipientsData`
- ✅ Changed to `window.currentMessageType`
- ✅ Added local references for convenience

### **2. recipient-modal.js**
- ✅ Update `window.recipients` on confirm
- ✅ Update `window.recipientsData` on confirm

### **3. schedule-functions.js**
- ✅ Read from button count (fallback)
- ✅ Access `window.recipients`
- ✅ Safe null checks

## 🚀 How to Test

### **Step 1: Refresh Page**

```bash
# Hard refresh
Ctrl+F5
```

### **Step 2: Open Console**

```javascript
// Check if globals exist
console.log(typeof window.recipients);
// Should be: "object"
```

### **Step 3: Select Recipients**

1. Click "Pilih Penerima"
2. Add 1+ contacts
3. Click "Konfirmasi"
4. Check console:
   ```javascript
   console.log(window.recipients.length);
   // Should be: > 0
   ```

### **Step 4: Schedule Blast**

1. Fill form (session, message)
2. Click "Schedule Blast"
3. ✅ Modal should open!

## 🐛 Debug

### **If Still Shows "Pilih minimal 1 penerima":**

```javascript
// F12 Console
console.log('Recipients:', window.recipients);
console.log('Button text:', document.getElementById('recipientCountBtn')?.textContent);

// Both should show > 0
```

### **If window.recipients is undefined:**

```javascript
// Check if messages.js loaded
console.log(typeof confirmRecipients);
// Should be: "function"

// Check if script tag exists
document.querySelectorAll('script[src="messages.js"]');
// Should find 1 element
```

### **If button count is "0":**

```javascript
// After selecting recipients, check:
console.log('Temp:', tempSelectedRecipients);
console.log('Recipients:', recipients);
console.log('Window:', window.recipients);

// All should match
```

## ✅ Summary

**Problem:** Scope issue - `recipients` not accessible

**Fix:** 
1. ✅ Expose as `window.recipients`
2. ✅ Update global on confirm
3. ✅ Fallback to button count

**Test:** Refresh → Select recipients → Click Schedule Blast → Modal opens!

---

**Status: FIXED** ✅

**Next:** Refresh page (Ctrl+F5) and test!
