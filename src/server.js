require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/evenements', require('./routes/evenements.routes'));
app.use('/api/actions', require('./routes/actions.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/ateliers', require('./routes/ateliers.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/kpi', require('./routes/kpi.routes'));

const { demarrerJobs } = require('./services/jobs.service');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`HSE API démarrée sur le port ${PORT}`);
  demarrerJobs();
});
