const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const dbName = "joinventos";

const IDs = {
    clientes: {
        ana: new ObjectId('650000000000000000000011'),
        carlos: new ObjectId('650000000000000000000012')
    },
    localizacoes: {
        garden: new ObjectId('650000000000000000000001'),
        convencoes: new ObjectId('650000000000000000000002'),
        recanto: new ObjectId('650000000000000000000003')
    },
    fornecedores: {
        gastronomia: new ObjectId('650000000000000000000021'),
        luzSom: new ObjectId('650000000000000000000022'),
        captura: new ObjectId('650000000000000000000023')
    },
    apresentadores: {
        juliana: new ObjectId('650000000000000000000031'),
        ricardo: new ObjectId('650000000000000000000032')
    },
    servicos: {
        buffet: new ObjectId('650000000000000000000041'),
        som: new ObjectId('650000000000000000000042'),
        foto: new ObjectId('650000000000000000000043')
    },
    participantes: {
        mariana: new ObjectId('650000000000000000000051'),
        lucas: new ObjectId('650000000000000000000052'),
        beatriz: new ObjectId('650000000000000000000053'),
        teste: new ObjectId('650000000000000000000054')
    }
};

async function resetDatabase() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        console.log("Conectado ao MongoDB para executar o Seed...");

        // LIMPA O BANCO
        const collections = ['clientes', 'participantes', 'fornecedores', 'apresentadores', 'localizacoes', 'servicos', 'eventos'];
        for (const col of collections) {
            await db.collection(col).drop().catch(() => {});
        }
        console.log("Banco limpo com sucesso!");

        // INSERE LOCALIZAÇÕES
        await db.collection('localizacoes').insertMany([
            {
                _id: IDs.localizacoes.garden,
                valorlocacao: 5000.00,
                nome: 'Espaço Garden Festas',
                endereco: 'Rua das Palmeiras, 1000 - Centro',
                capmaxima: 350,
                area: 600.50,
                infradisp: 'Ar condicionado, mesas, cadeiras, palco modulado e gerador próprio.'
            },
            {
                _id: IDs.localizacoes.convencoes,
                valorlocacao: 12000.00,
                nome: 'Centro de Convenções Joinville',
                endereco: 'Av. Beira Rio, 500 - Saguaçu',
                capmaxima: 1500,
                area: 2500.00,
                infradisp: 'Infraestrutura completa de som, projeção, Wi-Fi de alta velocidade e camarins.'
            },
            {
                _id: IDs.localizacoes.recanto,
                valorlocacao: 2500.00,
                nome: 'Chácara Recanto Verde',
                endereco: 'Estrada Dona Francisca, km 12 - Pirabeiraba',
                capmaxima: 150,
                area: 1200.00,
                infradisp: 'Área verde aberta, churrasqueira, piscina e cozinha equipada.'
            }
        ]);

        // INSERE CLIENTES
        await db.collection('clientes').insertMany([
            {
                _id: IDs.clientes.ana,
                nome: 'Ana Souza Eventos',
                senha: '$2b$10$Ep99D8N.0q4K3g8Y6Q8vW.K2Wv5dJ7f9h1j3k5l7z9x2c4v6b8n0m',
                telefone: '47991112222',
                email: 'ana.cliente@email.com',
                endereco: 'Rua XV de Novembro, 200 - Centro',
                cpf_cnpj: '12.345.678/0001-99'
            },
            {
                _id: IDs.clientes.carlos,
                nome: 'Carlos Eduardo Silva',
                senha: '$2b$10$Ep99D8N.0q4K3g8Y6Q8vW.K2Wv5dJ7f9h1j3k5l7z9x2c4v6b8n0m',
                telefone: '47998887766',
                email: 'carlos.cliente@email.com',
                endereco: 'Rua Visconde de Taunay, 550 - Bucarein',
                cpf_cnpj: '98.765.432/0001-11'
            }
        ]);

        // INSERE FORNECEDORES
        await db.collection('fornecedores').insertMany([
            {
                _id: IDs.fornecedores.gastronomia,
                ativo: true,
                nome: 'Gastronomia & Sabor Ltda',
                cnpj: '11.222.333/0001-44',
                telefone: '4734331122',
                especialidade: 'BUFFET',
                email: 'contato@gastronomiasabor.com',
                avaldesempenho: 9.5
            },
            {
                _id: IDs.fornecedores.luzSom,
                ativo: true,
                nome: 'Luz & Som Produções',
                cnpj: '44.555.666/0001-77',
                telefone: '4734229988',
                especialidade: 'SONORIZACAO',
                email: 'comercial@luzesom.com',
                avaldesempenho: 9.0
            },
            {
                _id: IDs.fornecedores.captura,
                ativo: true,
                nome: 'Captura Moments Fotografia',
                cnpj: '77.888.999/0001-22',
                telefone: '47988776655',
                especialidade: 'FOTOGRAFIA',
                email: 'foto@capturamoments.com',
                avaldesempenho: 9.8
            }
        ]);

        // INSERE APRESENTADORES
        await db.collection('apresentadores').insertMany([
            {
                _id: IDs.apresentadores.juliana,
                nome: 'Juliana Mendes',
                telefone: '(11) 97777-4444',
                biografia: 'Palestrante motivacional e mestre de cerimônias com mais de 10 anos de experiência em grandes congressos corporativos.',
                email: 'juliana.mendes@palestras.com'
            },
            {
                _id: IDs.apresentadores.ricardo,
                nome: 'Prof. Ricardo Antunes',
                telefone: '(41) 98822-3344',
                biografia: 'Doutor em Inovação Tecnológica e pesquisador de Inteligência Artificial aplicada aos negócios.',
                email: 'ricardo.antunes@academico.com'
            }
        ]);

        // INSERE PARTICIPANTES
        await db.collection('participantes').insertMany([
            {
                _id: IDs.participantes.mariana,
                nome: 'Mariana Lima',
                senha: '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h',
                telefone: '47977113344',
                email: 'mariana.participante@email.com'
            },
            {
                _id: IDs.participantes.lucas,
                nome: 'Lucas Gabriel Rocha',
                senha: '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h',
                telefone: '47966552233',
                email: 'lucas.participante@email.com'
            },
            {
                _id: IDs.participantes.beatriz,
                nome: 'Beatriz Costa',
                senha: '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h',
                telefone: '47955441122',
                email: 'beatriz.participante@email.com'
            },
            {
                _id: IDs.participantes.teste,
                nome: 'teste',
                senha: '$2b$10$1r5LFEVSm5HjltLot.VECOG5rxVfvapnMrv2mexim53sSWEow6Iii',
                telefone: '47952412971',
                email: 'teste@gmail.com'
            }
        ]);

        // INSERE SERVIÇOS
        await db.collection('servicos').insertMany([
            {
                _id: IDs.servicos.buffet,
                unidmedida: 'Pessoa',
                ativo: true,
                valorunit: 75.00,
                nomecategoriaservico: 'BUFFET',
                descricao: 'Serviço de buffet completo (entrada, prato principal e sobremesa).'
            },
            {
                _id: IDs.servicos.som,
                unidmedida: 'Hora',
                ativo: true,
                valorunit: 350.00,
                nomecategoriaservico: 'SONORIZACAO',
                descricao: 'Locação e operação técnica de kit de sonorização e microfones sem fio.'
            },
            {
                _id: IDs.servicos.foto,
                unidmedida: 'Unidade',
                ativo: true,
                valorunit: 1200.00,
                nomecategoriaservico: 'FOTOGRAFIA',
                descricao: 'Cobertura fotográfica integral do evento com entrega de galeria digital.'
            }
        ]);

        // INSERE EVENTOS
        await db.collection('eventos').insertMany([
            {
                nomeevento: 'Seminário de Tecnologia e Inovação 2026',
                idcategoriaevento: 'SEMINARIO',
                datainicio: '2026-07-15',
                datatermino: '2026-07-15',
                horarioinicio: '08:00:00',
                horariotermino: '18:00:00',
                valoringresso: 150.00,
                numparticipantes: 200,
                status: 'CONFIRMADO',
                idcliente: IDs.clientes.ana,
                idlocalizacao: IDs.localizacoes.convencoes,
                descricao: 'Um dia inteiro de palestras focadas nas tendências de tecnologia para o mercado corporativo.',
                servicos: [
                    {
                        nomeservico: 'Serviço de buffet completo (entrada, prato principal e sobremesa).',
                        quantcontratada: 200.00,
                        valoracordado: 75.00,
                        status: 'CONFIRMADO'
                    },
                    {
                        nomeservico: 'Locação e operação técnica de kit de sonorização e microfones sem fio.',
                        quantcontratada: 10.00,
                        valoracordado: 350.00,
                        status: 'CONFIRMADO'
                    }
                ],
                cronograma: [
                    {
                        duracaominutos: 120,
                        datainicio: '2026-07-15 09:00:00',
                        valorcache: 2500.00,
                        nomeapresentador: 'Juliana Mendes'
                    },
                    {
                        duracaominutos: 180,
                        datainicio: '2026-07-15 14:00:00',
                        valorcache: 3000.00,
                        nomeapresentador: 'Prof. Ricardo Antunes'
                    }
                ],
                orcamento: {
                    valortotal: 21500.00,
                    validade: '2026-06-30',
                    condicoes: '50% de entrada via PIX e saldo restante na semana do evento.',
                    descricao: 'Orçamento detalhado incluindo locação do espaço e serviços terceirizados.'
                },
                ingressos: [
                    {
                        idingresso: new ObjectId().toString(),
                        idparticipante: IDs.participantes.mariana.toString(),
                        confirmacao: true
                    },
                    {
                        idingresso: new ObjectId().toString(),
                        idparticipante: IDs.participantes.lucas.toString(),
                        confirmacao: true
                    }
                ],
                relatorio: {
                    idrelatorio: new ObjectId().toString(),
                    numRealParticipantes: 0,
                    avaliacaoGeral: null,
                    observacoes: '',
                    fotos: []
                }
            },
            {
                nomeevento: 'Workshop de Desenvolvimento Web Moderno',
                idcategoriaevento: 'WORKSHOP',
                datainicio: '2026-08-10',
                datatermino: '2026-08-10',
                horarioinicio: '13:30:00',
                horariotermino: '19:00:00',
                valoringresso: 80.00,
                numparticipantes: 50,
                status: 'EM_PREPARACAO',
                idcliente: IDs.clientes.ana,
                idlocalizacao: IDs.localizacoes.garden,
                descricao: 'Mão na massa com arquitetura de aplicações web eficientes e seguras.',
                servicos: [
                    {
                        nomeservico: 'Serviço de buffet completo (entrada, prato principal e sobremesa).',
                        quantcontratada: 50.00,
                        valoracordado: 80.00,
                        status: 'CONTRATADO'
                    }
                ],
                cronograma: [],
                orcamento: {
                    valortotal: 5200.00,
                    validade: '2026-07-30',
                    condicoes: 'Pagamento em boleto bancário parcelado em 2x.',
                    descricao: 'Orçamento básico para o workshop técnico.'
                },
                ingressos: [
                    {
                        idingresso: new ObjectId().toString(),
                        idparticipante: IDs.participantes.mariana.toString(),
                        confirmacao: false
                    },
                    {
                        idingresso: new ObjectId().toString(),
                        idparticipante: IDs.participantes.beatriz.toString(),
                        confirmacao: true
                    }
                ],
                relatorio: {
                    idrelatorio: new ObjectId().toString(),
                    numRealParticipantes: 0,
                    avaliacaoGeral: null,
                    observacoes: '',
                    fotos: []
                }
            },
            {
                nomeevento: 'Confraternização da Bórus Ltda',
                idcategoriaevento: 'CONFRATERNIZACAO',
                datainicio: '2026-09-20',
                datatermino: '2026-09-20',
                horarioinicio: '20:00:00',
                horariotermino: '03:00:00',
                valoringresso: 20.00,
                numparticipantes: 100,
                status: 'CONFIRMADO',
                idcliente: IDs.clientes.carlos,
                idlocalizacao: IDs.localizacoes.recanto,
                descricao: 'Pra fechar o bom andamento da empresa com chave de ouro!',
                servicos: [],
                cronograma: [],
                orcamento: { valortotal: 3000.00, descricao: 'Orçamento confraternização' },
                ingressos: [],
                relatorio: {
                    idrelatorio: new ObjectId().toString(),
                    numRealParticipantes: 0,
                    avaliacaoGeral: null,
                    observacoes: '',
                    fotos: []
                }
            },
            {
                nomeevento: 'Confraternização Anual de Fim de Ano',
                idcategoriaevento: 'CONFRATERNIZACAO',
                datainicio: '2026-12-20',
                datatermino: '2026-12-20',
                horarioinicio: '20:00:00',
                horariotermino: '03:00:00',
                valoringresso: 200.00,
                numparticipantes: 120,
                status: 'REALIZADO',
                idcliente: IDs.clientes.carlos,
                idlocalizacao: IDs.localizacoes.recanto,
                descricao: 'Festa com buffet completo e música ao vivo para fechar o ano com chave de ouro.',
                servicos: [],
                cronograma: [],
                orcamento: { valortotal: 10000.00, descricao: 'Fim de ano' },
                ingressos: [],
                relatorio: {
                    idrelatorio: new ObjectId().toString(),
                    numRealParticipantes: 190,
                    avaliacaoGeral: 9.5,
                    observacoes: 'Evento ocorreu dentro do horário previsto, alta satisfação do público com os palestrantes.',
                    fotos: []
                }
            }
        ]);

        console.log("Banco populado (Seed executado) com sucesso!");
    } catch (error) {
        console.error("Erro ao rodar o seed:", error);
    } finally {
        await client.close();
    }
}

resetDatabase();