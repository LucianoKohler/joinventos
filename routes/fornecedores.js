const express = require("express");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM fornecedor ORDER BY nome;';
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, fornecedores: resultado.rows });
    } catch (e) {
        console.error("Erro ao listar fornecedores:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar fornecedores.' });
    }
});

router.post('/criar', async (req, res) => {
    const { nome, cnpj, telefone, especialidade, email, avalDesempenho } = req.body;

    try {
        const query = 'SELECT criaFornecedor($1, $2, $3, $4, $5, $6) AS idfornecedor;';
        const values = [
            nome, 
            telefone, 
            cnpj, 
            especialidade || '', 
            avalDesempenho !== null && avalDesempenho !== undefined ? avalDesempenho : null,
            email || ''
        ];
        
        const resultado = await db.query(query, values);
        const idCriado = resultado.rows[0].idfornecedor;

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Fornecedor cadastrado com sucesso!',
            idfornecedor: idCriado
        });

    } catch (e) {
        console.error("Erro ao criar fornecedor:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Erro ao processar o cadastro do fornecedor.' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT desativaFornecedor($1);';
        await db.query(query, [id]);

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Fornecedor inativado com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao inativar fornecedor:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Não foi possível inativar o fornecedor.' });
    }
});

module.exports = router;