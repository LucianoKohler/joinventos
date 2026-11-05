document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await carregarServicos();
});

async function carregarServicos() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch('http://localhost:3000/api/servicos');
        const dados = await resposta.json();

        if (resposta.ok) {
            const servicos = dados.servicos;

            if (!servicos || servicos.length === 0) {
                mainContent.innerHTML = `<p class="sem-eventos">Nenhum serviço cadastrado no sistema.</p>`;
                return;
            }

            mainContent.innerHTML = "";

            servicos.forEach(serv => {
                console.log(serv);
                const bannerHTML = `
                    <div class="localizacao-banner">
                        <div>
                            <h1>${serv.descricao || 'Serviço sem descrição'}</h1>
                            <hr>
                            <p><strong>Unidade de Medida:</strong> ${serv.unidmedida}</p>
                            <p><strong>Valor Unitário:</strong> R$ ${Number(serv.valorunit).toFixed(2)}</p>
                            <p><strong>Categoria:</strong> ${serv.nomecategoriaservico || 'Não informado'}</p>
                        </div>
                        <button onclick="deletarServico(${serv.idservico})" class="btn-lixeira" title="Excluir Serviço">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                `;
                mainContent.innerHTML += bannerHTML;
            });

            lucide.createIcons();

        } else {
            console.error("Erro na busca de serviços:", dados.erro);
            mainContent.innerHTML = `<p class="sem-eventos text-red-500">Erro ao carregar serviços.</p>`;
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        mainContent.innerHTML = `<p class="sem-eventos text-red-500">Erro de conexão com o servidor.</p>`;
    }
}

async function deletarServico(idServico) {
    if (!confirm("Tem certeza de que deseja excluir este serviço?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/servicos/${idServico}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Serviço excluído com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}