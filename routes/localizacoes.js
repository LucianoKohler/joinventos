const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const database = await db.getDb();
        const localizacoes = await database.collection('localizacoes')
            .find()
            .sort({ nome: 1 })
            .toArray();

        // mapear id
        const formatadas = localizacoes.map(loc => ({
            ...loc,
            idlocalizacao: loc._id.toString()
        }));

        return res.status(200).json({ sucesso: true, localizacoes: formatadas });
    } catch (e) {
        console.error("Erro ao listar localizações:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar localizações.' });
    }
});

router.post('/criar', async (req, res) => {
    const { valorlocacao, nome, endereco, capmaxima, area, infradisp } = req.body;

    try {
        const database = await db.getDb();
        const novaLocalizacao = {
            valorlocacao: parseFloat(valorlocacao),
            nome,
            endereco,
            capmaxima: parseInt(capmaxima),
            area: parseFloat(area),
            infradisp: infradisp || ''
        };
        
        const resultado = await database.collection('localizacoes').insertOne(novaLocalizacao);

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Localização cadastrada com sucesso!',
            idlocalizacao: resultado.insertedId.toString()
        });

    } catch (e) {
        console.error("Erro ao criar localização:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Erro ao processar o cadastro da localização.' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('localizacoes').deleteOne({ 
            _id: new ObjectId(id) 
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Localização não encontrada.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Localização excluída com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao deletar localização:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Não foi possível excluir a localização.' });
    }
});

module.exports = router;