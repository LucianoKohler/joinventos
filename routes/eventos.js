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

// ROTA GENÉRICA
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { idparticipante } = req.query;

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

// Rota para buscar categorias de eventos (para o select)
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

// Rota para buscar localizações cadastradas (para o select)
router.get('/localizacoes/todas', async (req, res) => {
    try {
        const query = 'SELECT idlocalizacao, nome, capmaxima FROM localizacao ORDER BY nome;';
        const resultado = await db.query(query);
        return res.status(200).json({ sucesso: true, localizacoes: resultado.rows });
    } catch (e) {
        console.error("Erro ao buscar localizações:", e);
        return res.status(500).json({ erro: 'Erro interno ao buscar localizações.' });
    }
});

// Rota para cadastrar o evento completo, serviços, cronograma e orçamento em transação (Tudo ou Nada)
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

    const client = await db.connect(); // Obtém cliente do pool para transação unificada

    try {
        await client.query('BEGIN');

        // 1. Cria o Evento chamando a stored function oficial 'criaEvento'
        // Assinatura esperada: 
        // (nomeEvento_p varchar, idCategoriaEvento_p integer, dataInicio_p date, dataTermino_p date, 
        //  horarioInicio_p time, horarioTermino_p time, valorIngresso_p numeric, numParticipantes_p integer, 
        //  idCliente_p integer, idLocalizacao_p integer, descricao_p text)
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

        // 2. Insere os Itens de Serviço usando a stored function oficial 'criaItemServico'
        // Assinatura esperada: 
        // (quantContratada_p numeric, valorAcordado_p numeric, idServico_p integer, idFornecedor_p integer, idEvento_p integer)
        if (servicos && servicos.length > 0) {
            for (const serv of servicos) {
                const queryItem = `
                    SELECT criaItemServico($1, $2, $3, $4, $5);
                `;
                await client.query(queryItem, [
                    serv.quantContratada,
                    serv.valorAcordado,
                    serv.idServico,
                    serv.idFornecedor, // Obrigatório conforme constraint NOT NULL da tabela ItemServico
                    idCriado
                ]);
            }
        }

        // 3. Insere o Cronograma usando a stored function oficial 'criaCronograma'
        if (cronograma && cronograma.length > 0) {
            console.log("Processando cronograma para o evento:", idCriado, cronograma);
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

        // 4. Cria o Orçamento Inicial usando a stored function oficial 'criaOrcamento'
        if (orcamentoInicial !== undefined && orcamentoInicial !== null && orcamentoInicial !== '') {
            const queryOrcamento = `
                SELECT criaOrcamento($1, (current_date + interval '30 days')::date, $2, $3, $4, $5);
            `;
            const idFormaPagamentoPadrao = 1; // Certifique-se de que existe uma forma de pagamento com ID 1 no seu banco
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
        const mensagemErro = e.detail || e.message || 'Erro ao processar criação do evento.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

// Rota para cancelar evento criado pelo ID do evento
router.delete('/cancelar-evento/:idevento', async (req, res) => {
    const { idevento } = req.params;

    try {
        // Executa a função do banco que retorna numeric
        const query = 'SELECT cancelaEvento($1) AS resultado;';
        const resultado = await db.query(query, [idevento]);
        
        // Se a query executou sem disparar exception no banco, o cancelamento ocorreu com sucesso
        return res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Evento cancelado com sucesso!' 
        });

    } catch (e) {
        console.error("Erro ao cancelar evento:", e);
        // Captura o RAISE EXCEPTION lançado pela stored function
        const mensagemErro = e.detail || e.message || 'Não foi possível cancelar o evento.';
        return res.status(400).json({ sucesso: false, erro: mensagemErro });
    }
});

module.exports = router;