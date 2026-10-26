const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Incluindo rotas à parte
const usersRoutes = require("./routes/users");




// Definindo o caminho para as rotas
app.use("/api/users", usersRoutes);




// Exemplo de get
app.get('/api/dados', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM cliente');
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

app.get('/api/debug-tabelas', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        
        res.json({
            sucesso: true,
            tabelasEncontradas: resultado.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao consultar o banco', detalhe: err.message });
    }
});

// Abre o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
});