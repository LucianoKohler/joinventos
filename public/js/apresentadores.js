document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await carregarApresentadores();
});

async function carregarApresentadores() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch('http://localhost:3000/api/apresentadores');
        const dados = await resposta.json();

        if (resposta.ok) {
            const apresentadores = dados.apresentadores;

            if (!apresentadores || apresentadores.length === 0) {
                mainContent.innerHTML = `<p class="sem-eventos">Nenhum apresentador cadastrado no sistema.</p>`;
                return;
            }

            mainContent.innerHTML = "";

            apresentadores.forEach(apresentador => {
                const bannerHTML = `
                    <div class="localizacao-banner shadow-xl flex flex-col justify-between p-4 bg-white rounded-lg border border-gray-100">
                        <div>
                            <h3 class="font-bold text-lg mb-1" style="color: var(--main);">${apresentador.nome}</h3>
                            <hr class="mb-2">
                            <p class="text-sm mb-1"><strong>E-mail:</strong> ${apresentador.email || 'Não informado'}</p>
                            <p class="text-sm mb-6"><strong>Telefone:</strong> ${apresentador.telefone || 'Não informado'}</p>
                        </div>
                        <button onclick="deletarapresentador(${apresentador.idapresentador})" class="btn-lixeira">
                            <i data-lucide="trash-2" width="18px" height="18px"></i>
                        </button>
                    </div>
                `;
                mainContent.innerHTML += bannerHTML;
            });

            lucide.createIcons();
        } else {
            console.error("Erro na busca de apresentadores:", dados.erro);
            mainContent.innerHTML = `<p>Erro ao carregar apresentadores.</p>`;
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        mainContent.innerHTML = `<p>Erro de conexão com o servidor.</p>`;
    }
}

async function deletarApresentador(idApresentador) {
    // Confirmacao
    if (!confirm("Tem certeza de que deseja excluir este apresentador?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/apresentadores/${idApresentador}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Apresentador excluído com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}