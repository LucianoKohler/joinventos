INSERT INTO CategoriaEvento (nomeCategoria) VALUES 
('CASAMENTO'), 
('ANIVERSARIO'), 
('FORMATURA'), 
('SEMINARIO'), 
('WORKSHOP'), 
('CONGRESSO'), 
('CONFRATERNIZACAO'), 
('OUTRO');

INSERT INTO CategoriaServico (nomeCategoriaServico) VALUES 
('BUFFET'), 
('DECORACAO'), 
('SONORIZACAO'), 
('ILUMINACAO'), 
('FOTOGRAFIA'), 
('FILMAGEM'), 
('ANIMACAO'), 
('SEGURANCA'), 
('RECEPCIONISMO'), 
('BRINDE'), 
('OUTRO');

INSERT INTO FormaPagamento (nomeFormaPagamento) VALUES 
('DEBITO'), 
('CREDITO'), 
('DINHEIRO'), 
('PIX'), 
('BOLETO'), 
('CHEQUE'), 
('OUTRO');

INSERT INTO Localizacao (valorLocacao, nome, endereco, capMaxima, area, infraDisp) VALUES 
(5000.00, 'Espaço Garden Festas', 'Rua das Palmeiras, 1000 - Centro', 350, 600.50, 'Ar condicionado, mesas, cadeiras, palco modulado e gerador próprio.'),
(12000.00, 'Centro de Convenções Joinville', 'Av. Beira Rio, 500 - Saguaçu', 1500, 2500.00, 'Infraestrutura completa de som, projeção, Wi-Fi de alta velocidade e camarins.'),
(2500.00, 'Chácara Recanto Verde', 'Estrada Dona Francisca, km 12 - Pirabeiraba', 150, 1200.00, 'Área verde aberta, churrasqueira, piscina e cozinha equipada.');

-- Senha padrão para testes gerada com bcrypt (equivalente a "123456")
-- $2b$10$X... (hash seguro de exemplo)
INSERT INTO cliente (nome, senha, telefone, email, endereco, cpf_cnpj) VALUES 
('Ana Souza Eventos', '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h', '(47) 99111-2222', 'ana.cliente@email.com', 'Rua XV de Novembro, 200 - Centro', '12.345.678/0001-99'),
('Carlos Eduardo Silva', '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h', '(47) 99888-7766', 'carlos.cliente@email.com', 'Rua Visconde de Taunay, 550 - Bucarein', '98.765.432/0001-11');

INSERT INTO Fornecedor (ativo, nome, cnpj, telefone, especialidade, email, avalDesempenho) VALUES 
(true, 'Gastronomia & Sabor Ltda', '11.222.333/0001-44', '(47) 3433-1122', 'BUFFET', 'contato@gastronomiasabor.com', 9.5),
(true, 'Luz & Som Produções', '44.555.666/0001-77', '(47) 3422-9988', 'SONORIZACAO', 'comercial@luzesom.com', 9.0),
(true, 'Captura Moments Fotografia', '77.888.999/0001-22', '(47) 98877-6655', 'FOTOGRAFIA', 'foto@capturamoments.com', 9.8);

INSERT INTO Apresentador (nome, telefone, biografia, email) VALUES 
('Juliana Mendes', '(11) 97777-4444', 'Palestrante motivacional e mestre de cerimônias com mais de 10 anos de experiência em grandes congressos corporativos.', 'juliana.mendes@palestras.com'),
('Prof. Ricardo Antunes', '(41) 98822-3344', 'Doutor em Inovação Tecnológica e pesquisador de Inteligência Artificial aplicada aos negócios.', 'ricardo.antunes@academico.com');

INSERT INTO participante (nome, senha, telefone, email) VALUES 
('Mariana Lima', '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h', '(47) 97711-3344', 'mariana.participante@email.com'),
('Lucas Gabriel Rocha', '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h', '(47) 96655-2233', 'lucas.participante@email.com'),
('Beatriz Costa', '$2b$10$n9v05LwZtI8L4K5v6s7HvuQ6H1e2r3t4y5u6i7o8p9a0s1d2f3g4h', '(47) 95544-1122', 'beatriz.participante@email.com');

INSERT INTO Evento (nomeEvento, idCategoriaEvento, dataInicio, dataTermino, horarioInicio, horarioTermino, valorIngresso, numParticipantes, status, idCliente, idLocalizacao, descricao) VALUES 
('Seminário de Tecnologia e Inovação 2026', 4, '2026-07-15', '2026-07-15', '08:00:00', '18:00:00', 150.00, 200, 'CONFIRMADO', 1, 2, 'Um dia inteiro de palestras focadas nas tendências de tecnologia para o mercado corporativo.'),
('Workshop de Desenvolvimento Web Moderno', 5, '2026-08-10', '2026-08-10', '13:30:00', '19:00:00', 80.00, 50, 'EM_PREPARACAO', 1, 1, 'Mão na massa com arquitetura de aplicações web eficientes e seguras.'),
('Confraternização Anual de Fim de Ano', 7, '2026-12-20', '2026-12-20', '20:00:00', '03:00:00', 200.00, 120, 'ORCAMENTO', 2, 3, 'Festa com buffet completo e música ao vivo para fechar o ano com chave de ouro.');

INSERT INTO Servico (unidMedida, ativo, valorUnit, idCategoriaServico, descricao) VALUES 
('Pessoa', true, 75.00, 1, 'Serviço de buffet completo (entrada, prato principal e sobremesa).'),
('Hora', true, 350.00, 3, 'Locação e operação técnica de kit de sonorização e microfones sem fio.'),
('Unidade', true, 1200.00, 5, 'Cobertura fotográfica integral do evento com entrega de galeria digital.');

INSERT INTO ItemServico (status, quantContratada, valorAcordado, idServico, idFornecedor, idEvento) VALUES 
('CONFIRMADO', 200.00, 75.00, 1, 1, 1),
('CONFIRMADO', 10.00, 350.00, 2, 2, 1),
('CONTRATADO', 50.00, 80.00, 1, 1, 2);

INSERT INTO Orcamento (idFormaPagamento, validade, valorTotal, condicoes, descricao, idEvento) VALUES 
(4, '2026-06-30', 21500.00, '50% de entrada via PIX e saldo restante na semana do evento.', 'Orçamento detalhado incluindo locação do espaço e serviços terceirizados.', 1),
(5, '2026-07-30', 5200.00, 'Pagamento em boleto bancário parcelado em 2x.', 'Orçamento básico para o workshop técnico.', 2);

INSERT INTO Pagamento (dataPagamento, valorTotal, valorPago, idFormaPagamento, idEvento, idCliente) VALUES 
('2026-05-10 14:30:00', 21500.00, 10750.00, 4, 1, 1);

INSERT INTO Cronograma (duracaoMinutos, dataInicio, valorCache, idApresentador, idEvento) VALUES 
(120, '2026-07-15 09:00:00', 2500.00, 1, 1),
(180, '2026-07-15 14:00:00', 3000.00, 2, 1);

-- Ingressos vinculando os participantes aos eventos criados acima
INSERT INTO Ingresso (confirmacao, idEvento, idParticipante) VALUES 
(true, 1, 1),
(true, 1, 2), 
(false, 2, 1), -- Mariana Pendente no workshop
(true, 2, 3); 

INSERT INTO Relatorio (numRealParticipantes, avaliacaoGeral, observacoes, idEvento) VALUES 
(190, 9.4, 'Evento ocorreu dentro do horário previsto, alta satisfação do público com os palestrantes.', 1);