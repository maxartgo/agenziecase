import express from 'express';
import propertyRoutes from './routes/propertyRoutes.js';
import performanceRoutes from './routes/performance.js';

const app = express();
app.use(express.json());

// Log tutte le richieste
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/performance', performanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server AgenzieCase attivo' });
});

const PORT = 3456;

app.listen(PORT, () => {
  console.log(`\n🏠 Server AgenzieCase attivo su http://localhost:${PORT}`);
  console.log('Routes loaded:', app._router.stack.length);
});
