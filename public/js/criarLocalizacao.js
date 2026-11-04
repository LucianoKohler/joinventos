document.addEventListener("DOMContentLoaded", () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    const form = document.getElementById("form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dadosLocal = {
            valorLocacao: parseFloat(document.getElementById("valorLocacao").value),
            nome: document.getElementById("nome").value,
            endereco: document.getElementById("endereco").value,
            capMaxima: parseInt(document.getElementById("capMaxima").value),
            area: parseFloat(document.getElementById("area").value),
            infraDisp: document.getElementById("infraDisp").value
        };

        console.log(dadosLocal);

        try {
            const resposta = await fetch('http://localhost:3000/api/localizacoes/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosLocal)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem || 'Localização cadastrada com sucesso!');
                window.location.href = './localizacoes.html';
            } else {
                alert(`Erro: ${resultado.erro || resultado.mensagem}`);
            }

        } catch (err) {
            console.error("Erro de conexão:", err);
            alert("Erro de conexão com o servidor.");
        }
    });
});