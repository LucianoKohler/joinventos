const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const database = await db.getDb();
        const fornecedores = await database.collection('fornecedores')
            .find()
            .sort({ nome: 1 })
            .toArray();

        // mapear id
        const formatados = fornecedores.map(f => ({
            ...f,
            idfornecedor: f._id.toString()
        }));

        return res.status(200).json({ sucesso: true, fornecedores: formatados });
    } catch (e) {
        console.error("Erro ao listar fornecedores:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar fornecedores.' });
    }
});

router.post('/criar', async (req, res) => {
    const { nome, cnpj, telefone, especialidade, email, avaldesempenho } = req.body;

    try {
        const database = await db.getDb();
        const novoFornecedor = {
            ativo: true,
            nome, 
            telefone, 
            cnpj, 
            especialidade: especialidade || '', 
            avaldesempenho: avaldesempenho !== null && avaldesempenho !== undefined ? parseFloat(avaldesempenho) : null,
            email: email || ''
        };
        
        const resultado = await database.collection('fornecedores').insertOne(novoFornecedor);

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Fornecedor cadastrado com sucesso!',
            idfornecedor: resultado.insertedId.toString()
        });

    } catch (e) {
        console.error("Erro ao criar fornecedor:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Erro ao processar o cadastro do fornecedor.' });
    }
});

router.post('/inativar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('fornecedores').updateOne(
            { _id: new ObjectId(id) },
            { $set: { ativo: false } }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Fornecedor não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Fornecedor inativado com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao inativar fornecedor:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Não foi possível inativar o fornecedor.' });
    }
});

router.post('/reativar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('fornecedores').updateOne(
            { _id: new ObjectId(id) },
            { $set: { ativo: true } }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Fornecedor não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Fornecedor reativado com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao reativar fornecedor:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Não foi possível reativar o fornecedor.' });
    }
});

module.exports = router;