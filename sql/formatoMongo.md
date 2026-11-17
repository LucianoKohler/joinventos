***Salvando aqui todas as formatações da tabela do banco em MongoDB***

# Cliente
```json
{
  "_id": "ObjectId(...)",
  "nome": "Cliente da Silva",
  "senha": "$3x$a2$etc...",
  "telefone": "11111111111",
  "email": "cliente@email.com",
  "endereco": "rua XXX, 123",
  "cpf_cnpj": "12345678901"
}
```

# Participante
```json
{
  "_id": "ObjectId(...)",
  "nome": "Participante da Silva",
  "senha": "$3x$a2$etc...",
  "telefone": "11111111111",
  "email": "participante@email.com"
}
```

# Fornecedores

```json
{
  "_id": "ObjectId(...)",
  "ativo": true,
  "nome": "Fornecedor XXX",
  "cnpj": "12345678000199",
  "telefone": "11111111111",
  "especialidade": "BUFFET",
  "email": "forneceror@buffet.com",
  "avalDesempenho": 9.5
}
```

# Apresentador

```json
{
  "_id": "ObjectId(...)",
  "nome": "Palestrante XXX",
  "telefone": "11111111111",
  "biografia": "Cara muito bom no que faz.",
  "email": "palestrante@palestra.com"
}
```

# Localizacao

```json
{
  "_id": "ObjectId(...)",
  "valorLocacao": 1500.00,
  "nome": "Local XXX",
  "endereco": "Rua da flor marrom, 500",
  "capMaxima": 300,
  "area": 450.5,
  "infraDisp": "Mesa, Cadeira..."
}
```

# Servicos
```json
{
  "_id": "ObjectId(...)",
  "unidMedida": "Hora",
  "ativo": true,
  "valorUnit": 200.00,
  "nomeCategoriaServico": "SONORIZACAO",
  "descricao": "Caixas de som, DJ, ..."
}
```

# Eventos (o garotão)
```json
{
  "_id": "ObjectId(...)",
  "nomeEvento": "Evento XXX",
  "idCategoriaEvento": "SEMINARIO",
  "dataInicio": "2026-12-10",
  "dataTermino": "2026-12-10",
  "horarioInicio": "08:00",
  "horarioTermino": "18:00",
  "valorIngresso": 50.00,
  "numParticipantes": 150,
  "status": "EM_PREPARACAO",
  "idCliente": "ObjectId(id_cliente)",
  "idLocalizacao": "ObjectId(id_localizacao)",
  "descricao": "Muita resenha e cerveja.",
  
  // ItemServico
  "servicos": [
    {
      "idServico": "ObjectId(...)",
      "nomeservico": "Aluguel de Projetor",
      "quantContratada": 1,
      "valorAcordado": 300.00,
      "status": "CONTRATADO"
    }
  ],

  // Cronograma
  "cronograma": [
    {
      "duracaoMinutos": 60,
      "dataInicio": "2026-12-10T09:00:00",
      "valorCache": 500.00,
      "nomeapresentador": "Palestrante XXX"
    }
  ],

  // Orcamento
  "orcamento": {
    "valorTotal": 2300.00,
    "validade": "2026-11-30",
    "condicoes": "50% de entrada",
    "descricao": "Orçamento inicial"
  },

  // Relatorio e Foto
  "relatorio": {
    "numRealParticipantes": 0,
    "avaliacaoGeral": null,
    "observacoes": "",
    "fotos": [
      {
        "nomeFoto": "fachada.jpg",
        "imagem": "BLOB"
      }
    ]
  },

  // Ingresso
  "ingressos": [
    {
      "idIngresso": "ObjectId(...)",
      "idParticipante": "ObjectId(id_participante)",
      "confirmacao": false
    }
  ]
}
```