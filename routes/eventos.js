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

module.exports = router;