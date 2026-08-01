// server.js
// Self-hosted WhatsApp sender using whatsapp-web.js
// Run this on an always-on host (Railway, Render, VPS, etc.) — NOT Vercel/Netlify serverless.

const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Your own WhatsApp number to receive form notifications, in international
// format without '+' (e.g. 923139401824)
const NOTIFY_NUMBER = process.env.NOTIFY_NUMBER || '923139401824';

let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' }), // persists login across restarts
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  },
});

client.on('qr', (qr) => {
  console.log('Scan this QR code with WhatsApp (Linked Devices > Link a Device):');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  isClientReady = true;
  console.log('WhatsApp client is ready.');
});

client.on('disconnected', (reason) => {
  isClientReady = false;
  console.log('WhatsApp client disconnected:', reason);
});

client.initialize();

// Health check
app.get('/health', (req, res) => {
  res.json({ ready: isClientReady });
});

// Main endpoint your portfolio form will call
app.post('/send-whatsapp', async (req, res) => {
  if (!isClientReady) {
    return res.status(503).json({ error: 'WhatsApp client not ready yet. Try again shortly.' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  const text = `New Portfolio Message\nName: ${name}\nEmail: ${email || 'N/A'}\nSubject: ${subject || 'N/A'}\nMessage: ${message}`;
  const chatId = `${NOTIFY_NUMBER}@c.us`;

  try {
    await client.sendMessage(chatId, text);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send failed:', err);
    return res.status(500).json({ error: 'Failed to send WhatsApp message.', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
