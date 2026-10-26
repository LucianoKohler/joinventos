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

create table Cliente(
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

create table Participante(
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

----------------------------------------------------------------------------

create or replace function criaEvento(
	nomeEvento_p varchar, idCategoriaEvento_p integer, dataInicio_p date, dataTermino_p date, horarioInicio_p time, horarioTermino_p time, 
	valorIngresso_p numeric, numParticipantes_p integer, idCliente_p integer, idLocalizacao_p integer, descricao_p text default '') returns integer as
$$
declare
	v_idEvento integer;
	v_capMaxima integer;
begin

	if (valorIngresso_p < 0 or valorIngresso_p is null) then
		raise exception 'O valor do ingresso não pode ser um valor negativo (ou nulo)! Criação de evento cancelada.';
	end if;

	if not exists(select 1 from CategoriaEvento where idCategoriaEvento = idCategoriaEvento_p) then
		raise exception 'Categoria de evento selecionada não está registrada no sistema! Criação de evento cancelada.';
	end if;

	if (dataInicio_p <= current_date or dataInicio_p is null) then
		raise exception 'Data do evento não pode ser anterior a data atual ou no mesmo dia (ou nula)! Criação de evento cancelada.';
	end if;

	if (dataInicio_p > dataTermino_p or dataTermino_p is null) then
		raise exception 'Data de fim do evento não pode ser menor que a data de início (ou nula)! Criação de evento cancelada.';
	end if;

	if (horarioInicio_p >= horarioTermino_p and dataInicio_p = dataTermino_p) then
		raise exception 'Horário de término do evento não pode ser menor ou igual ao horário de início! Criação de evento cancelada.';
	end if;

	if (numParticipantes_p <= 0 or numParticipantes_p is null) then
		raise exception 'Número de participantes deve ser um valor maior que 0! Criação de evento cancelada.';
	end if;

	if not exists(select 1 from Cliente where idCliente = idCliente_p) then
		raise exception 'Cliente selecionado não está registrado no sistema! Criação de evento cancelada.';
	end if;

	if not exists(select 1 from Localizacao where idLocalizacao = idLocalizacao_p) then
		raise exception 'Localização selecionada não está registrada no sistema! Criação de evento cancelada.';
	end if;

	if exists(select 1 from Evento where idLocalizacao = idLocalizacao_p and status != 'CANCELADO'
		and (dataInicio + horarioInicio) < (dataTermino_p + horarioTermino_p)
		and (dataTermino + horarioTermino) > (dataInicio_p + horarioInicio_p)) then
			raise exception 'Existe conflito nos horários! Localização já está reservada nesse período!';
	end if;

	select capMaxima from Localizacao where idLocalizacao = idLocalizacao_p into v_capMaxima;

	if (numParticipantes_p > v_capMaxima) then
		raise exception 'Número de participantes excede capacidade máxima da localização com ID %! Criação de evento cancelada.', idLocalizacao_p;
	end if;

	insert into Evento(nomeEvento, idCategoriaEvento, dataInicio, dataTermino, horarioInicio, horarioTermino, 
		valorIngresso, numParticipantes, status, idCliente, idLocalizacao, descricao)
	values (nomeEvento_p, idCategoriaEvento_p, dataInicio_p, dataTermino_p, horarioInicio_p, horarioTermino_p,
		valorIngresso_p, numParticipantes_p, 'ORCAMENTO', idCliente_p, idLocalizacao_p, descricao_p)
	returning idEvento into v_idEvento;

	raise notice 'Evento de ID % foi criado com sucesso!', v_idEvento;

	return v_idEvento;
	
end;
$$
language plpgsql;


create or replace function confirmaEvento(idEvento_p integer) returns void as
$$
declare
	v_statusEvento varchar;
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p) then
		raise exception 'Evento com ID % não registrado no sistema! Confirmação de evento cancelada!', idEvento_p;
	end if;

	select status from Evento where idEvento = idEvento_p into v_statusEvento;

	if (v_statusEvento != 'EM_PREPARACAO') then
		raise exception 'Evento com status %! Não é possível fazer a confirmação do mesmo.', v_statusEvento;
	end if;

	update Evento set status = 'CONFIRMADO' where idEvento = idEvento_p;

	raise notice 'Status do evento de ID % atualizado para CONFIRMADO com sucesso.', idEvento_p;
	
end;
$$
language plpgsql;


create or replace function concluiEvento(idEvento_p integer) returns void as
$$
declare
	v_statusEvento varchar;
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p) then
		raise exception 'Evento com ID % não registrado no sistema! Conclusão de evento cancelada!', idEvento_p;
	end if;

	select status from Evento where idEvento = idEvento_p into v_statusEvento;

	if (v_statusEvento != 'CONFIRMADO') then
		raise exception 'Evento possui status %! Não é possível fazer a conclusão do mesmo.', v_statusEvento;
	end if;

	update Evento set status = 'REALIZADO' where idEvento = idEvento_p;

	raise notice 'Status do Evento de ID % atualizado para REALIZADO. Relatório gerado.', idEvento_p;
	
end;
$$
language plpgsql;


/*
select * from Evento

insert into Cliente(nome, telefone, email, endereco, cpf_cnpj) values ('Cliente teste', '999999999', 'email@teste.com', 'Rua teste', '11111111111')
insert into Localizacao(valorLocacao, nome, endereco, capMaxima, area) 
	values (2000.00, 'Local Teste', 'Rua2 Teste', 200, 1000)
insert into CategoriaEvento(nomeCategoria) values ('Categoria Teste')

	
select criaEvento('Evento Teste', 1, '2026-10-09', '2026-10-09', '14:00:00', '15:00:00', 10.00 ,200, 1, 1)
select concluiEvento(4)
*/

-- não trato a questão de se o valor foi estornado ou não, isso eu deixo com a administração da empresa.
create or replace function cancelaEvento(idEvento_p integer) returns numeric as
$$
declare
	v_valorEstorno numeric(10,2);
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p and status not in ('REALIZADO', 'CANCELADO')) then
		raise exception 'Evento com ID % já foi realizado/cancelado ou não está registrado no sistema!', idEvento_p;
	end if;
	
	select coalesce(sum(valorPago), 0) from Pagamento where idEvento = idEvento_p into v_valorEstorno;

	update Evento set status = 'CANCELADO' where idEvento = idEvento_p;

	raise notice 'Evento de id % cancelado com sucesso! Valor a ser estornado para o cliente: R$ %.', idEvento_p, v_valorEstorno;

	return coalesce(v_valorEstorno, 0);
	
end;
$$
language plpgsql;

/*
update Evento set status = 'REALIZADO' where idEvento = 3
select cancelaEvento(3)
*/

-----------------------------------------------------------------

create or replace function criaCronograma(duracaoMinutos_p integer, dataInicio_p timestamp(0),
	valorCache_p numeric, idApresentador_p integer, idEvento_p integer) returns integer as
$$
declare
	v_idCronograma integer;
	
	-- para armazenar o timestamp(0) do final do evento do apresentador que estará 
	v_dataHTermino timestamp(0); 
	v_horarioOcupado record;
	v_nomeApresentador varchar(50);
	v_eventoDataHoraInicio timestamp(0);
	v_eventoDataHoraTermino timestamp(0);
	
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p and status not in ('REALIZADO', 'CANCELADO')) then
		raise exception 'Evento selecionado já foi realizado/cancelado ou não está registrado no sistema! Criação de cronograma cancelada.';
	end if;

	if not exists(select 1 from Apresentador where idApresentador = idApresentador_p) then
		raise exception 'Apresentador selecionado não está registrado no sistema! Criação de cronograma cancelada.';
	end if;

	if (duracaoMinutos_p <= 0 or duracaoMinutos_p is null) then
		raise exception 'O cronograma não pode ter uma duração negativa ou nula! Criação de cronograma cancelada.';
	end if;

	if (dataInicio_p < now() or dataInicio_p is null) then
		raise exception 'Data/Horário de início não pode ser anterior a data/horário atual e deve ser não nula! Criação de cronograma cancelada.';
	end if;

	if (valorCache_p < 0 or valorCache_p is null) then
		raise exception 'O cachê da palestra deve ser um valor positivo não nulo! Criação de cronograma cancelada.';
	end if;

	select (dataInicio + horarioInicio), (dataTermino + horarioTermino) from Evento where idEvento = idEvento_p 
		into v_eventoDataHoraInicio, v_eventoDataHoraTermino;

	if (dataInicio_p < v_eventoDataHoraInicio 
		or (dataInicio_p + (duracaoMinutos_p * INTERVAL '1 minute')) > v_eventoDataHoraTermino) then
		raise exception 'Cronograma fora do horário do evento! Criação de cronograma cancelada.';
	end if;

	v_dataHTermino := dataInicio_p + (duracaoMinutos_p * INTERVAL '1 minute');

	select duracaoMinutos, dataInicio from Cronograma where idApresentador = idApresentador_p 
		-- Novo evento começa antes do existente terminar:
	  	and dataInicio_p < (dataInicio + (duracaoMinutos * INTERVAL '1 minute'))
	  	-- Novo evento termina depois do existente começar:
	  	and v_dataHTermino > dataInicio into v_horarioOcupado
	limit 1;

	if found then
		select nome from Apresentador where idApresentador = idApresentador_p into v_nomeApresentador;
		raise exception 'Existe um conflito de horários! Apresentador % estará ocupado das % até %! Criação de cronograma cancelada.', 
			v_nomeApresentador, v_horarioOcupado.dataInicio, (v_horarioOcupado.dataInicio + (v_horarioOcupado.duracaoMinutos * INTERVAL '1 minute'));
	end if;

	insert into Cronograma(duracaoMinutos, dataInicio, valorCache, idApresentador, idEvento)
		values (duracaoMinutos_p, dataInicio_p, valorCache_p, idApresentador_p, idEvento_p) returning idCronograma into v_idCronograma;

	raise notice 'Cronograma de ID % foi criado com sucesso!', v_idCronograma;

	return v_idCronograma;
	
end;
$$
language plpgsql;


create or replace function deletaCronograma(idCronograma_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Cronograma where idCronograma = idCronograma_p) then
		raise exception 'Cronograma selecionado não está registrado no sistema. Deleção cancelada.';
	end if;

	delete from Cronograma where idCronograma = idCronograma_p;

	raise notice 'Cronograma de ID % foi excluido com sucesso!', idCronograma_p;
	
end;
$$
language plpgsql;

------------------------------------------------------------------

create or replace function criaCliente(nome_p varchar, telefone_p varchar, endereco_p varchar, cpf_cnpj_p varchar, email_p varchar default '') returns integer as
$$
declare
	v_idCliente integer;
begin
	
	if (nome_p is null or nome_p = '') then
		raise exception 'É obrigatório o cliente possuir um nome definido! Cliente não foi criado.';
	end if;

	if (telefone_p is null or telefone_p = '') then
		raise exception 'É obrigatório o cliente possuir um telefone definido! Cliente não foi criado.';
	end if;

	if (cpf_cnpj_p is null or cpf_cnpj_p = '') then
		raise exception 'É obrigatório o cliente possuir um cpf ou cnpj definido! Cliente não foi criado.';
	end if;

	if exists(select 1 from Cliente where cpf_cnpj = cpf_cnpj_p) then
		raise exception 'Já existe um cliente com esse CPF/CNPJ! Cliente não foi criado.';
	end if;

	insert into Cliente(nome, telefone, email, endereco, cpf_cnpj)
		values (nome_p, telefone_p, email_p, endereco_p, cpf_cnpj_p) returning idCliente into v_idCliente;

	raise notice 'Cliente com ID % criado com sucesso.', v_idCliente;
	
	return v_idCliente;
	
end;
$$
language plpgsql;


-- não deleto cliente associado a Evento pois viola a constraint not null da tabela Evento
create or replace function deletaCliente(idCliente_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Cliente where idCliente = idCliente_p) then
		raise exception 'Cliente de iD % não está registrado no sistema!', idCliente_p;
	end if;

	if exists(select 1 from Evento where idCliente = idCliente_p) then
		raise exception 'Cliente a ser excluido está associado a um evento! Deleção cancelada.';
	end if;

	if exists(select 1 from Pagamento where idCliente = idCliente_p) then
		raise exception 'Cliente possui pagamentos registrados! Deleção cancelada.';
	end if;
	
	delete from Cliente where idCliente = idCliente_p;

	raise notice 'Cliente com ID % deletado com sucesso.', idCliente_p;
	
end;
$$
language plpgsql;

------------------------------------------------------------------

create or replace function criarLocalizacao(valorLocacao_p numeric, nome_p varchar, endereco_p varchar, capMaxima_p integer,
	area_p numeric, infraDisp_p text default '') returns integer as
$$
declare
	v_idLocalizacao integer;
begin

	if (valorLocacao_p <= 0 or valorLocacao_p is null) then
		raise exception 'Valor da locação deve ser um valor positivo não nulo! Localização não criada.';
	end if;

	if exists(select 1 from Localizacao where lower(trim(endereco)) = lower(trim(endereco_p))) then
		raise exception 'Já existe uma localização registrada no sistema com esse endereço! Localização não criada.';
	end if;

	if (capMaxima_p is null or capMaxima_p <= 0) then
		raise exception 'Capacidade máxima deve ser um valor positivo não nulo! Localização não criada.';
	end if;

	if (area_p is null or area_p <= 0) then
		raise exception 'Area da localização a ser cadastrada deve ser um valor positivo não nulo! Localização não criada.';
	end if;

	insert into Localizacao(valorLocacao, nome, endereco, capMaxima, area, infraDisp)
		values (valorLocacao_p, nome_p, endereco_p, capMaxima_p, area_p, infraDisp_p) returning idLocalizacao into v_idLocalizacao;

	return v_idLocalizacao;
end;
$$
language plpgsql;


create or replace function deletaLocalizacao(idLocalizacao_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Localizacao where idLocalizacao = idLocalizacao_p) then
		raise exception 'Localizacao com ID % não está registrada no sistema! Deleção cancelada.', idLocalizacao_p;
	end if;

	if exists(select 1 from Evento where idLocalizacao = idLocalizacao_p) then
		raise exception 'Localização está associada a um evento! Deleção cancelada.';
	end if;

	delete from Localizacao where idLocalizacao = idLocalizacao_p;

	raise notice 'Localizacao com ID % deletada com sucesso!', idLocalizacao_p;
	
end;
$$
language plpgsql;

----------------------------------------------------------------

create or replace function criaOrcamento(idFormaPagamento_p int, validade_p date, valorTotal_p numeric, idEvento_p integer, condicoes_p text default '',
	descricao_p text default '') returns integer as
$$
declare
	v_idOrcamento integer;
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p and status not in ('REALIZADO', 'CANCELADO')) then
		raise exception 'Não existe um evento registrado no banco com o ID % ou o mesmo já foi realizado/cancelado! Criação de orçamento cancelada.', idEvento_p;
	end if;

	if not exists(select 1 from FormaPagamento where idFormaPagamento_p = idFormaPagamento) then
		raise exception 'Forma de Pagamento não existe em no banco de dados. Criação de orçamento cancelada.';
	end if;

	if (validade_p < current_date or validade_p is null) then
		raise exception 'Validade não pode ser uma data anterior à de criação do orcamento ou nula! Criação de orçamento cancelada.';
	end if;

	if (valorTotal_p <= 0 or valorTotal_p is null) then
		raise exception 'Valor total deve ser um valor positivo não nulo! Criação de orçamento cancelada.';
	end if;

	if exists(select 1 from Orcamento where idEvento = idEvento_p) then
		raise exception 'Já existe um orçamento ativo para esse evento! Procure alterá-lo em vez de adicionar um novo!';
	end if;

	insert into Orcamento(idFormaPagamento, validade, valorTotal, condicoes, descricao, idEvento)
		values(idFormaPagamento_p, validade_p, valorTotal_p, condicoes_p, descricao_p, idEvento_p) returning idOrcamento into v_idOrcamento;

	raise notice 'Orcamento de ID % foi criado com sucesso!', v_idOrcamento;

	return v_idOrcamento;
	
end;
$$
language plpgsql;


-- Orçamento não pode ser alterado depois do primeiro pagamento ser feito (por questões de contrato).
create or replace function alteraOrcamento(idOrcamento_p integer, idFormaPagamento_p integer, validade_p date, valorTotal_p numeric)
	returns void as
$$
declare
begin

	if not exists(select 1 from Orcamento where idOrcamento = idOrcamento_p) then
		raise exception 'Orcamento de ID % não existe em no banco de dados. Alteração de orçamento cancelada.', idOrcamento_p;
	end if;

	if not exists(select 1 from FormaPagamento where idFormaPagamento_p = idFormaPagamento) then
		raise exception 'Forma de Pagamento selecionada não existe em no banco de dados. Alteração de orçamento cancelada.';
	end if;

	if (validade_p < current_date or validade_p is null) then
		raise exception 'Validade não pode ser uma data anterior à de criação do orcamento ou nula! Alteração de orçamento cancelada.';
	end if;

	if (valorTotal_p <= 0 or valorTotal_p is null) then
		raise exception 'Valor total deve ser um valor positivo não nulo! Alteração de orçamento cancelada.';
	end if;

	if exists (select 1 from Pagamento p join Orcamento o on o.idEvento = p.idEvento where o.idOrcamento = idOrcamento_p) then
		raise exception 'Já existem pagamentos atrelados à este orçamento! Por questões de contrato, o orçamento não pode ser alterado!';
	end if;

	update Orcamento set idFormaPagamento = idFormaPagamento_p, validade = validade_p, valorTotal = valorTotal_p
		where idOrcamento = idOrcamento_p;

	raise notice 'Atualização do Orcamento ID % feita com sucesso!', idOrcamento_p;
	
end;
$$
language plpgsql;

-----------------------------------------------------------------

-- outro cliente que não é dono do evento pode pagar
create or replace function criaPagamento(valorPago_p numeric, idFormaPagamento_p integer,
	idEvento_p integer, idCliente_p integer) returns integer as
$$
declare
	v_valorTotalOrcamento numeric(10,2);
	v_valorTotalPago numeric(10,2);
	v_idPagamento integer;
	v_validadeOrcamento date;
begin

	if not exists(select 1 from FormaPagamento where idFormaPagamento = idFormaPagamento_p) then
		raise exception 'Forma de pagamento selecionada não consta no sistema! Pagamento não criado.';
	end if;

	if not exists(select 1 from Evento where idEvento = idEvento_p and status not in ('CANCELADO', 'REALIZADO')) then
		raise exception 'Evento de ID % não consta no sistema ou já foi realizado/cancelado! Pagamento não criado.', idEvento_p;
	end if;

	if not exists(select 1 from Cliente where idCliente = idCliente_p) then
		raise exception 'Cliente de ID % não consta no sistema! Pagamento não criado.', idCliente_p;
	end if;

	if not exists(select 1 from Orcamento where idEvento = idEvento_p) then
		raise exception 'Ainda não há nenhum orçamento associado ao evento de ID %! Pagamento não criado.', idEvento_p;
	end if;

	if (valorPago_p <= 0 or valorPago_p is null) then
		raise exception 'Valor pago deve ser um valor positivo não nulo! Pagamento não criado.';
	end if;

	if not exists(select 1 from Pagamento where idEvento = idEvento_p) then
		update Evento set status = 'EM_PREPARACAO' where idEvento = idEvento_p and status = 'ORCAMENTO';
	end if;

	select validade from Orcamento where idEvento = idEvento_p into v_validadeOrcamento;

	if (current_date > v_validadeOrcamento) then
		raise exception 'Orçamento a ser pago venceu em %! Entrar em contato para renegociação!', v_validadeOrcamento;
	end if;
	

	select valorTotal from Orcamento where idEvento = idEvento_p into v_valorTotalOrcamento;

	select coalesce(sum(valorPago), 0) from Pagamento where idEvento = idEvento_p into v_valorTotalPago;

	if (valorPago_p + v_valorTotalPago > v_valorTotalOrcamento) then
		raise exception 'Valor pago pelo cliente é maior que o valor definido no orçamento do evento ID %. Pagamento não criado (informe ao cliente o valor restante a ser pago (R$ %))', idEvento_p, (v_valorTotalOrcamento - v_valorTotalPago);
	end if;

	insert into Pagamento(valorTotal, valorPago, idFormaPagamento, idEvento, idCliente)
		values(v_valorTotalOrcamento, valorPago_p, idFormaPagamento_p, idEvento_p, idCliente_p) returning idPagamento into v_idPagamento;

	raise notice 'Pagamento de ID % criado com sucesso!', v_idPagamento;

	return v_idPagamento;
end;
$$
language plpgsql;


create or replace function deletaPagamento(idPagamento_p integer) returns numeric as
$$
declare
	v_valorPagamentoDeletado numeric(10,2);
begin
	
	if not exists(select 1 from Pagamento where idPagamento = idPagamento_p) then
		raise exception 'Pagamento de ID % a ser deletado não consta no banco de dados!', idPagamento_p;
	end if;

	delete from Pagamento where idPagamento = idPagamento_p returning valorPago into v_valorPagamentoDeletado;

	raise notice 'Pagamento de ID % deletado com sucesso! Caso o valor tenha sido descontado da conta do cliente, o valor a ser estornado é de R$ %', idPagamento_p, v_valorPagamentoDeletado;

	return v_valorPagamentoDeletado;
	
end;
$$
language plpgsql;

--------------------------------------------------------

create or replace function criaParticipante(nome_p varchar, telefone_p varchar, email_p varchar default '') returns integer as
$$
declare
	v_idParticipante integer;
begin

	insert into Participante(nome, telefone, email) values (nome_p, telefone_p, email_p)
		returning idParticipante into v_idParticipante;

	raise notice 'Participante com ID % criado com sucesso!', v_idParticipante;

	return v_idParticipante;
	
end;
$$
language plpgsql;


create or replace function deletaParticipante(idParticipante_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Participante where idParticipante = idParticipante_p) then
		raise exception 'Participante com ID % não consta no sistema! Deleção cancelada.', idParticipante_p;
	end if;

	delete from Participante where idParticipante = idParticipante_p;

	raise notice 'Participante com ID % deletado com sucesso!', idParticipante_p;
	
end;
$$
language plpgsql;

-----------------------------------------------------

-- considero apenas as pessoas que compram o ingresso para verificar capMaxima (independente se a pessoa confirmou ou não)
create or replace function compraIngresso(idEvento_p integer, idParticipante_p integer) returns integer as
$$
declare
	v_idIngresso integer;
	v_qntdPessoas integer;
	v_numPart integer;
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p and status not in ('REALIZADO', 'CANCELADO', 'ORCAMENTO')) then
		raise exception 'Evento de ID % não consta no banco de dados ou já foi realizado, foi cancelado, ou está em orçamento!', idEvento_p;
	end if;

	if not exists(select 1 from Participante where idParticipante = idParticipante_p) then
		raise exception 'Participante de ID % não consta no banco de dados!', idParticipante_p;
	end if;


	select numParticipantes from Evento where idEvento = idEvento_p into v_numPart;

	select count(*) from Ingresso where idEvento = idEvento_p into v_qntdPessoas;

	if (v_qntdPessoas >= v_numPart) then
		raise exception 'Local já atingiu capacidade máxima! Compra de ingresso cancelada!';
	end if;

	insert into Ingresso(idEvento, idParticipante)
		values (idEvento_p, idParticipante_p) returning idIngresso into v_idIngresso;

	raise notice 'Ingresso de ID % criado com sucesso', v_idIngresso;

	return v_idIngresso;
	
end;
$$
language plpgsql;


create or replace function confirmaIngresso(idIngresso_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Ingresso where idIngresso = idIngresso_p and confirmacao = false) then
		raise exception 'Ingresso de ID % não consta no banco de dados ou já foi confirmado! Confirmação cancelada', idIngresso_p;
	end if;

	update Ingresso set confirmacao = true where idIngresso = idIngresso_p;

	raise notice 'Ingresso de ID % confirmado com sucesso', idIngresso_p;
	
end;
$$
language plpgsql;


create or replace function deletaIngresso(idIngresso_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Ingresso where idIngresso = idIngresso_p) then
		raise exception 'Ingresso de ID % não consta no banco de dados! Deleção cancelada', idIngresso_p;
	end if;

	if exists(select 1 from Ingresso i join Evento e on e.idEvento = i.idEvento
		where i.idIngresso = idIngresso_p and e.status = 'REALIZADO') then
		raise exception 'Evento já foi realizado! Ingresso não pode ser excluido.';
	end if;

	delete from Ingresso where idIngresso = idIngresso_p;

	raise notice 'Ingresso de ID % deletado com sucesso', idIngresso_p;
	
end;
$$
language plpgsql;

-----------------------------------------------------------------

create or replace function geraRelatorio() returns trigger as
$$
declare
	v_numParticipantes integer;
	v_idRelatorio integer;
begin
	
	select count(*) from Ingresso where idEvento = new.idEvento and confirmacao = true
		into v_numParticipantes;

	
		insert into Relatorio(numRealParticipantes, idEvento) 
			values (coalesce(v_numParticipantes, 0), new.idEvento) returning idRelatorio into v_idRelatorio;
		
		raise notice 'Relatório de ID % criado com sucesso! Ainda é necessário assinar o mesmo.', v_idRelatorio;

	return null;

end;
$$
language plpgsql;

create trigger trg_geraRelatorio
after update of status on Evento
for each row
when (old.status is distinct from new.status and new.status = 'REALIZADO')
execute function geraRelatorio();

create or replace function assinaRelatorio(idRelatorio_p int, avaliacaoGeral_p numeric, observacoes_p text default '') returns void as
$$
declare
begin

	if not exists(select 1 from Relatorio where idRelatorio = idRelatorio_p) then
		raise exception 'Relatório de ID % não consta no sistema! Assinatura de relatório cancelada.', idRelatorio_p;
	end if;

	if ((select avaliacaoGeral from Relatorio where idRelatorio = idRelatorio_p) is not null) then
		raise exception 'Relatório já assinado! Assinatura atual cancelada.';
	end if;

	if (avaliacaoGeral_p > 10 or avaliacaoGeral_p < 0 or avaliacaoGeral_p is null) then
		raise exception 'Avaliação geral deve ser um valor entre 0 e 10 não nulo! Assinatura de relatório cancelada.';
	end if;

	update Relatorio set avaliacaoGeral = avaliacaoGeral_p, observacoes = observacoes_p where idRelatorio = idRelatorio_p;

	raise notice 'Relatório de ID % assinado com sucesso!', idRelatorio_p;
	
end;
$$
language plpgsql;

-------------------------------------------------------------

create or replace function insereFotoRelatorio(nomeFoto_p varchar, imagem_p bytea, idRelatorio_p integer) returns integer as
$$
declare
	v_idFoto integer;
begin

	if not exists(select 1 from Relatorio where idRelatorio = idRelatorio_p) then
		raise exception 'Relatório de ID % não registrado no sistema!', idRelatorio_p;
	end if;

	if (nomeFoto_p is null or nomeFoto_p = '') then
		raise exception 'Nome da foto não pode ser vazio ou nulo! Anexação de foto em relatório cancelada.';
	end if;

	if (imagem_p is null) then
		raise exception 'Problema com foto inserida! Anexação de foto em relatório cancelada.';
	end if;

	insert into Foto(nomeFoto, imagem, idRelatorio)
		values (nomeFoto_p, imagem_p, idRelatorio_p) returning idFoto into v_idFoto;

	raise notice 'Foto com ID % anexada a relatório com sucesso!', v_idFoto;

	return v_idFoto;

end;
$$
language plpgsql;


create or replace function deletaFotoRelatorio(idFoto_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Foto where idFoto = idFoto_p) then
		raise exception 'Foto com ID % não está registrada no sistema! Deleção cancelada.', idFoto_p;
	end if;

	delete from Foto where idFoto = idFoto_p;

	raise notice 'Foto de ID % deletada com sucesso!', idFoto_p;

end;
$$
language plpgsql;

------------------------------------------------------------------

create or replace function criaFornecedor(nome_p varchar, telefone_p varchar, cnpj_p varchar, especialidade_p varchar, avalDesempenho_p numeric, 
	email_p varchar default '') returns integer as
$$
declare
	v_idFornecedor integer;
begin

	if exists(select 1 from Fornecedor where cnpj = cnpj_p) then
		raise exception 'Já existe um fornecedor com esse CNPJ! Criação cancelada.';
	end if;

	if (cnpj_p is null) then
		raise exception 'CNPJ deve ser um valor válido! Criação Cancelada';
	end if;

	if (avalDesempenho_p > 10 or avalDesempenho_p < 0) then
		raise exception 'Nota para desempenho do fornecedor deve ser entre 0 e 10! Criação cancelada.';
	end if;

	insert into Fornecedor(nome, telefone, cnpj, especialidade, email, avalDesempenho)
		values (nome_p, telefone_p, cnpj_p, especialidade_p, email_p, avalDesempenho_p) returning idFornecedor into v_idFornecedor;

	raise notice 'Fornecedor de ID % criado com sucesso!', v_idFornecedor;

	return v_idFornecedor;

end;
$$
language plpgsql;


create or replace function desativaFornecedor(idFornecedor_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Fornecedor where idFornecedor = idFornecedor_p and ativo) then
		raise exception 'Fornecedor de ID % não consta no sistema ou já foi desativado! Desativação cancelada.', idFornecedor_p;
	end if;

	if exists(select 1 
		from ItemServico itser join Evento e on itser.idEvento = e.idEvento 
		where idFornecedor = idFornecedor_p and e.status not in ('REALIZADO', 'CANCELADO')) then
			raise exception 'Fornecedor não pode ser desativado pois está associado à um evento ativo! Desativação cancelada.';
	end if;

	update Fornecedor set ativo = false where idFornecedor = idFornecedor_p;

	raise notice 'Fornecedor de ID % desativado com sucesso!', idFornecedor_p;
	
end;
$$
language plpgsql;

-------------------------------------------------------

create or replace function criaServico(unidMedida_p varchar, valorUnit_p numeric, idCategoriaServico_p int, descricao_p text default '') 
	returns integer as
$$
declare
	v_idServico integer;
begin

	if not exists(select 1 from CategoriaServico where idCategoriaServico = idCategoriaServico_p) then
		raise exception 'Não existe categoria serviço de ID % no banco! Cancelando criação.', idCategoriaServico_p;
	end if;

	if (valorUnit_p <= 0 or valorUnit_p is null) then
		raise exception 'Valor unitário deve ser um valor maior que zero!';
	end if;

	insert into Servico(unidMedida, valorUnit, idCategoriaServico, descricao)
		values (unidMedida_p, valorUnit_p, idCategoriaServico_p, descricao_p) returning idServico into v_idServico;

	raise notice 'Servico de ID % criado com sucesso!', v_idServico;

	return v_idServico;

end;
$$
language plpgsql;


create or replace function desativaServico(idServico_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from Servico where idServico = idServico_p and ativo) then
		raise exception 'Serviço de ID % não está registrado no sistema ou já foi desativado! Desativação cancelada.', idServico_p;
	end if;

	if exists(select 1 
		from ItemServico itser join Evento e on itser.idEvento = e.idEvento 
		where idServico = idServico_p and e.status not in ('REALIZADO', 'CANCELADO')) then
			raise exception 'Serviço não pode ser desativado pois está associado à um evento ativo! Desativação cancelada.';
	end if;

	update Servico set ativo = false where idServico = idServico_p;

	raise notice 'Serviço de ID % desativado com sucesso!', idServico_p;
	
end;
$$
language plpgsql;

-----------------------------------------------------------

create or replace function criaItemServico(quantContratada_p numeric, valorAcordado_p numeric, idServico_p integer,
	idFornecedor_p integer, idEvento_p integer) returns integer as
$$
declare
	v_idItemServico integer;
begin

	if not exists(select 1 from Evento where idEvento = idEvento_p and status not in ('REALIZADO', 'CANCELADO')) then
		raise exception 'Evento de ID % não está registrado no sistema ou já foi realizado/cancelado! Criação de item serviço cancelada.', idEvento_p;
	end if;

	if not exists(select 1 from Servico where idServico = idServico_p and ativo) then
		raise exception 'Servico de ID % não está registrado no sistema ou está desativado! Criação de item serviço cancelada.', idServico_p;
	end if;

	if not exists(select 1 from Fornecedor where idFornecedor = idFornecedor_p and ativo) then
		raise exception 'Fornecedor de ID % não está registrado no sistema ou está desativado! Criação de item serviço cancelada.', idFornecedor_p;
	end if;

	if (quantContratada_p <= 0 or quantContratada_p is null) then
		raise exception 'Quantidade contratada precisa ser um valor maior que 0! Criação cancelada.';
	end if;

	if (valorAcordado_p <= 0 or valorAcordado_p is null) then
		raise exception 'Valor acordado precisa ser um valor maior que 0! Criação cancelada.';
	end if;

	insert into ItemServico(quantContratada, valorAcordado, idServico, idFornecedor, idEvento)
		values (quantContratada_p, valorAcordado_p, idServico_p, idFornecedor_p, idEvento_p) returning idItemServico into v_idItemServico;

	raise notice 'Item servico de ID % criado com sucesso!', v_idItemServico;

	return v_idItemServico;
	
end;
$$
language plpgsql;


create or replace function deletaItemServico(idItemServico_p integer) returns void as
$$
declare
begin

	if not exists(select 1 from itemServico where idItemServico = idItemServico_p) then
		raise exception 'Não existe item serviço de ID % no banco! Cancelando deleção.', idItemServico_p;
	end if;

	if exists(select 1 from ItemServico itse join Evento e on e.idEvento = itse.idEvento
		where itse.idItemServico = idItemServico_p and e.status = 'REALIZADO') then
		raise exception 'Evento correspondente a esse item serviço já foi realizado! Cancelando deleção.';
	end if;

	delete from ItemServico where idItemServico = idItemServico_p;

	raise notice 'Item servico de ID % deletado com sucesso!', idItemServico_p;
	
end;
$$
language plpgsql;