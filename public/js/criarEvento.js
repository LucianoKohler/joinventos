document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    // Carrega os selects do banco de dados em paralelo
    await Promise.all([
        carregarCategorias(),
        carregarLocalizacoes()
    ]);

    const form = document.getElementById("formCriarEvento");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dadosEvento = {
            nomeEvento: document.getElementById("nomeEvento").value,
            idCategoriaEvento: parseInt(document.getElementById("idCategoriaEvento").value),
            dataInicio: document.getElementById("dataInicio").value,
            dataTermino: document.getElementById("dataTermino").value,
            horarioInicio: document.getElementById("horarioInicio").value,
            horarioTermino: document.getElementById("horarioTermino").value,
            valorIngresso: parseFloat(document.getElementById("valorIngresso").value),
            numParticipantes: parseInt(document.getElementById("numParticipantes").value),
            idCliente: parseInt(idCliente),
            idLocalizacao: parseInt(document.getElementById("idLocalizacao").value),
            descricao: document.getElementById("descricao").value
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/eventos/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosEvento)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem || 'Evento criado com sucesso!');
                window.location.href = './homeCliente.html';
            } else {
                alert(`Erro ao criar evento: ${resultado.erro}`);
            }

        } catch (err) {
            console.error("Erro de conexão:", err);
            alert("Erro de conexão com o servidor.");
        }
    });
});

async function carregarCategorias() {
    try {
        const res = await fetch('http://localhost:3000/api/eventos/categorias/todas');
        const data = await res.json();
        const select = document.getElementById("idCategoriaEvento");

        if (res.ok && data.categorias) {
            data.categorias.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat.idcategoriaevento;
                opt.textContent = cat.nomecategoria;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar categorias:", e);
    }
}

async function carregarLocalizacoes() {
    try {
        const res = await fetch('http://localhost:3000/api/eventos/localizacoes/todas');
        const data = await res.json();
        const select = document.getElementById("idLocalizacao");

        if (res.ok && data.localizacoes) {
            data.localizacoes.forEach(loc => {
                const opt = document.createElement("option");
                opt.value = loc.idlocalizacao;
                opt.textContent = `${loc.nome} (Capacidade máxima: ${loc.capmaxima})`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar localizações:", e);
    }
}