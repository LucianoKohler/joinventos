const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require('mongodb');

// -------------------------
// CLIENTES
// -------------------------

router.get('/criados/:idcliente', async (req, res) => {
    const { idcliente } = req.params;
    try {
        const database = await db.getDb();
        const eventos = await database.collection('eventos')
            .find({ idcliente: idcliente })
            .sort({ datainicio: -1 })
            .toArray();

        const formatados = eventos.map(ev => ({
            ...ev,
            idevento: ev._id.toString()
        }));

        return res.status(200).json({ sucesso: true, eventos: formatados });
    } catch (e) {
        console.error("Erro ao buscar eventos criados:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});


// -------------------------
// PARTICIPANTES
// -------------------------
router.get('/inscritos/:idparticipante', async (req, res) => {
    const { idparticipante } = req.params;

    try {
        const database = await db.getDb();
        
        const eventos = await database.collection('eventos').find({
            "ingressos.idparticipante": idparticipante
        }).toArray();

        const formatados = eventos.map(ev => {
            const ingressoDoParticipante = ev.ingressos.find(i => i.idparticipante === idparticipante);
            return {
                idevento: ev._id.toString(),
                nome_evento: ev.nomeevento,
                descricao: ev.descricao,
                datainicio: ev.datainicio,
                idlocalizacao: ev.idlocalizacao,
                confirmacao: ingressoDoParticipante ? ingressoDoParticipante.confirmacao : false,
                idingresso: ingressoDoParticipante ? ingressoDoParticipante.idingresso : null
            };
        });

        return res.status(200).json({
            sucesso: true,
            eventos: formatados
        });

    } catch (e) {
        console.error("Erro ao buscar eventos do participante:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});

router.get('/todos', async (req, res) => {
    try {
        const database = await db.getDb();
        
        const eventos = await database.collection('eventos').aggregate([
            {
                $lookup: {
                    from: "localizacoes",
                    localField: "idlocalizacao",
                    foreignField: "_id",
                    as: "localObj"
                }
            },
            {
                $addFields: {
                    local: { $arrayElemAt: ["$localObj.nome", 0] }
                }
            },
            { $sort: { datainicio: 1 } }
        ]).toArray();

        const formatados = eventos.map(ev => ({
            idevento: ev._id.toString(),
            nome_evento: ev.nomeevento,
            descricao: ev.descricao,
            data_evento: ev.datainicio,
            local: ev.local || 'Local a definir',
            status: ev.status
        }));

        return res.status(200).json({
            sucesso: true,
            eventos: formatados
        });

    } catch (e) {
        console.error("Erro ao buscar todos os eventos:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});

router.get('/todos/:idparticipante', async (req, res) => {
    const { idparticipante } = req.params;

    try {
        const database = await db.getDb();
        
        const eventos = await database.collection('eventos').aggregate([
            {
                $lookup: {
                    from: "localizacoes",
                    localField: "idlocalizacao",
                    foreignField: "_id",
                    as: "localObj"
                }
            },
            {
                $addFields: {
                    local: { $arrayElemAt: ["$localObj.nome", 0] }
                }
            }
        ]).toArray();

        const formatados = eventos.map(ev => {
            const ingresso = ev.ingressos ? ev.ingressos.find(i => i.idparticipante === idparticipante) : null;
            return {
                idevento: ev._id.toString(),
                nome_evento: ev.nomeevento,
                descricao: ev.descricao,
                data_evento: ev.datainicio,
                local: ev.local || 'Local a definir',
                confirmacao: ingresso ? ingresso.confirmacao : null,
                idingresso: ingresso ? ingresso.idingresso : null
            };
        });

        return res.status(200).json({
            sucesso: true,
            eventos: formatados
        });

    } catch (e) {
        console.error("Erro ao buscar todos os eventos:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});

// -------------------------
// INGRESSOS
// -------------------------

router.post('/entrarEvento/', async (req, res) => {
    const { idevento, idparticipante } = req.body;

    try {
        const database = await db.getDb();
        
        const evento = await database.collection('eventos').findOne({ _id: new ObjectId(idevento) });
        if (!evento) {
            return res.status(400).json({ sucesso: false, mensagem: 'Evento não encontrado.' });
        }

        const ingressos = evento.ingressos || [];
        const jaTem = ingressos.some(i => i.idparticipante === idparticipante);

        if (jaTem) {
            return res.status(400).json({ sucesso: false, mensagem: 'Participante já está inscrito neste evento.' });
        }

        const novoIngresso = {
            idingresso: new ObjectId().toString(),
            idparticipante: idparticipante,
            confirmacao: false
        };

        await database.collection('eventos').updateOne(
            { _id: new ObjectId(idevento) },
            { $push: { ingressos: novoIngresso } }
        );

        return res.status(200).json({ sucesso: true, mensagem: 'Entrou no evento com sucesso!' });
    } catch (e) {
        console.error("Erro ao entrar no evento:", e);
        return res.status(500).json({ erro: 'Erro interno ao processar confirmação.' });
    }
});

router.post('/confirmar/:idingresso', async (req, res) => {
    const { idingresso } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('eventos').updateOne(
            { "ingressos.idingresso": idingresso },
            { $set: { "ingressos.$.confirmacao": true } }
        );

        if (resultado.matchedCount === 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'Ingresso não encontrado' });
        }

        return res.status(200).json({ sucesso: true, mensagem: 'Presença confirmada com sucesso!' });
    } catch (e) {
        console.error("Erro ao confirmar presença:", e);
        return res.status(400).json({ sucesso: false, mensagem: 'Erro ao confirmar presença' });
    }
});

router.delete('/cancelar/:idingresso', async (req, res) => {
    const { idingresso } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('eventos').updateOne(
            { "ingressos.idingresso": idingresso },
            { $pull: { ingressos: { idingresso: idingresso } } }
        );

        if (resultado.modifiedCount === 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'Ingresso não encontrado' });
        }

        return res.status(200).json({ sucesso: true, mensagem: 'Ingresso cancelado com sucesso!' });
    } catch (e) {
        console.error("Erro ao cancelar ingresso:", e);
        return res.status(400).json({ sucesso: false, mensagem: 'Erro ao cancelar ingresso' });
    }
});

// -------------------------
// MOSTRA EVENTO
// -------------------------

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let { idparticipante } = req.query;

    try {
        const database = await db.getDb();
        
        const eventoArr = await database.collection('eventos').aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: "localizacoes",
                    localField: "idlocalizacao",
                    foreignField: "_id",
                    as: "localObj"
                }
            },
            {
                $lookup: {
                    from: "clientes",
                    localField: "idcliente",
                    foreignField: "_id",
                    as: "clienteObj"
                }
            },
            {
                $addFields: {
                    nome_local: { $arrayElemAt: ["$localObj.nome", 0] },
                    endereco_local: { $arrayElemAt: ["$localObj.endereco", 0] },
                    infradisp: { $arrayElemAt: ["$localObj.infradisp", 0] },
                    nome_cliente: { $arrayElemAt: ["$clienteObj.nome", 0] }
                }
            }
        ]).toArray();

        if (eventoArr.length === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        const evento = eventoArr[0];
        evento.idevento = evento._id.toString();

        if (idparticipante && evento.ingressos) {
            const ing = evento.ingressos.find(i => i.idparticipante === idparticipante);
            if (ing) {
                evento.idingresso = ing.idingresso;
                evento.confirmacao = ing.confirmacao;
            }
        }

        return res.status(200).json({
            sucesso: true,
            evento: evento
        });

    } catch (e) {
        console.error("Erro ao buscar detalhes do evento:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar detalhes do evento.' });
    }
});


// -------------------------
// MISC
// -------------------------
router.get('/categorias/todas', async (req, res) => {
    try {
        const categorias = [
            { idcategoriaevento: 'CASAMENTO', nomecategoria: 'CASAMENTO' },
            { idcategoriaevento: 'ANIVERSARIO', nomecategoria: 'ANIVERSARIO' },
            { idcategoriaevento: 'FORMATURA', nomecategoria: 'FORMATURA' },
            { idcategoriaevento: 'SEMINARIO', nomecategoria: 'SEMINARIO' },
            { idcategoriaevento: 'WORKSHOP', nomecategoria: 'WORKSHOP' },
            { idcategoriaevento: 'CONGRESSO', nomecategoria: 'CONGRESSO' },
            { idcategoriaevento: 'CONFRATERNIZACAO', nomecategoria: 'CONFRATERNIZACAO' },
            { idcategoriaevento: 'OUTRO', nomecategoria: 'OUTRO' }
        ];
        return res.status(200).json({ sucesso: true, categorias });
    } catch (e) {
        console.error("Erro ao buscar categorias:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar categorias.' });
    }
});

router.get('/localizacoes/todas', async (req, res) => {
    try {
        const database = await db.getDb();
        const localizacoes = await database.collection('localizacoes').find().sort({ nome: 1 }).toArray();
        const formatadas = localizacoes.map(l => ({
            ...l,
            idlocalizacao: l._id.toString()
        }));
        return res.status(200).json({ sucesso: true, localizacoes: formatadas });
    } catch (e) {
        console.error("Erro ao buscar localizações:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar localizações.' });
    }
});

// -------------------------
// CRIAÇÃO DE EVENTO
// -------------------------
router.post('/criar', async (req, res) => {
    const {
        nomeEvento,
        idcategoriaevento,
        datainicio,
        dataTermino,
        horarioInicio,
        horarioTermino,
        valoringresso,
        numparticipantes,
        idCliente,
        idlocalizacao,
        descricao,
        servicos,
        cronograma,
        orcamentoInicial
    } = req.body;

    try {
        const database = await db.getDb();

        const novoEvento = {
            nomeevento: nomeEvento,
            idcategoriaevento: idcategoriaevento,
            datainicio: datainicio,
            datatermino: dataTermino,
            horarioinicio: horarioInicio,
            horariotermino: horarioTermino,
            valoringresso: parseFloat(valoringresso || 0),
            numparticipantes: parseInt(numparticipantes || 0),
            idcliente: idCliente,
            idlocalizacao: ObjectId.isValid(idlocalizacao) ? new ObjectId(idlocalizacao) : idlocalizacao,
            descricao: descricao || '',
            status: 'EM_PREPARACAO',
            servicos: servicos || [],
            cronograma: cronograma || [],
            orcamento: {
                valortotal: parseFloat(orcamentoInicial || 0),
                descricao: 'Orçamento inicial gerado automaticamente no cadastro.'
            },
            relatorio: {
                idrelatorio: new ObjectId().toString(),
                numRealParticipantes: 0,
                avaliacaoGeral: null,
                observacoes: '',
                fotos: []
            },
            ingressos: []
        };

        const resultado = await database.collection('eventos').insertOne(novoEvento);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Evento, serviços, cronograma e orçamento cadastrados com sucesso no MongoDB!',
            idevento: resultado.insertedId.toString()
        });

    } catch (e) {
        console.error("Erro no cadastro completo do evento:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Erro ao processar criação do evento.' });
    }
});

router.delete('/cancelar-evento/:idevento', async (req, res) => {
    const { idevento } = req.params;

    try {
        const database = await db.getDb();
        const resultado = await database.collection('eventos').updateOne(
            { _id: new ObjectId(idevento) },
            { $set: { status: 'CANCELADO' } }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Evento não encontrado.' });
        }

        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Evento cancelado com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao cancelar evento:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Não foi possível cancelar o evento.' });
    }
});

router.post('/confirmar', async (req, res) => {
    try {
        const { idevento } = req.body;

        if (!idevento) {
            return res.status(400).json({ erro: 'ID do evento não fornecido.' });
        }

        const database = await db.getDb();
        const resultado = await database.collection('eventos').updateOne(
            { _id: new ObjectId(idevento) },
            { $set: { status: 'CONFIRMADO' } }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Evento não encontrado.' });
        }

        res.json({ 
            sucesso: true, 
            mensagem: 'Evento confirmado com sucesso!' 
        });
    } catch (err) {
        console.error("Erro ao confirmar evento:", err);
        res.status(400).json({ erro: err.message });
    }
});

module.exports = router;