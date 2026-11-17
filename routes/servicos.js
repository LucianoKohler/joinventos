const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const database = await db.getDb();
        const servicos = await database.collection('servicos')
            .find()
            .toArray();

        // mapear id
        const formatados = servicos.map(s => ({
            ...s,
            idservico: s._id.toString()
        }));

        return res.status(200).json({ sucesso: true, servicos: formatados });
    } catch (e) {
        console.error("Erro ao listar serviços:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar serviços.' });
    }
});

router.post('/criar', async (req, res) => {
    const { unidMedida, valorUnit, idCategoriaServico, descricao } = req.body;

    try {
        const database = await db.getDb();
        const novoServico = {
            unidmedida: unidMedida,
            ativo: true,
            valorunit: parseFloat(valorUnit),
            nomecategoriaservico: idCategoriaServico, // Salvando a categoria diretamente como string/nome
            descricao: descricao || ''
        };
        
        const resultado = await database.collection('servicos').insertOne(novoServico);

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Serviço cadastrado com sucesso!',
            idservico: resultado.insertedId.toString()
        });

    } catch (e) {
        console.error("Erro ao criar serviço:", e);
        const mensagemErro = e.message || 'Erro ao processar o cadastro do serviço.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('servicos').deleteOne({ 
            _id: new ObjectId(id) 
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Serviço não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Serviço excluído com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao excluir serviço:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Não foi possível excluir o serviço.' });
    }
});

module.exports = router;