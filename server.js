const express = require('express');
const app = express();
app.use(express.json());

app.post('/persshop-hook', (req, res) => {
  console.log('Zakaz az PersShop omad:', req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('PersShop Bot is working on Railway'));
app.listen(process.env.PORT || 3000);
