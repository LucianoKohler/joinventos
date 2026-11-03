document.addEventListener("DOMContentLoaded", () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    const form = document.getElementById("formCriarServico");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dadosServico = {
            descricao: document.getElementById("descricao").value,
            unidMedida: document.getElementById("unidMedida").value,
            valorUnit: parseFloat(document.getElementById("valorUnit").value),
            idCategoriaServico: parseInt(document.getElementById("idCategoriaServico").value)
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/servicos/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosServico)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem || 'Serviço cadastrado com sucesso!');
                window.location.href = './servicos.html';
            } else {
                alert(`Erro: ${resultado.erro || resultado.mensagem}`);
            }

        } catch (err) {
            console.error("Erro de conexão:", err);
            alert("Erro de conexão com o servidor.");
        }
    });
});