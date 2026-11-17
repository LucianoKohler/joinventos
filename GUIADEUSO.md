Para rodar o código perfeitamente, é necessário seguir algumas sequências de passos:

# Instalando as biliotecas necessárias
- Abra um terminal (com Node.js instalado) na pasta raíz do projeto
- Rode o comando `npm i`
- Espero com que a pasta "node_modules" apareça e feche o terminal

# Configurando o Banco de dados
- Abra o MongoCompass e crie o banco "joinventos" (exatamente como escrito) na porta 27017
- Rode o comando `node reset.js` no terminal do projeto (vscode) para popular o banco

# Configurações finais
- Por fim, abra o terminal na pasta raíz novamente e rode `node server.js` para iniciar o servidor
- O site estará rodando em qualquer navegador por meio do link `localhost:3000`!!!