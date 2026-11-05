document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await carregarLocalizacoes();
});

async function carregarLocalizacoes() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch('http://localhost:3000/api/localizacoes/');
        const dados = await resposta.json();

        if (resposta.ok) {
            const localizacoes = dados.localizacoes;

            if (!localizacoes || localizacoes.length === 0) {
                mainContent.innerHTML = `<p class="sem-localizacao">Nenhuma localização cadastrada no sistema.</p>`;
                return;
            }

            mainContent.innerHTML = "";

            localizacoes.forEach(loc => {
                const bannerHTML = `
                    <div class="localizacao-banner shadow-xl flex flex-col justify-between">
                        <div>
                            <h1>${loc.nome}</h1>
                            <hr>
                            <p><strong>Endereço:</strong> ${loc.endereco || 'Não informado'}</p>
                            <p><strong>Infraestrutura:</strong> ${loc.infradisp || 'Nenhuma'}</p>
                            <p><strong>Capacidade Máxima:</strong> ${loc.capmaxima} pessoas</p>
                        </div>
                        <button onclick="deletarLocalizacao(${loc.idlocalizacao})" class="btn-lixeira flex items-center justify-center" title="Excluir Localização">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                `;
                mainContent.innerHTML += bannerHTML;
            });

            lucide.createIcons();

        } else {
            console.error("Erro na busca de localizações:", dados.erro);
            mainContent.innerHTML = `<p class="sem-localizacao text-red-500">Erro ao carregar localizações.</p>`;
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        mainContent.innerHTML = `<p class="sem-localizacao text-red-500">Erro de conexão com o servidor.</p>`;
    }
}

async function deletarLocalizacao(idLocalizacao) {
    if (!confirm("Tem certeza de que deseja excluir esta localização?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/localizacoes/${idLocalizacao}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Localização excluída com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}