// ROTAS
document.addEventListener("DOMContentLoaded", ()=> {
    const formLogin = document.getElementById("formLogin");

    if(formLogin){
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault(); // Não recarrega a página

            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            const data = { email, senha };

            try {
                const res = await fetch(`http://localhost:3000/api/users/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const resultado = await res.json();
                if(res.ok){
                    alert(`${resultado.mensagem || 'Login efetivado!'} Token: ${resultado.token}`);
                    localStorage.setItem('token', resultado.token); // "gera o token"
                    formLogin.reset();

                    let caminho = resultado.tipo == 'cliente' ? 'Cliente' : 'Participante';
                    window.location.href = `./home${caminho}.html`;
                }else{
                    alert(`Erro no login: ${resultado.mensagem}`);
                }
            } catch (e) {
                alert(`Erro de conexão com o servidor: ${e}`);
            }
        })
    }
});