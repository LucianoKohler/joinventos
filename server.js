const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('public'));

// Exemplo de get
// app.get('/api/dados', async (req, res) => {
//     try {
//         const resultado = await pool.query('SELECT * FROM table');
//         res.json(resultado.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Erro no servidor');
//     }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
});