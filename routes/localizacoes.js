const express = require("express");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM localizacao ORDER BY nome;';
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, localizacoes: resultado.rows });
    } catch (e) {
        console.error("Erro ao listar localizações:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar localizações.' });
    }
});

router.post('/criar', async (req, res) => {
    const { valorLocacao, nome, endereco, capMaxima, area, infraDisp } = req.body;

    try {
        const query = 'SELECT criarLocalizacao($1, $2, $3, $4, $5, $6) AS idlocalizacao;';
        const values = [valorLocacao, nome, endereco, capMaxima, area, infraDisp || ''];
        
        const resultado = await db.query(query, values);
        const idCriado = resultado.rows[0].idlocalizacao;

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Localização cadastrada com sucesso!',
            idlocalizacao: idCriado
        });

    } catch (e) {
        console.error("Erro ao criar localização:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Erro ao processar o cadastro da localização.' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT deletaLocalizacao($1);';
        await db.query(query, [id]);

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Localização excluída com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao deletar localização:", e);
        return res.status(400).json({ sucesso: false, erro:  e.message || 'Não foi possível excluir a localização.' });
    }
});

module.exports = router;