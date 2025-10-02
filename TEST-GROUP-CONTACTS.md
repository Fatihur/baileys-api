# 🧪 Test: Kontak Grup

## ✅ Fix Yang Sudah Diterapkan

1. **Debug logging** - Console akan show details
2. **Re-render groups** - Setelah add/import kontak
3. **Better tracking** - Group count update otomatis

---

## 🚀 Testing Steps

### **Step 1: Refresh Browser**
```
Ctrl + Shift + R (hard refresh)
```

### **Step 2: Buka Console**
```
F12 → Tab "Console"
```

### **Step 3: Buka Contacts Page**
```
http://localhost:3000/contacts.html
```

---

## 📝 Test Case 1: Create Group + Add Contact

### **3.1 Create Group**
```
1. Klik "Buat Grup"
2. Nama: "Test Pelanggan"
3. Pilih warna (opsional)
4. Save
```

**Check Console:**
```
✅ "➕ New group created: {id: xxx, name: 'Test Pelanggan', ...}"
✅ "📊 Rendering groups: [{...}]"
```

**Check UI:**
- Group card muncul dengan nama "Test Pelanggan"
- Menampilkan "0 kontak" (belum ada isi)

---

### **3.2 Add Contact to Group**
```
1. Klik "Tambah Kontak"
2. Nomor: 6281234567890
3. Nama: Budi
4. Grup: Select "Test Pelanggan"
5. Save
```

**Check Console:**
```
✅ "➕ New contact added: {id: xxx, number: '6281234567890', name: 'Budi', group: xxx, ...}"
✅ "📋 All contacts: [{...}]"
✅ "📊 Rendering groups: [{...}]"
✅ "✅ Group 'Test Pelanggan' (ID: xxx): 1 contacts [{...}]"
```

**Check UI:**
- Group card "Test Pelanggan" berubah jadi "1 kontak" ✅
- Kontak Budi muncul di tabel dengan badge group

---

### **3.3 Add Another Contact**
```
1. Klik "Tambah Kontak"
2. Nomor: 6281234567891
3. Nama: Ani
4. Grup: Select "Test Pelanggan"
5. Save
```

**Check UI:**
- Group card "Test Pelanggan" berubah jadi "2 kontak" ✅

---

## 📝 Test Case 2: Import CSV with Groups

### **2.1 Create CSV File**
Create file: `test-contacts.csv`
```csv
6281111111111,User 1
6281222222222,User 2
6281333333333,User 3
```

### **2.2 Import**
```
1. Klik "Import CSV"
2. Select test-contacts.csv
3. Upload
```

**Check Console:**
```
✅ "📥 Imported 3 contacts"
✅ "📋 All contacts: [{...}, {...}, {...}]"
```

### **2.3 Assign to Group**
```
Karena import CSV tidak support group assignment,
kontak akan masuk tanpa grup (null).

To assign:
1. Edit kontak di tabel (jika ada fitur edit)
2. Atau hapus dan tambah manual
```

---

## 🔍 Debug: Check Data Structure

### **In Browser Console:**

```javascript
// Check all groups
const groups = JSON.parse(localStorage.getItem('contactGroups'));
console.table(groups);

// Check all contacts
const contacts = JSON.parse(localStorage.getItem('contacts'));
console.table(contacts);

// Check if IDs match
groups.forEach(g => {
  const count = contacts.filter(c => c.group === g.id).length;
  console.log(`Group: ${g.name} (${g.id}) → ${count} contacts`);
});

// Check specific contact's group
const contact = contacts[0];
console.log('First contact:', contact);
console.log('  - Name:', contact.name);
console.log('  - Group ID:', contact.group);
console.log('  - Group Type:', typeof contact.group);

// Find matching group
const matchedGroup = groups.find(g => g.id === contact.group);
console.log('  - Matched Group:', matchedGroup);
```

---

## ❌ Troubleshooting

### **Problem 1: Group masih "0 kontak"**

**Check in Console:**
```javascript
// Are IDs matching?
const groups = JSON.parse(localStorage.getItem('contactGroups'));
const contacts = JSON.parse(localStorage.getItem('contacts'));

console.log('Group ID type:', typeof groups[0].id);
console.log('Contact group type:', typeof contacts[0].group);

// If mismatch (number vs string):
console.log('Group ID:', groups[0].id);
console.log('Contact group:', contacts[0].group);
console.log('Match?', groups[0].id === contacts[0].group);
```

**Fix:**
```javascript
// If they don't match, manually update:
contacts.forEach(c => {
  if (c.group) c.group = groups[0].id; // Force same ID
});
localStorage.setItem('contacts', JSON.stringify(contacts));
location.reload();
```

---

### **Problem 2: Console tidak show logs**

**Check:**
1. Apakah sudah hard refresh? (Ctrl+Shift+R)
2. Apakah file contacts.js ter-cache?
3. Coba clear browser cache

**Force reload:**
```
1. F12 → Network tab
2. Check "Disable cache"
3. Refresh page
```

---

### **Problem 3: Contact tidak tersimpan**

**Check Console for errors:**
- Red error messages?
- "Cannot read property..."?
- Storage quota exceeded?

**Try:**
```javascript
// Clear and start fresh
localStorage.clear();
location.reload();
```

---

## ✅ Success Indicators

1. **Console logs:**
   - ✅ "➕ New group created"
   - ✅ "➕ New contact added"
   - ✅ "📊 Rendering groups"
   - ✅ "✅ Group 'Name' (ID: xxx): N contacts"

2. **UI:**
   - ✅ Group card shows correct count
   - ✅ Count updates after add/import
   - ✅ Contacts show group badge

3. **Data:**
   - ✅ `contact.group === group.id`
   - ✅ No undefined or mismatches

---

## 📊 Expected Data

### **Group:**
```json
{
  "id": 1234567890,
  "name": "Test Pelanggan",
  "color": "#667eea",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### **Contact:**
```json
{
  "id": 1234567891,
  "number": "6281234567890",
  "name": "Budi",
  "group": 1234567890,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### **Match:**
```javascript
contact.group === group.id // true
1234567890 === 1234567890  // true
```

---

## 📸 Screenshot Checklist

Bisa send screenshot dari:
1. ✅ Group card dengan "X kontak"
2. ✅ Console logs (show debug messages)
3. ✅ Contact tabel dengan group badge

---

**Status:** Ready for testing! 🧪
**Expected time:** 2-3 minutes
**Result:** Group count should update correctly ✅
