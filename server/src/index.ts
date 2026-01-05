import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import winsRouter from './routes/wins';
import goalAreasRouter from './routes/goal-areas';
import momentumRouter from './routes/momentum';
import voiceRouter from './routes/voice';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/wins', winsRouter);
app.use('/api/goal-areas', goalAreasRouter);
app.use('/api/momentum', momentumRouter);
app.use('/api/voice', voiceRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Momentum 2026 server running on port ${PORT}`);
});
