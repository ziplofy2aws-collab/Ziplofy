const express = require('express');
const cors = require('cors');
const config = require('./config');
const { connectDb } = require('./db');

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'gateway-server' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/onboarding', require('./routes/onboarding'));

app.use((err, _req, res, _next) => {
  console.error('[gateway-server]', err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

connectDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`[gateway-server] listening on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[gateway-server] failed to start', err);
    process.exit(1);
  });
