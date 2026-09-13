import AsyncStorage from '@react-native-async-storage/async-storage';

const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';
const SECMAIL_BASE = 'https://www.1secmail.com/api/v1/';
const STORAGE_KEY = '@tempmail_state_v1';
const ACCOUNT_TTL_MS = 60 * 60 * 1000;

function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Guerrilla Mail (primary)
// ---------------------------------------------------------------------------

async function guerrilla(params) {
  const qs = new URLSearchParams({ lang: 'en', ...params });
  const res = await fetch(`${GUERRILLA_API}?${qs.toString()}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.auth && data.auth.success === false) {
    throw new Error('guerrilla auth failed: ' + JSON.stringify(data.auth.error_codes || []));
  }
  return data;
}

async function createGuerrillaAccount() {
  const r = await guerrilla({ f: 'get_email_address' });
  if (!r.email_addr || !r.sid_token) {
    throw new Error('Нет ответа от службы почты');
  }
  return {
    provider: 'guerrilla',
    address: r.email_addr,
    sid: r.sid_token,
    createdAt: Date.now(),
  };
}

async function guerrillaNewAddress(account) {
  const user = randomString(10);
  const r = await guerrilla({
    f: 'set_email_user',
    sid_token: account.sid,
    email_user: user,
  });
  if (!r.email_addr) {
    throw new Error('Не удалось сменить адрес');
  }
  return { ...account, address: r.email_addr, createdAt: Date.now() };
}

function guerrillaMsgId(raw) {
  // mail_id is a number, use it directly
  return String(raw);
}

function guerrillaToEmail(raw) {
  const ts = Number(raw.mail_timestamp || 0);
  const from = raw.mail_from || '';
  return {
    id: guerrillaMsgId(raw.mail_id),
    from: { name: from.split('@')[0] || 'Неизвестно', address: from },
    subject: raw.mail_subject || '',
    intro: (raw.mail_excerpt || raw.mail_body || '').replace(/\s+/g, ' ').slice(0, 160),
    createdAt: ts ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
    unread: !Number(raw.mail_read),
  };
}

async function guerrillaGetMessages(account) {
  const r = await guerrilla({
    f: 'get_email_list',
    sid_token: account.sid,
    offset: 0,
  });
  const list = Array.isArray(r.list) ? r.list : [];
  return list.map(guerrillaToEmail);
}

async function guerrillaGetMessage(account, id) {
  const r = await guerrilla({
    f: 'fetch_email',
    sid_token: account.sid,
    email_id: id,
  });
  const ts = Number(r.mail_timestamp || 0);
  const from = r.mail_from || '';
  return {
    id: String(r.mail_id),
    subject: r.mail_subject || '',
    from: { name: from.split('@')[0] || 'Неизвестно', address: from },
    to: { name: '', address: r.mail_recipient || '' },
    createdAt: ts ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
    text: r.mail_body || '',
    html: '',
  };
}

async function guerrillaDeleteMessage(account, id) {
  await guerrilla({
    f: 'del_email',
    sid_token: account.sid,
    email_ids: [id],
  });
  return true;
}

// ---------------------------------------------------------------------------
// 1secmail (fallback)
// ---------------------------------------------------------------------------

async function secmailGet(action, extra) {
  const params = new URLSearchParams({ action, ...extra });
  const res = await fetch(`${SECMAIL_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function createSecmailAccount() {
  const list = await secmailGet('genRandomMailbox', { count: 1 });
  if (!Array.isArray(list) || !list.length) {
    throw new Error('Не удалось получить адрес');
  }
  const address = list[0];
  const at = address.indexOf('@');
  return {
    provider: 'secmail',
    address,
    login: address.slice(0, at),
    domain: address.slice(at + 1),
    createdAt: Date.now(),
  };
}

async function secmailGetMessages(login, domain) {
  const list = await secmailGet('getMessages', { login, domain });
  if (!Array.isArray(list)) return [];
  return list.map((m) => ({
    id: String(m.id),
    from: { name: (m.from || '').split('@')[0] || 'Неизвестно', address: m.from || '' },
    subject: m.subject || '',
    intro: (m.body || '').replace(/\s+/g, ' ').slice(0, 160),
    createdAt: m.date || new Date().toISOString(),
    unread: true,
  }));
}

async function secmailGetMessage(login, domain, id) {
  const m = await secmailGet('readMessage', { login, domain, id });
  const from = m.from || '';
  return {
    id: String(m.id),
    subject: m.subject,
    from: { name: from.split('@')[0] || 'Неизвестно', address: from },
    to: { name: '', address: m.to || '' },
    createdAt: m.date || new Date().toISOString(),
    text: m.textBody || '',
    html: m.htmlBody || '',
  };
}

async function secmailDeleteMessage(login, domain, id) {
  await secmailGet('deleteMessage', { login, domain, id });
  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function createAccount() {
  let lastError = null;
  for (let i = 0; i < 2; i++) {
    try {
      return await createGuerrillaAccount();
    } catch (e) {
      lastError = e;
      await sleep(1200 * (i + 1));
    }
  }
  try {
    return await createSecmailAccount();
  } catch (e) {
    throw new Error(lastError ? lastError.message : e.message);
  }
}

export async function createNewAddress(account) {
  if (account && account.provider === 'secmail') {
    return createSecmailAccount();
  }
  if (account && account.provider === 'guerrilla') {
    return guerrillaNewAddress(account);
  }
  return createAccount();
}

export async function getMessages(account) {
  if (!account) return [];
  if (account.provider === 'secmail') {
    return secmailGetMessages(account.login, account.domain);
  }
  return guerrillaGetMessages(account);
}

export async function getMessage(account, id) {
  if (account.provider === 'secmail') {
    return secmailGetMessage(account.login, account.domain, id);
  }
  return guerrillaGetMessage(account, id);
}

export async function deleteMessage(account, id) {
  if (account.provider === 'secmail') {
    return secmailDeleteMessage(account.login, account.domain, id);
  }
  return guerrillaDeleteMessage(account, id);
}

export async function loadStoredAccount() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.address) return null;
    if (parsed.provider === 'guerrilla' && !parsed.sid) return null;
    if (Date.now() - parsed.createdAt > ACCOUNT_TTL_MS) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveAccount(account) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export async function clearStoredAccount() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function getTTLSeconds(account) {
  const elapsed = account ? Math.floor((Date.now() - account.createdAt) / 1000) : 0;
  return Math.max(0, Math.floor(ACCOUNT_TTL_MS / 1000) - elapsed);
}