DROP TABLE IF EXISTS Evento CASCADE;
DROP TABLE IF EXISTS Relatorio CASCADE;
DROP TABLE IF EXISTS Foto CASCADE;
DROP TABLE IF EXISTS Fornecedor CASCADE;
DROP TABLE IF EXISTS Servico CASCADE;
DROP TABLE IF EXISTS ItemServico CASCADE;
DROP TABLE IF EXISTS Cliente CASCADE;
DROP TABLE IF EXISTS Pagamento CASCADE;
DROP TABLE IF EXISTS Orcamento CASCADE;
DROP TABLE IF EXISTS Localizacao CASCADE;
DROP TABLE IF EXISTS Apresentador CASCADE;
DROP TABLE IF EXISTS Cronograma CASCADE;
DROP TABLE IF EXISTS Participante CASCADE;
DROP TABLE IF EXISTS TipoIngresso CASCADE;
DROP TABLE IF EXISTS Ingresso CASCADE;
DROP TABLE IF EXISTS CategoriaEvento CASCADE;
DROP TABLE IF EXISTS CategoriaServico CASCADE;
DROP TABLE IF EXISTS FormaPagamento CASCADE;

create table Localizacao(
	idLocalizacao serial primary key,
	valorLocacao numeric(10,2) not null,
	nome varchar(50) not null,
	endereco varchar(100) not null,
	capMaxima int not null,
	area numeric not null,
	infraDisp text
);

create table cliente(
	idCliente serial primary key,
	nome varchar(50) not null,
	senha text not null,
	telefone varchar(25) not null,
	email varchar(40),
	endereco varchar(100),
	cpf_cnpj varchar(20) not null unique
);

create table CategoriaEvento(
	idCategoriaEvento serial primary key,
	nomeCategoria varchar(20) not null

-- Adicionar depois via DML:
-- ('CASAMENTO', 'ANIVERSARIO', 'FORMATURA', 'SEMINARIO', 'WORKSHOP', 'CONGRESSO', 'CONFRATERNIZACAO', 'OUTRO')

);

create table Evento(
	idEvento serial primary key,
	nomeEvento varchar(100) not null,
	idCategoriaEvento int references CategoriaEvento on delete set null,
	dataInicio date not null,
	dataTermino date not null,
	horarioInicio time not null,
	horarioTermino time not null,
	valorIngresso numeric(10,2) not null,
	numParticipantes int, -- Esse check não precisa de tabela própria pois o status não foge desses comportamentos
	status varchar(15) not null check (status in ('ORCAMENTO', 'EM_PREPARACAO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO')),
	idCliente int not null references Cliente,
	idLocalizacao int references Localizacao,
	descricao text
);

create table Relatorio(
	idRelatorio serial primary key,
	numRealParticipantes int not null,
	avaliacaoGeral numeric(3,1) check (avaliacaoGeral between 0 and 10),
	observacoes text,
	idEvento int not null references Evento on delete cascade
);

create table Foto(
	idFoto serial primary key,
	nomeFoto varchar(50),
	imagem bytea not null,
	idRelatorio int not null references Relatorio on delete cascade
);

create table Fornecedor(
	idFornecedor serial primary key,
	ativo boolean not null default true,
	nome varchar(50) not null,
	cnpj varchar(20) not null unique,
	telefone varchar(25) not null,
	especialidade varchar(40),
	email varchar(40),
	avalDesempenho numeric(3,1)
);

create table CategoriaServico(
	idCategoriaServico serial primary key,
	nomeCategoriaServico varchar(20) not null
-- ('BUFFET', 'DECORACAO', 'SONORIZACAO', 'ILUMINACAO', 'FOTOGRAFIA', 'FILMAGEM', 'ANIMACAO', 'SEGURANCA', 'RECEPCIONISMO', 'BRINDE', 'OUTRO'))
);

create table Servico(
	idServico serial primary key,
	unidMedida varchar(20) not null,
	ativo boolean not null default true,
	valorUnit numeric(10,2) not null,
	idCategoriaServico int references CategoriaServico on delete set null,
	descricao text
);

create table ItemServico(
	idItemServico serial primary key,
	status varchar(20) not null check (status in ('CONTRATADO', 'CONFIRMADO', 'CONCLUIDO')) default 'CONTRATADO',
	quantContratada numeric(10,2) not null,
	valorAcordado numeric(10,2) not null,
	valorTotal numeric(10,2) generated always as (quantContratada * valorAcordado) stored,
	idServico int references Servico on delete set null,
	idFornecedor int not null references Fornecedor, --só cria um fornecedor sendo a casa mesmo
	idEvento int references Evento on delete cascade 
);

create table FormaPagamento(
	idFormaPagamento serial primary key,
	nomeFormaPagamento varchar(20)
-- ('DEBITO', 'CREDITO', 'DINHEIRO', 'PIX', 'BOLETO', 'CHEQUE', 'OUTRO')
);

create table Orcamento(
	idOrcamento serial primary key,
	dataEmissao timestamp(0) default now(),
	idFormaPagamento int references FormaPagamento on delete set null,
	validade date not null,
	valorTotal numeric(10,2) not null,
	condicoes text,
	descricao text,
	idEvento int not null references Evento on delete cascade
);

create table Pagamento(
	idPagamento serial primary key,
	dataPagamento timestamp(0) default now() not null,
	valorTotal numeric(10,2) not null,
	valorPago numeric(10,2) not null,
	idFormaPagamento int references FormaPagamento on delete set null,
	idEvento int not null references Evento on delete cascade,
	idCliente int not null references Cliente on delete cascade
);

create table Apresentador(
	idApresentador serial primary key,
	nome varchar(50) not null,
	telefone varchar(25) not null,
	biografia text,
	email varchar(40)
);

create table Cronograma(
	idCronograma serial primary key,
	duracaoMinutos int not null,
	dataInicio timestamp(0) not null,
	valorCache numeric(10, 2) not null,
	idApresentador int references Apresentador on delete set null,
	idEvento int not null references Evento on delete cascade
);

create table participante(
	idParticipante serial primary key,
	nome varchar(50) not null,
	senha text not null,
	telefone varchar(25) not null,
	email varchar(40)
);

create table Ingresso(
	idIngresso serial primary key,
	confirmacao boolean default false,
	idEvento int not null references Evento,
	idParticipante int not null references Participante on delete cascade
);
