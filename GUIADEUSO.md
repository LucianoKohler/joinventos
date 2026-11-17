Para rodar o código perfeitamente, é necessário seguir algumas sequências de passos:

# Instalando as biliotecas necessárias
- Abra um terminal (com Node.js instalado) na pasta raíz do projeto
- Rode o comando `npm i`
- Espero com que a pasta "node_modules" apareça e feche o terminal

# Configurando o Banco de dados
- Abra o PGAdmin e crie o banco "joinventos" (exatamente como escrito)
- Rode o arquivo `schema.sql` e o arquivo `dados.sql` na query tool do banco criado
- Abra, agora na pasta do projeto, o arquivo `db.js` e altera as informações do pool para os dados pertinentes do banco (normalemnte o user e a password mudam de versão para versão)

# Configurações finais
- Por fim, abra o terminal na pasta raíz novamente e rode `node server.js` para iniciar o servidor
- O site estará rodando em qualquer navegador por meio do link `localhost:3000`!!!