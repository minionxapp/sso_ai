import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

const SSO_URL = process.env.SSO_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// In-memory store for PKCE verifiers (use Redis/DB in production)
const pkceStore = new Map();

const generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('base64url');
};

const generateCodeChallenge = (verifier) => {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
};

// 1. Initiate Login
app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store verifier with state
  pkceStore.set(state, codeVerifier);

  const authUrl = new URL(`${SSO_URL}/oauth/authorize`);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', 'openid profile email');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// 2. Callback from SSO
app.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
  }

  const codeVerifier = pkceStore.get(state);
  if (!codeVerifier) {
    return res.status(400).send('Invalid state');
  }
  pkceStore.delete(state);

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(`${SSO_URL}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    });

    const { access_token, id_token } = tokenResponse.data;

    // Decode id_token for user info
    const userInfo = jwt.decode(id_token);

    // Set token in HttpOnly cookie for the frontend
    res.cookie('client_auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect(`${process.env.FRONTEND_URL}/profile`);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_exchange_failed`);
  }
});

// 3. Get User Profile (Protected route)
app.get('/api/user', async (req, res) => {
  const token = req.cookies.client_auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Call SSO userinfo endpoint
    const response = await axios.get(`${SSO_URL}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// 4. Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('client_auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('client_auth_token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.get('/logout', (req, res) => {
  res.clearCookie('client_auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('client_auth_token');
  const ssoFrontend = process.env.SSO_FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${ssoFrontend}/logout?redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + '/login')}`);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Client Example Backend running on port ${PORT}`);
});
