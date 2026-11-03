const express = require("express");
const router = express.Router();
const db = require("../db");

// Rota GET: /api/servicos (Com JOIN para trazer o nome da categoria)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT s.idservico, s.unidmedida, s.valorunit, s.descricao, 
                   c.nomecategoriaservico
            FROM servico s
            LEFT JOIN categoriaservico c ON s.idcategoriaservico = c.idcategoriaservico
            ORDER BY s.idservico;
        `;
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, servicos: resultado.rows });
    } catch (e) {
        console.error("Erro ao listar serviços:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar serviços.' });
    }
});

// Rota POST: /api/servicos/criar (Utilizando a Stored Function criaServico)
router.post('/criar', async (req, res) => {
    const { unidMedida, valorUnit, idCategoriaServico, descricao } = req.body;

    try {
        const query = 'SELECT criaServico($1, $2, $3, $4) AS idservico;';
        const values = [unidMedida, valorUnit, idCategoriaServico, descricao || ''];
        
        const resultado = await db.query(query, values);
        const idCriado = resultado.rows[0].idservico;

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Serviço cadastrado com sucesso!',
            idservico: idCriado
        });

    } catch (e) {
        console.error("Erro ao criar serviço:", e);
        const mensagemErro = e.detail || e.message || 'Erro ao processar o cadastro do serviço.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

// Rota DELETE: /api/servicos/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM servico WHERE idservico = $1;';
        const resultado = await db.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Serviço não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Serviço excluído com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao excluir serviço:", e);
        const mensagemErro = e.detail || e.message || 'Não foi possível excluir o serviço.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

module.exports = router;