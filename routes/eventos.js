const express = require("express");
const router = express.Router();
const db = require("../db");

// ROTAS PARA CLIENTES
router.get('/criados/:idcliente', async (req, res) => {
    const { idcliente } = req.params;
    try {
        const query = 'SELECT * FROM evento WHERE idcliente = $1 ORDER BY datainicio DESC;';
        const resultado = await db.query(query, [idcliente]);
        return res.status(200).json({ sucesso: true, eventos: resultado.rows });
    } catch (e) {
        console.error("Erro ao buscar eventos criados:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar eventos.' });
    }
});


// ROTAS PARA PARTICIPANTES
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

router.get('/todos', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.idevento, 
                e.nomeevento AS nome_evento, 
                e.descricao, 
                e.datainicio AS data_evento, 
                l.nome AS local,
                e.status
            FROM evento e
            LEFT JOIN localizacao l ON e.idlocalizacao = l.idlocalizacao
            ORDER BY e.datainicio;
        `;

        const resultado = await db.query(query);

        return res.status(200).json({
            sucesso: true,
            eventos: resultado.rows
        });

    } catch (e) {
        console.error("Erro ao buscar todos os eventos:", e);
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

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let { idparticipante } = req.query;

    try {
        const queryEvento = `
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
                e.idcliente,
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

        const resultadoEvento = await db.query(queryEvento, [id, idparticipante]);
        
        if (resultadoEvento.rowCount === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        const evento = resultadoEvento.rows[0];

        const queryServicos = `
            SELECT its.quantcontratada, its.valoracordado, s.descricao AS nomeservico 
            FROM itemservico its
            JOIN servico s ON its.idservico = s.idservico
            WHERE its.idevento = $1;
        `;
        const resultadoServicos = await db.query(queryServicos, [id]);
        evento.servicos = resultadoServicos.rows;

        const queryCronograma = `
            SELECT cr.duracaominutos, cr.datainicio, cr.valorcache, a.nome AS nomeapresentador 
            FROM cronograma cr
            LEFT JOIN apresentador a ON cr.idapresentador = a.idapresentador
            WHERE cr.idevento = $1;
        `;
        const resultadoCronograma = await db.query(queryCronograma, [id]);
        evento.cronograma = resultadoCronograma.rows;

        return res.status(200).json({
            sucesso: true,
            evento: evento
        });

    } catch (e) {
        console.error("Erro ao buscar detalhes do evento:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar detalhes do evento.' });
    }
});

router.get('/categorias/todas', async (req, res) => {
    try {
        const query = 'SELECT idcategoriaevento, nomecategoria FROM categoriaevento ORDER BY nomecategoria;';
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, categorias: resultado.rows });
    } catch (e) {
        console.error("Erro ao buscar categorias:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar categorias.' });
    }
});

router.get('/localizacoes/todas', async (req, res) => {
    try {
        const query = 'SELECT * FROM localizacao ORDER BY nome;';
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, localizacoes: resultado.rows });
    } catch (e) {
        console.error("Erro ao buscar localizações:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar localizações.' });
    }
});

router.post('/criar', async (req, res) => {
    const {
        nomeEvento,
        idCategoriaEvento,
        dataInicio,
        dataTermino,
        horarioInicio,
        horarioTermino,
        valorIngresso,
        numParticipantes,
        idCliente,
        idLocalizacao,
        descricao,
        servicos,
        cronograma,
        orcamentoInicial
    } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Dados iniciais
        const queryEvento = `
            SELECT criaEvento($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) AS idevento;
        `;
        const valuesEvento = [
            nomeEvento,
            idCategoriaEvento,
            dataInicio,
            dataTermino,
            horarioInicio,
            horarioTermino,
            valorIngresso,
            numParticipantes,
            idCliente,
            idLocalizacao,
            descricao || ''
        ];

        const resultadoEvento = await client.query(queryEvento, valuesEvento);
        const idCriado = resultadoEvento.rows[0].idevento;

        // Fornecimentos
        if (servicos && servicos.length > 0) {
            for (const serv of servicos) {
                const queryItem = `
                    SELECT criaItemServico($1, $2, $3, $4, $5);
                `;
                await client.query(queryItem, [
                    serv.quantContratada,
                    serv.valorAcordado,
                    serv.idServico,
                    serv.idFornecedor,
                    idCriado
                ]);
            }
        }

        // Cronogramas
        if (cronograma && cronograma.length > 0) {
            for (const cron of cronograma) {
                const queryCron = `
                    SELECT criaCronograma($1, $2, $3, $4, $5);
                `;
                await client.query(queryCron, [
                    cron.duracaoMinutos,
                    cron.dataInicio, 
                    cron.valorCache,
                    cron.idApresentador || null,
                    idCriado
                ]);
            }
        }

        // Orçamento
        if (orcamentoInicial !== undefined && orcamentoInicial !== null && orcamentoInicial !== '') {
            const queryOrcamento = `
                SELECT criaOrcamento($1, (current_date + interval '30 days')::date, $2, $3, $4, $5);
            `;
            const idFormaPagamentoPadrao = 1; 
            await client.query(queryOrcamento, [
                idFormaPagamentoPadrao,
                orcamentoInicial,
                idCriado,
                'Orçamento inicial gerado automaticamente no cadastro.',
                descricao || ''
            ]);
        }

        await client.query('COMMIT');
        client.release();

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Evento, serviços, cronograma e orçamento cadastrados com sucesso!',
            idevento: idCriado
        });

    } catch (e) {
        await client.query('ROLLBACK');
        client.release();
        console.error("Erro no cadastro completo do evento:", e);
        return res.status(400).json({ sucesso: false, erro: e.message || 'Erro ao processar criação do evento.' });
    }
});

router.delete('/cancelar-evento/:idevento', async (req, res) => {
    const { idevento } = req.params;

    try {
        const query = 'SELECT cancelaEvento($1) AS resultado;';
        const resultado = await db.query(query, [idevento]);
        
        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Evento cancelado com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao cancelar evento:", e);
        const mensagemErro = e.message || 'Não foi possível cancelar o evento.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

router.post('/confirmar', async (req, res) => {
    try {
        const { idEvento } = req.body;

        if (!idEvento) {
            return res.status(400).json({ erro: 'ID do evento não fornecido.' });
        }

        await db.query('SELECT confirmaEvento($1)', [parseInt(idEvento)]);

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