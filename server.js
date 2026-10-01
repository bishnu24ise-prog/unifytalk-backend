const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// ── Core routes (pre-existing) ──
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/user',  require('./routes/user'));
app.use('/api/chat',  require('./routes/chat'));
app.use('/api/media', require('./routes/media'));

// ── Phase feature routes ──
app.use('/api/signs',          require('./routes/signs'));
app.use('/api/chat-sessions',  require('./routes/chatSessions'));
app.use('/api/pictograms',     require('./routes/pictograms'));
app.use('/api/phrases',        require('./routes/phrases'));
app.use('/api/community',      require('./routes/community'));
app.use('/api/sos',            require('./routes/sos'));
app.use('/api/symptoms',       require('./routes/symptoms'));
app.use('/api/accessibility',  require('./routes/accessibility'));
app.use('/api/smart-phrases',  require('./routes/smartPhrases'));

app.get('/', (req, res) => res.json({ status: 'Server is running' }));

require('./sockets/chatSocket')(io);

connectDB().then(() => {
  server.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
});