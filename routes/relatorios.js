const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { ObjectId } = require('mongodb');

router.get('/evento/:idevento', async (req, res) => {
    const { idevento } = req.params;
    try {
        const database = await db.getDb();
        const evento = await database.collection('eventos').findOne({ _id: new ObjectId(idevento) });

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        if (!evento.relatorio) {
            evento.relatorio = {
                idrelatorio: new ObjectId().toString(),
                numRealParticipantes: 0,
                avaliacaoGeral: null,
                observacoes: '',
                fotos: []
            };
            
            await database.collection('eventos').updateOne(
                { _id: new ObjectId(idevento) },
                { $set: { relatorio: evento.relatorio } }
            );
        }

        // Formata foto
        const fotosFormatadas = (evento.relatorio.fotos || []).map((f, index) => ({
            idFoto: f.idFoto || index.toString(),
            nomeFoto: f.nomeFoto
        }));

        res.json({ 
            relatorio: {
                idrelatorio: evento.relatorio.idrelatorio || evento.relatorio._id,
                numRealParticipantes: evento.relatorio.numRealParticipantes,
                avaliacaoGeral: evento.relatorio.avaliacaoGeral,
                observacoes: evento.relatorio.observacoes
            }, 
            fotos: fotosFormatadas 
        });
    } catch (err) {
        console.error("Erro ao buscar relatório:", err);
        res.status(500).json({ erro: 'Erro ao carregar dados do relatório.' });
    }
});

router.post('/assinar', upload.array('fotos'), async (req, res) => {
    try {
        const database = await db.getDb();
        const { idevento, idRelatorio, avaliacaoGeral, observacoes } = req.body;

        const evento = await database.collection('eventos').findOne({ 
            $or: [
                { _id: ObjectId.isValid(idevento) ? new ObjectId(idevento) : null },
                { "relatorio.idrelatorio": idRelatorio }
            ]
        });

        if (!evento) {
            return res.status(404).json({ sucesso: false, erro: 'Evento/Relatório não encontrado.' });
        }

        let novasFotos = evento.relatorio?.fotos || [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                novasFotos.push({
                    idFoto: new ObjectId().toString(),
                    nomeFoto: file.originalname,
                    imagem: file.buffer
                });
            }
        }

        // atualiza relatorio dentro do evento
        await database.collection('eventos').updateOne(
            { _id: evento._id },
            { 
                $set: { 
                    "relatorio.avaliacaoGeral": parseFloat(avaliacaoGeral),
                    "relatorio.observacoes": observacoes || '',
                    "relatorio.fotos": novasFotos,
                    status: 'REALIZADO'
                } 
            }
        );

        res.json({ sucesso: true, mensagem: 'Relatório assinado e fotos salvas com sucesso!' });
    } catch (e) {
        console.error("Erro ao assinar relatório:", e);
        res.status(400).json({ erro: e.message });
    }
});


router.get('/foto/:idFoto', async (req, res) => {
    try {
        const { idFoto } = req.params;
        const database = await db.getDb();

        const evento = await database.collection('eventos').findOne({
            "relatorio.fotos.idFoto": idFoto
        });

        if (!evento || !evento.relatorio || !evento.relatorio.fotos) {
            return res.status(404).send('Foto não encontrada.');
        }

        const fotoEncontrada = evento.relatorio.fotos.find(f => f.idFoto === idFoto);

        if (!fotoEncontrada || !fotoEncontrada.imagem) {
            return res.status(404).send('Foto não encontrada.');
        }

        const bufferImg = fotoEncontrada.imagem.buffer || fotoEncontrada.imagem;

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(Buffer.from(bufferImg));
    } catch (e) {
        console.error("Erro ao carregar foto:", e);
        res.status(500).send('Erro ao carregar imagem.');
    }
});

module.exports = router;