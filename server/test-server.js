import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server funziona!' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server test in ascolto su http://localhost:${PORT}`);
});
