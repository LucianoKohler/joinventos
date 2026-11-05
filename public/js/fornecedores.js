document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await carregarFornecedores();
});

async function carregarFornecedores() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch('http://localhost:3000/api/fornecedores');
        const dados = await resposta.json();

        if (resposta.ok) {
            const fornecedores = dados.fornecedores;

            if (!fornecedores || fornecedores.length === 0) {
                mainContent.innerHTML = `<p class="sem-eventos">Nenhum fornecedor cadastrado no sistema.</p>`;
                return;
            }

            mainContent.innerHTML = "";

            fornecedores.forEach(forn => {
                console.log(forn);
                const statusTexto = forn.ativo ? 'Ativo' : 'Inativo';
                const statusClasse = forn.ativo ? 'verde' : 'vermelho';
                
                const   botaoInativar = forn.ativo 
                    ? `<button onclick="inativarFornecedor(${forn.idfornecedor})" class="btn-lixeira">
                           <i data-lucide="user-x"></i> Inativar
                       </button>`
                    : `<button onclick="reativarFornecedor(${forn.idfornecedor})" class="verde">
                           <i data-lucide="user-check" ></i> Reativar
                       </button>`

                const bannerHTML = `
                    <div class="localizacao-banner shadow-xl flex flex-col justify-between p-4 bg-white rounded-lg border border-gray-100">
                        <div>
                            <div class="flex justify-between items-start mb-1">
                                <h1>${forn.nome}</h1>
                                <span class="${statusClasse} text-xs px-1! py-0.5 rounded bg-gray-50 border">${statusTexto}</span>
                            </div>
                            <hr>
                            <p><strong>CNPJ:</strong> ${forn.cnpj}</p>
                            <p><strong>Telefone:</strong> ${forn.telefone}</p>
                            <p><strong>E-mail:</strong> ${forn.email || 'Não informado'}</p>
                            <p><strong>Especialidade:</strong> ${forn.especialidade || 'Não informada'}</p>
                            <p><strong>Avaliação:</strong> ${forn.avaldesempenho !== null ? forn.avaldesempenho : 'N/A'}/10</p>
                        </div>
                        <div class="flex justify-end">
                            ${botaoInativar}
                        </div>
                    </div>
                `;
                mainContent.innerHTML += bannerHTML;
            });

            // Atualiza os ícones do Lucide nos novos cards injetados
            lucide.createIcons();

        } else {
            console.error("Erro na busca de fornecedores:", dados.erro);
            mainContent.innerHTML = `<p class="sem-eventos">Erro ao carregar fornecedores.</p>`;
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        mainContent.innerHTML = `<p class="sem-eventos">Erro de conexão com o servidor.</p>`;
    }
}

async function inativarFornecedor(idFornecedor) {
    if (!confirm("Tem certeza de que deseja inativar este fornecedor?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/fornecedores/inativar/${idFornecedor}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Fornecedor inativado com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}

async function reativarFornecedor(idFornecedor) {
    if (!confirm("Tem certeza de que deseja reativar este fornecedor?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/fornecedores/reativar/${idFornecedor}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Fornecedor reativado com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}