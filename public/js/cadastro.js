
const radioParticipante = document.getElementById("participante");
const radioCliente = document.getElementById("cliente");
const endereco = document.getElementById("endereco");
const cpf = document.getElementById("cpf");

if(radioParticipante.checked){
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

// ROTAS

document.addEventListener("DOMContentLoaded", ()=> {
    const formCadastro = document.getElementById("formCadastro");

    if(formCadastro){
        formCadastro.addEventListener("submit", async (e) => {
            e.preventDefault(); // Não recarrega a página

            const nome = document.getElementById("nome").value;
            const senha = document.getElementById("senha").value;
            const email = document.getElementById("email").value;
            const telefone = document.getElementById("telefone").value;
            const cpf_cnpj = document.getElementById("cpf").value;

            let dadosUsuario;
            if(radioCliente.checked){
                dadosUsuario = {
                    nome: nome,
                    senha: senha,
                    email: email,
                    telefone: telefone,
                    cpf_cnpj: cpf_cnpj
                }
            }else{
                dadosUsuario = {
                    nome: nome,
                    senha: senha,
                    telefone: telefone,
                    email: email,
                }
            }

            try {
                let caminho = "participante"
                if(radioCliente.checked){caminho = "cliente"}
                const res = await fetch(`http://localhost:3000/api/users/cadastro/${caminho}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosUsuario)
                });

                const resultado = await res.json();
                if(res.ok){
                    alert(resultado.mensagem || 'Cadastro realizado!');
                    localStorage.setItem('token', resultado.token);
                    let caminho = resultado.tipo == 'cliente' ? 'Cliente' : 'Participante'
                    window.location.href = `./home${caminho}.html`
                }else{
                    alert("Erro ao cadastrar...");
                }
            } catch (e) {
                alert('Erro de conexão com o servidor:', e);
            }
        })
    }
});