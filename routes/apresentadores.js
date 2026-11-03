const express = require("express");
const router = express.Router();
const db = require("../db");

// Rota GET: /api/apresentadores
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT idapresentador, nome, email, telefone FROM apresentador ORDER BY nome;';
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, apresentadores: resultado.rows });
    } catch (e) {
        console.error("Erro ao listar apresentadores:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar apresentadores.' });
    }
});

// Rota POST: /api/apresentadores/criar (Usando SQL direto, sem stored function)
router.post('/criar', async (req, res) => {
    const { nome, email, telefone } = req.body;

    try {
        const query = 'INSERT INTO apresentador (nome, email, telefone) VALUES ($1, $2, $3) RETURNING idapresentador;';
        const values = [nome, email, telefone];
        
        const resultado = await db.query(query, values);
        const idCriado = resultado.rows[0].idapresentador;

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Apresentador cadastrado com sucesso!',
            idapresentador: idCriado
        });

    } catch (e) {
        console.error("Erro ao criar apresentador:", e);
        const mensagemErro = e.detail || e.message || 'Erro ao processar o cadastro do apresentador.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

// Rota DELETE: /api/apresentadores/:id (Usando SQL direto, sem stored function)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM apresentador WHERE idapresentador = $1;';
        const resultado = await db.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Apresentador não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Apresentador excluído com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao excluir apresentador:", e);
        const mensagemErro = e.detail || e.message || 'Não foi possível excluir o apresentador.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

module.exports = router;