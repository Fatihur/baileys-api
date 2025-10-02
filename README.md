# Baileys WhatsApp Gateway API

REST API Gateway untuk WhatsApp menggunakan library Baileys dengan fitur lengkap untuk integrasi bisnis.

## 🚀 Fitur

### Session Management
- ✅ Multi-session support (multiple WhatsApp accounts)
- ✅ QR Code authentication
- ✅ Auto reconnect
- ✅ Session status monitoring

### Messaging
- ✅ Send text messages
- ✅ Send media (image, video, audio, document)
- ✅ Send location
- ✅ Send contact
- ✅ Bulk messaging dengan delay
- ✅ Webhook untuk receive messages

### Group Management
- ✅ Get all groups
- ✅ Create group
- ✅ Add/remove participants
- ✅ Leave group

### Contact Management
- ✅ Get all contacts
- ✅ Check if number registered on WhatsApp

### Security & Performance
- ✅ API Key authentication
- ✅ Rate limiting (100 req/min)
- ✅ Error handling & logging
- ✅ Support large media files (up to 50MB)

## Installation

```bash
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
API_KEY=your-secret-api-key-here
WEBHOOK_URL=https://your-webhook-url.com/webhook
```

**Important:** Ganti `API_KEY` dengan key yang aman untuk production!

## 🏃 Running

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Server akan running di `http://localhost:3000`

## 🔐 Authentication

Semua endpoint (kecuali `/`) memerlukan authentication menggunakan API Key.

**Method 1: Header**
```bash
curl -H "X-API-KEY: your-api-key-here" http://localhost:3000/api/sessions
```

**Method 2: Query Parameter**
```bash
curl http://localhost:3000/api/sessions?apiKey=your-api-key-here
```

## 📚 API Endpoints

### Session Management

#### 1. Create Session

Membuat session baru dan generate QR code untuk login WhatsApp.

**Endpoint:** `POST /api/session/create`

**Body:**
```json
{
  "sessionId": "session1",
  "webhook": "https://your-webhook.com/receive" 
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "sessionId": "session1"
}
```

#### 2. Get Session Status (JSON)

Mendapatkan status session dan QR code (jika belum login) dalam format JSON.

**Endpoint:** `GET /api/session/:sessionId/status`

**Response:**
```json
{
  "sessionId": "session1",
  "status": "connecting",
  "qr": "data:image/png;base64,..."
}
```

Status:
- `connecting`: Waiting for QR scan
- `connected`: WhatsApp connected
- `disconnected`: Session disconnected

---

#### 2b. Get QR Code (HTML Page)

**RECOMMENDED:** Menampilkan QR code dalam HTML page yang cantik dan mudah di-scan.

**Endpoint:** `GET /qr/:sessionId` (**Tanpa auth, tanpa `/api`**)

Buka di browser: `http://localhost:3000/qr/my-session`

Features:
- ✅ Auto-refresh setiap 5 detik
- ✅ Tampilan visual yang menarik
- ✅ Instruksi cara scan
- ✅ Menampilkan status connected jika sudah login
- ✅ **Tidak perlu API Key!**

#### 3. Get All Sessions

Mendapatkan list semua session.

**Endpoint:** `GET /api/sessions`

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session1",
      "status": "connected"
    }
  ]
}
```

#### 4. Delete Session

Logout dan hapus session.

**Endpoint:** `DELETE /api/session/:sessionId`

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

### Messaging

#### 1. Send Text Message

Mengirim pesan text.

**Endpoint:** `POST /api/message/text`

**Body:**
```json
{
  "sessionId": "my-session",
  "to": "6281234567890",
  "message": "Hello from Gateway API!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Text message sent successfully"
}
```

---

#### 2. Send Media Message

Mengirim media (image, video, audio, document).

**Endpoint:** `POST /api/message/media`

**Body (Image):**
```json
{
  "sessionId": "my-session",
  "to": "6281234567890",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image",
  "caption": "Check this out!"
}
```

**Body (Document):**
```json
{
  "sessionId": "my-session",
  "to": "6281234567890",
  "mediaUrl": "https://example.com/document.pdf",
  "mediaType": "document",
  "fileName": "invoice.pdf",
  "caption": "Your invoice"
}
```

**Media Types:** `image`, `video`, `audio`, `document`

---

#### 3. Send Location

Mengirim lokasi.

**Endpoint:** `POST /api/message/location`

**Body:**
```json
{
  "sessionId": "my-session",
  "to": "6281234567890",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "name": "Jakarta",
  "address": "Jakarta, Indonesia"
}
```

---

#### 4. Send Contact

Mengirim kontak.

**Endpoint:** `POST /api/message/contact`

**Body:**
```json
{
  "sessionId": "my-session",
  "to": "6281234567890",
  "contactName": "John Doe",
  "contactNumber": "6281234567890"
}
```

---

#### 5. Send Bulk Messages

Mengirim pesan ke banyak nomor sekaligus dengan delay.

**Endpoint:** `POST /api/message/bulk`

**Body:**
```json
{
  "sessionId": "my-session",
  "recipients": ["6281234567890", "6281234567891", "6281234567892"],
  "message": "Broadcast message to all",
  "delay": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk messages completed: 3 sent, 0 failed",
  "results": [
    { "recipient": "6281234567890", "status": "sent" },
    { "recipient": "6281234567891", "status": "sent" },
    { "recipient": "6281234567892", "status": "sent" }
  ]
}
```

---

### Group Management

#### 1. Get All Groups

**Endpoint:** `GET /api/group/:sessionId/list`

**Response:**
```json
[
  {
    "id": "123456789@g.us",
    "subject": "My Group",
    "owner": "6281234567890@s.whatsapp.net",
    "creation": 1234567890,
    "participantsCount": 10
  }
]
```

---

#### 2. Create Group

**Endpoint:** `POST /api/group/create`

**Body:**
```json
{
  "sessionId": "my-session",
  "groupName": "New Group",
  "participants": ["6281234567890", "6281234567891"]
}
```

---

#### 3. Add Participants to Group

**Endpoint:** `POST /api/group/participants/add`

**Body:**
```json
{
  "sessionId": "my-session",
  "groupId": "123456789@g.us",
  "participants": ["6281234567892"]
}
```

---

#### 4. Remove Participants from Group

**Endpoint:** `POST /api/group/participants/remove`

**Body:**
```json
{
  "sessionId": "my-session",
  "groupId": "123456789@g.us",
  "participants": ["6281234567892"]
}
```

---

#### 5. Leave Group

**Endpoint:** `POST /api/group/leave`

**Body:**
```json
{
  "sessionId": "my-session",
  "groupId": "123456789@g.us"
}
```

---

### Contact Management

#### 1. Get All Contacts

**Endpoint:** `GET /api/contact/:sessionId/list`

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "6281234567890@s.whatsapp.net",
      "name": "John Doe",
      "notify": "John"
    }
  ]
}
```

---

#### 2. Check Number

Cek apakah nomor terdaftar di WhatsApp.

**Endpoint:** `POST /api/contact/check`

**Body:**
```json
{
  "sessionId": "my-session",
  "number": "6281234567890"
}
```

**Response:**
```json
{
  "success": true,
  "exists": true,
  "jid": "6281234567890@s.whatsapp.net"
}
```

---

## 🪝 Webhook

Ketika ada pesan masuk, API akan mengirim POST request ke webhook URL yang sudah di-set saat create session.

**Webhook Payload:**
```json
{
  "sessionId": "my-session",
  "message": {
    "key": {
      "remoteJid": "6281234567890@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0..."
    },
    "messageTimestamp": 1234567890,
    "message": {
      "conversation": "Hello!"
    }
  }
}
```

Setup webhook server untuk menerima pesan masuk.

---

## 💡 Usage Examples

### Setup Session & Send Messages

```bash
# 1. Create session
curl -X POST http://localhost:3000/api/session/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d '{"sessionId": "my-wa"}'

# 2. Buka QR code di browser (RECOMMENDED)
# Buka: http://localhost:3000/qr/my-wa
# Atau gunakan curl untuk JSON:
curl http://localhost:3000/api/session/my-wa/status \
  -H "X-API-KEY: baileys-gateway-secret-key-2024"

# Scan QR code dengan WhatsApp, tunggu sampai status: "connected"

# 3. Send text message
curl -X POST http://localhost:3000/api/message/text \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d '{
    "sessionId": "my-wa",
    "to": "6281234567890",
    "message": "Hello from Gateway!"
  }'

# 4. Send image
curl -X POST http://localhost:3000/api/message/media \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d '{
    "sessionId": "my-wa",
    "to": "6281234567890",
    "mediaUrl": "https://picsum.photos/400/300",
    "mediaType": "image",
    "caption": "Random image"
  }'

# 5. Send bulk messages
curl -X POST http://localhost:3000/api/message/bulk \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d '{
    "sessionId": "my-wa",
    "recipients": ["6281234567890", "6281234567891"],
    "message": "Broadcast message",
    "delay": 2000
  }'
```

### Group Management

```bash
# Get all groups
curl http://localhost:3000/api/group/my-wa/list \
  -H "X-API-KEY: baileys-gateway-secret-key-2024"

# Create new group
curl -X POST http://localhost:3000/api/group/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: baileys-gateway-secret-key-2024" \
  -d '{
    "sessionId": "my-wa",
    "groupName": "My API Group",
    "participants": ["6281234567890", "6281234567891"]
  }'
```

---

## 📝 Notes

- **Format Nomor:** Nomor penerima bisa dengan atau tanpa `@s.whatsapp.net`
  - ✅ `6281234567890`
  - ✅ `6281234567890@s.whatsapp.net`
  
- **Group ID:** Untuk group, gunakan format `@g.us`
  - ✅ `123456789@g.us`

- **Session Data:** Session disimpan di folder `sessions/`
  - Jangan hapus folder ini agar tidak perlu scan QR ulang
  - Backup folder ini untuk restore session

- **Rate Limiting:** 100 requests per menit per IP
  - Untuk production, sesuaikan di `src/index.ts`

- **Media Size:** Max 50MB per file
  - Sesuaikan di `src/index.ts` jika perlu lebih besar

- **Bulk Delay:** Recommended minimal 1000ms (1 detik) antar pesan
  - Untuk menghindari spam detection WhatsApp

---

## 🔧 Production Deployment

### Security Checklist
- [ ] Ganti `API_KEY` dengan key yang kuat
- [ ] Setup HTTPS/SSL certificate
- [ ] Setup firewall rules
- [ ] Backup folder `sessions/` secara berkala
- [ ] Monitor logs untuk suspicious activity
- [ ] Adjust rate limiting sesuai kebutuhan

### Using PM2
```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name "baileys-gateway"
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## ⚠️ Disclaimer

This project is not affiliated with WhatsApp or Meta. Use at your own risk. Make sure to comply with WhatsApp's Terms of Service.
