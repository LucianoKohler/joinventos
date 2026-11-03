document.addEventListener("DOMContentLoaded", () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    const form = document.getElementById("formCriarApresentador");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dadosApresentador = {
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/apresentadores/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosApresentador)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem || 'Apresentador cadastrado com sucesso!');
                window.location.href = './apresentadores.html';
            } else {
                alert(`Erro: ${resultado.erro || resultado.mensagem}`);
            }

        } catch (err) {
            console.error("Erro de conexão:", err);
            alert("Erro de conexão com o servidor.");
        }
    });
});