const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const usersRoutes = require("./routes/users");
const eventosRoutes = require('./routes/eventos');
const localizacoesRoutes = require('./routes/localizacoes');
const fornecedoresRoutes = require('./routes/fornecedores');
const apresentadoresRoutes = require('./routes/apresentadores');
const servicosRoutes = require('./routes/servicos');
const relatoriosRoutes = require('./routes/relatorios');

app.use("/api/users", usersRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/localizacoes', localizacoesRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/apresentadores', apresentadoresRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota teste
app.get('/api/dados', async (req, res) => {
    try {
        const database = await db.getDb();
        const clientes = await database.collection('clientes').find().toArray();
        res.json(clientes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Abre o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
});