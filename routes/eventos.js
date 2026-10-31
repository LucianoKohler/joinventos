const express = require("express");
const router = express.Router();
const db = require("../db");

router.get('/inscritos/:idparticipante', async (req, res) => {
    const { idparticipante } = req.params;

    try {
        const query = `
            SELECT 
                e.idevento, 
                e.nomeevento AS nome_evento, 
                e.descricao, 
                e.datainicio, 
                e.idlocalizacao, 
                i.confirmacao, 
                i.idingresso
            FROM ingresso i
            JOIN evento e ON i.idevento = e.idevento
            WHERE i.idparticipante = $1;
        `;

        const resultado = await db.query(query, [idparticipante]);

        return res.status(200).json({
            sucesso: true,
            eventos: resultado.rows
        });

    } catch (e) {
        console.error("Erro ao buscar eventos do participante:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});

router.get('/todos/:idparticipante', async (req, res) => {
    const { idparticipante } = req.params;

    try {
        const query = `
            SELECT 
                e.idevento, 
                e.nomeevento AS nome_evento, 
                e.descricao, 
                e.datainicio AS data_evento, 
                l.nome AS local, 
                i.confirmacao,
                i.idingresso
            FROM evento e
            LEFT JOIN localizacao l ON e.idlocalizacao = l.idlocalizacao
            LEFT JOIN ingresso i ON e.idevento = i.idevento AND i.idparticipante = $1;
        `;

        const resultado = await db.query(query, [idparticipante]);

        return res.status(200).json({
            sucesso: true,
            eventos: resultado.rows
        });

    } catch (e) {
        console.error("Erro ao buscar todos os eventos:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});

// Busca evento por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { idparticipante } = req.query; // Recebe opcionalmente via URL (?idparticipante=...)

    try {
        const query = `
            SELECT 
                e.idevento, 
                e.nomeevento AS nome_evento, 
                e.descricao, 
                e.datainicio, 
                e.datatermino, 
                e.horarioinicio, 
                e.horariotermino, 
                e.valoringresso, 
                e.numparticipantes, 
                e.status, 
                c.nomecategoria AS categoria,
                l.nome AS nome_local, 
                l.endereco AS endereco_local, 
                l.infradisp,
                cl.nome AS nome_cliente,
                i.idingresso,
                i.confirmacao
            FROM evento e
            LEFT JOIN categoriaevento c ON e.idcategoriaevento = c.idcategoriaevento
            LEFT JOIN localizacao l ON e.idlocalizacao = l.idlocalizacao
            LEFT JOIN cliente cl ON e.idcliente = cl.idcliente
            LEFT JOIN ingresso i ON e.idevento = i.idevento AND i.idparticipante = $2
            WHERE e.idevento = $1;
        `;

        const resultado = await db.query(query, [id, idparticipante || null]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        return res.status(200).json({
            sucesso: true,
            evento: resultado.rows[0]
        });

    } catch (e) {
        console.error("Erro ao buscar detalhes do evento:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar detalhes do evento.' });
    }
});

router.post('/entrarEvento/', async (req, res) => {
    const { idevento, idparticipante } = req.body;

    try {
        const query = 'SELECT compraIngresso($1, $2) AS sucesso;';
        const resultado = await db.query(query, [idevento, idparticipante]);
        
        const ok = resultado.rows[0].sucesso;

        if (ok) {
            return res.status(200).json({ sucesso: true, mensagem: 'Entrou no evento com sucesso!' });
        } else {
            return res.status(400).json({ sucesso: false, mensagem: 'Não foi possível entrar no evento.' });
        }

    } catch (e) {
        console.error("Erro ao entrar no evento:", e);
        return res.status(500).json({ erro: 'Erro interno ao processar confirmação.' });
    }
});

router.post('/confirmar/:idingresso', async (req, res) => {
    const { idingresso } = req.params;

    try {
        const query = 'SELECT confirmaingresso($1);';
        const resultado = await db.query(query, [idingresso]);
        return res.status(200).json({ sucesso: true, mensagem: 'Presença confirmada com sucesso!' });
        
    } catch (e) {
        console.error("Erro ao confirmar presença:", e);
        return res.status(400).json({ sucesso: false, mensagem: 'Erro ao confirmar presença' });
    }
});

// Rota para cancelar ingresso por ID do Ingresso
router.delete('/cancelar/:idingresso', async (req, res) => {
    const { idingresso } = req.params;

    try {
        const query = 'SELECT deletaingresso($1);';
        const resultado = await db.query(query, [idingresso]);
        return res.status(200).json({ sucesso: true, mensagem: 'Ingresso cancelado com sucesso!' });

    } catch (e) {
        console.error("Erro ao cancelar ingresso:", e);
        return res.status(400).json({ sucesso: false, mensagem: 'Erro ao cancelar ingresso' });
    }
});

module.exports = router;