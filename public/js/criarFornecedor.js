document.addEventListener("DOMContentLoaded", () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    const form = document.getElementById("formCriarFornecedor");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const aval = document.getElementById("avalDesempenho").value;

        const dadosFornecedor = {
            nome: document.getElementById("nome").value,
            telefone: document.getElementById("telefone").value,
            cnpj: document.getElementById("cnpj").value,
            especialidade: document.getElementById("especialidade").value,
            avalDesempenho: aval ? parseFloat(aval) : null,
            email: document.getElementById("email").value
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/fornecedores/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosFornecedor)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem || 'Fornecedor cadastrado com sucesso!');
                window.location.href = './fornecedores.html';
            } else {
                alert(`Erro: ${resultado.erro || resultado.mensagem}`);
            }

        } catch (err) {
            console.error("Erro de conexão:", err);
            alert("Erro de conexão com o servidor.");
        }
    });
});