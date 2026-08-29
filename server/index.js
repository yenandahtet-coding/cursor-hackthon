import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lead } from './models/Lead.js';
import { User } from './models/User.js';

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const FALLBACK_REPLY =
  "I'm having a little trouble connecting right now, but I am still here to help your family!";

const SYSTEM_PROMPT =
  "You are Kizuna AI, a friendly, empathetic life insurance companion for Dai-ichi Life in Myanmar. Keep responses under 3 sentences. Be warm and supportive. If the user mentions anything related to 'school', 'education', 'university', or 'child', you MUST include the exact string '[LEAD_EDUCATION]' at the very end of your response. Otherwise, just answer normally.";

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai: genAI ? 'gemini' : 'missing',
  });
});

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: role === 'rm' ? 'rm' : 'customer',
      phone: phone?.trim() || undefined,
    });

    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error('POST /api/auth/signup', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

app.get('/api/leads', async (_req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    res.json(
      leads.map((l) => ({
        id: String(l._id),
        customerName: l.customerName,
        insight: l.insight,
        intent: l.intent,
        product: l.product,
        lastActive: l.lastActive,
        phone: l.phone,
        timestamp: l.createdAt ? new Date(l.createdAt).getTime() : undefined,
      }))
    );
  } catch (err) {
    console.error('GET /api/leads', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/clients', async (_req, res) => {
  try {
    const [customers, leads] = await Promise.all([
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).lean(),
      Lead.find().sort({ createdAt: -1 }).lean(),
    ]);

    const leadsByName = new Map();
    for (const lead of leads) {
      const key = String(lead.customerName || '').trim().toLowerCase();
      if (!key) continue;
      const list = leadsByName.get(key) ?? [];
      list.push(lead);
      leadsByName.set(key, list);
    }

    const clients = [];
    const seenNames = new Set();

    for (const customer of customers) {
      const key = customer.name.trim().toLowerCase();
      seenNames.add(key);
      const related = leadsByName.get(key) ?? [];
      const latest = related[0];
      clients.push({
        id: String(customer._id),
        name: customer.name,
        email: customer.email,
        phone: customer.phone || latest?.phone,
        lastActive: latest?.lastActive ?? (customer.updatedAt ? 'Recently' : 'Just joined'),
        leadCount: related.length,
        latestInsight: latest?.insight,
        product: latest?.product,
        intent: latest?.intent,
        source: 'registered',
        joinedAt: customer.createdAt ? new Date(customer.createdAt).getTime() : undefined,
      });
    }

    for (const [key, related] of leadsByName.entries()) {
      if (seenNames.has(key)) continue;
      const latest = related[0];
      clients.push({
        id: `lead-client-${String(latest._id)}`,
        name: latest.customerName,
        email: undefined,
        phone: latest.phone,
        lastActive: latest.lastActive ?? 'Recently',
        leadCount: related.length,
        latestInsight: latest.insight,
        product: latest.product,
        intent: latest.intent,
        source: 'lead',
      });
    }

    clients.sort((a, b) => (b.leadCount - a.leadCount) || a.name.localeCompare(b.name));
    res.json(clients);
  } catch (err) {
    console.error('GET /api/clients', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, history = [], language = 'en' } = req.body ?? {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  if (!genAI) {
    return res.json({ reply: FALLBACK_REPLY, educationLead: false });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const prior = Array.isArray(history)
      ? history
          .filter((m) => m && (m.sender === 'user' || m.sender === 'ai') && typeof m.text === 'string')
          .slice(-12)
      : [];

    const contents = [];
    for (const m of prior) {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      });
    }

    const userContent =
      language === 'mm'
        ? `(Please reply in Myanmar/Burmese language.)\n${message}`
        : message;

    contents.push({
      role: 'user',
      parts: [{ text: userContent }],
    });

    // Gemini requires history to start with a user turn
    while (contents.length && contents[0].role !== 'user') {
      contents.shift();
    }

    const result = await model.generateContent({ contents });
    const raw = result.response.text()?.trim() || FALLBACK_REPLY;
    const educationLead = raw.includes('[LEAD_EDUCATION]');
    const reply = raw.replace(/\[LEAD_EDUCATION\]/g, '').trim();

    res.json({ reply, educationLead });
  } catch (err) {
    console.error('POST /api/chat', err);
    res.json({ reply: FALLBACK_REPLY, educationLead: false });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { customerName, insight, intent, product, lastActive, phone } = req.body ?? {};
    if (!customerName || !insight) {
      return res.status(400).json({ error: 'customerName and insight are required' });
    }

    const existing = await Lead.findOne({ customerName, insight });
    if (existing) {
      existing.lastActive = lastActive ?? 'Just now';
      if (intent) existing.intent = intent;
      if (product) existing.product = product;
      await existing.save();
      return res.status(200).json({
        id: String(existing._id),
        customerName: existing.customerName,
        insight: existing.insight,
        intent: existing.intent,
        product: existing.product,
        lastActive: existing.lastActive,
        phone: existing.phone,
        duplicate: true,
      });
    }

    const lead = await Lead.create({
      customerName,
      insight,
      intent: intent ?? 'high',
      product: product ?? 'Family Protection',
      lastActive: lastActive ?? 'Just now',
      phone,
    });

    res.status(201).json({
      id: String(lead._id),
      customerName: lead.customerName,
      insight: lead.insight,
      intent: lead.intent,
      product: lead.product,
      lastActive: lead.lastActive,
      phone: lead.phone,
    });
  } catch (err) {
    console.error('POST /api/leads', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Atlas connected');
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
