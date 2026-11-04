const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// 1. Buscar ou criar o relatório do evento
router.get('/evento/:idEvento', async (req, res) => {
    const { idEvento } = req.params;
    try {
        let rel = await pool.query('SELECT * FROM Relatorio WHERE idEvento = $1', [idEvento]);
        
        if (rel.rows.length === 0) {
            rel = await pool.query(
                'INSERT INTO Relatorio (numRealParticipantes, avaliacaoGeral, observacoes, idEvento) VALUES (0, NULL, \'\', $1) RETURNING *',
                [idEvento]
            );
        }
        
        const relatorio = rel.rows[0];
        const fotos = await pool.query('SELECT idFoto, nomeFoto FROM Foto WHERE idRelatorio = $1', [relatorio.idrelatorio]);
        
        res.json({ relatorio, fotos: fotos.rows });
    } catch (err) {
        console.error("Erro ao buscar relatório:", err);
        res.status(500).json({ erro: 'Erro ao carregar dados do relatório.' });
    }
});

router.post('/assinar', upload.array('fotos'), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { idRelatorio, avaliacaoGeral, observacoes } = req.body;

        // Chama diretamente a função do banco. Se já estiver assinado, o PL/pgSQL vai barrar com um erro.
        await client.query('SELECT assinaRelatorio($1, $2, $3)', [
            parseInt(idRelatorio),
            parseFloat(avaliacaoGeral),
            observacoes || ''
        ]);

        // Insere as fotos enviadas na tabela Foto (tipo bytea) caso a assinatura seja aceita
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await client.query(
                    'INSERT INTO Foto (nomeFoto, imagem, idRelatorio) VALUES ($1, $2, $3)',
                    [file.originalname, file.buffer, parseInt(idRelatorio)]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ sucesso: true, mensagem: 'Relatório assinado e fotos salvas com sucesso!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro ao assinar relatório:", err);
        
        // Repassa exatamente a mensagem de erro gerada pela sua stored function (ex: "Relatório já assinado!...")
        res.status(400).json({ erro: err.message });
    }
});

// 3. Rota para exibir/carregar a imagem binária (bytea)
router.get('/foto/:idFoto', async (req, res) => {
    try {
        const { idFoto } = req.params;
        const result = await pool.query('SELECT imagem FROM Foto WHERE idFoto = $1', [idFoto]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Foto não encontrada.');
        }

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(result.rows[0].imagem);
    } catch (err) {
        console.error("Erro ao carregar foto:", err);
        res.status(500).send('Erro ao carregar imagem.');
    }
});

module.exports = router;