document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("formCadastro");
    const radioParticipante = document.getElementById("participante");
    const radioCliente = document.getElementById("cliente");
    const endereco = document.getElementById("endereco");
    const cpf = document.getElementById("cpf");

    if (radioParticipante.checked) {
        endereco.disabled = true;
        cpf.disabled = true;
    }

    radioParticipante.addEventListener("click", () => {
        endereco.disabled = true;
        cpf.disabled = true;
    });

    radioCliente.addEventListener("click", () => {
        endereco.disabled = false;
        cpf.disabled = false;
    });

    if (formCadastro) {
        formCadastro.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nome = document.getElementById("nome").value.trim();
            const senha = document.getElementById("senha").value;
            const telefone = document.getElementById("telefone").value.trim();
            const email = document.getElementById("email").value.trim();
            const enderecoVal = document.getElementById("endereco").value.trim();
            const cpf_cnpjVal = document.getElementById("cpf").value.trim();

            // Validaçao

            if (!nome || !senha || !email) {
                alert("Preencha todos os campos obrigatórios.");
                return;
            }

            if (senha.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                return;
            }

            // Regex complicado de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Por favor, insira um e-mail válido.");
                return;
            }

            // Regex complicado de telefone
            const regexTelefone = /^(\(?\d{2}\)?\s?)?(\d{4,5})\-?(\d{4})$/;
            const telefoneFormatado = telefone.replace(/\D/g, '');

            if (!regexTelefone.test(telefone) || (telefoneFormatado.length !== 10 && telefoneFormatado.length !== 11)) {
                alert("Telefone inválido. Digite um número válido com DDD e sem o código do país");
                return;
            }

            let dadosUsuario;
            if (radioCliente.checked) {
                if (!enderecoVal) {
                    alert("O endereço é obrigatório para clientes.");
                    return;
                }

                const regexCPFFormatado = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
                const regexCNPJFormatado = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
                const regexApenasNumeros = /^\d+$/;


                const ehValido = 
                    regexApenasNumeros.test(cpf_cnpjVal) || 
                    regexCPFFormatado.test(cpf_cnpjVal) || 
                    regexCNPJFormatado.test(cpf_cnpjVal);

                if (!ehValido) {
                    alert("CPF ou CNPJ inválido. Digite apenas números ou use o formato correto de documento");
                    return;
                }

                const cpfFormatado = cpf_cnpjVal.replace(/\D/g, '');
                
                if (cpfFormatado.length !== 11 && cpfFormatado.length !== 14) {
                    alert("O documento deve ser um CPF (11 dígitos) ou um CNPJ (14 dígitos) válido.");
                    return;
                }

                dadosUsuario = {
                    nome: nome,
                    senha: senha,
                    telefone: telefoneFormatado,
                    email: email,
                    endereco: enderecoVal,
                    cpf_cnpj: cpfFormatado
                };
            } else {
                dadosUsuario = {
                    nome: nome,
                    senha: senha,
                    telefone: telefoneFormatado,
                    email: email
                };
            }

            try {
                let caminho = "participante";
                if (radioCliente.checked) { caminho = "cliente"; }
                
                const res = await fetch(`http://localhost:3000/api/users/cadastro/${caminho}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosUsuario)
                });

                const resultado = await res.json();
                if (res.ok) {
                    alert(resultado.mensagem || 'Cadastro realizado!');
                    localStorage.setItem('token', resultado.token);
                    let tipoDestino = resultado.tipo == 'cliente' ? 'Cliente' : 'Participante';
                    window.location.href = `./home${tipoDestino}.html`;
                } else {
                    alert(`Erro ao cadastrar: ${resultado.detalhe || 'Tente novamente.'}`);
                }
            } catch (e) {
                console.error("Erro de conexão:", e);
                alert('Erro de conexão com o servidor.');
            }
        });
    }
});

