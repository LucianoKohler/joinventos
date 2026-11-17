const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const database = await db.getDb();
        const apresentadores = await database.collection('apresentadores')
            .find()
            .sort({ nome: 1 })
            .toArray();

        // mapear id
        const formatados = apresentadores.map(ap => ({
            ...ap,
            idapresentador: ap._id.toString()
        }));

        return res.status(200).json({ sucesso: true, apresentadores: formatados });
    } catch (e) {
        console.error("Erro ao listar apresentadores:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar apresentadores.' });
    }
});

router.post('/criar', async (req, res) => {
    const { nome, email, telefone } = req.body;

    try {
        const database = await db.getDb();
        const novoApresentador = {
            nome,
            email: email || '',
            telefone
        };
        
        const resultado = await database.collection('apresentadores').insertOne(novoApresentador);

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Apresentador cadastrado com sucesso!',
            idapresentador: resultado.insertedId.toString()
        });

    } catch (e) {
        console.error("Erro ao criar apresentador:", e);
        const mensagemErro = e.message || 'Erro ao processar o cadastro do apresentador.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('apresentadores').deleteOne({ 
            _id: new ObjectId(id) 
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Apresentador não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Apresentador excluído com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao excluir apresentador:", e);
        const mensagemErro = e.message || 'Não foi possível excluir o apresentador.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

module.exports = router;