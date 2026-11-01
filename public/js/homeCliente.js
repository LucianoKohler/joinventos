document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await Promise.all([
        carregarMeusEventosCriados(idCliente),
        carregarTodosEventos(idCliente)
    ]);
});

// QUERY 1: Eventos CRIADOS pelo cliente (Exibidos na div da esquerda: Futuros e Passados)
async function carregarMeusEventosCriados(idCliente) {
    const containerFuturos = document.getElementById("eventosFuturos");
    const containerPassados = document.getElementById("eventosPassados");

    if (!containerFuturos || !containerPassados) return;

    try {
        // Rota que retorna os eventos criados pelo organizador
        const resposta = await fetch(`http://localhost:3000/api/eventos/criados/${idCliente}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            const eventos = dados.eventos;

            containerFuturos.innerHTML = "";
            containerPassados.innerHTML = "";

            if (!eventos || eventos.length === 0) {
                containerFuturos.innerHTML = `<p class="sem-eventos">Você ainda não criou nenhum evento futuro.</p>`;
                containerPassados.innerHTML = `<p class="sem-eventos">Nenhum evento passado no seu histórico.</p>`;
                return;
            }

            let temFuturos = false;
            let temPassados = false;

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            eventos.forEach(evento => {
                const dataRaw = evento.data_evento || evento.datainicio;
                const dataEventoStr = dataRaw ? dataRaw.split('T')[0] : '';
                
                let dataFormatada = 'Data a definir';
                let dataEvento = new Date();

                if (dataEventoStr) {
                    const [ano, mes, dia] = dataEventoStr.split('-');
                    dataEvento = new Date(ano, mes - 1, dia);
                    dataFormatada = `${dia}/${mes}/${ano}`;
                }

                // Badge de status do evento (sem status de ingresso)
                const statusEventoBadge = evento.status ? `<span class="badge status-evento">${evento.status}</span>` : '';

                // Botão extra de relatório apenas para eventos PASSADOS criados pelo cliente
                let botaoRelatorioHTML = '';
                if (dataEvento < hoje) {
                    botaoRelatorioHTML = `<button onclick="gerarRelatorio(${evento.idevento})" class="btn-relatorio">Gerar Relatório</button>`;
                }

                const cardHTML = `
                    <div class="evento-card shadow-xl">
                        <div class="card-header">
                            <h3>${evento.nomeevento}</h3>
                            <hr>
                            ${statusEventoBadge}
                            <span class="badge data">${dataFormatada}</span>
                        </div>
                        <div class="card-body">
                            <p><i>${evento.descricao || 'Sem descrição'}</i></p>
                            <p><strong>Local:</strong> ${evento.local || 'A definir...'}</p>
                        </div>
                        <div class="card-footer">
                            <button onclick="verDetalhes(${evento.idevento})" class="btn-detalhes">Ver Evento</button>
                            ${botaoRelatorioHTML}
                        </div>
                    </div>
                `;

                if (dataEvento >= hoje) {
                    containerFuturos.innerHTML += cardHTML;
                    temFuturos = true;
                } else {
                    containerPassados.innerHTML += cardHTML;
                    temPassados = true;
                }
            });

            if (!temFuturos) containerFuturos.innerHTML = `<p class="sem-eventos">Você não tem próximos eventos agendados.</p>`;
            if (!temPassados) containerPassados.innerHTML = `<p class="sem-eventos">Você não possui histórico de eventos passados.</p>`;

        } else {
            console.error("Erro na busca de eventos criados:", dados.erro);
        }
    } catch (e) {
        console.error("Erro de conexão (eventos criados):", e);
    }
}

// QUERY 2: Todos os eventos do sistema (Exibidos na div da direita)
async function carregarTodosEventos(idCliente) {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch(`http://localhost:3000/api/eventos/todos/${idCliente}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            const eventos = dados.eventos;

            if (!eventos || eventos.length === 0) {
                mainContent.innerHTML = `<p class="sem-eventos">Nenhum evento cadastrado no sistema.</p>`;
                return;
            }

            mainContent.innerHTML = "";

            eventos.forEach(evento => {
                const dataRaw = evento.data_evento || evento.datainicio;
                const dataEventoStr = dataRaw ? dataRaw.split('T')[0] : '';
                let dataFormatada = 'Data a definir';

                if (dataEventoStr) {
                    const [ano, mes, dia] = dataEventoStr.split('-');
                    dataFormatada = `${dia}/${mes}/${ano}`;
                }

                const cardHTML = `
                    <div class="evento-card shadow-xl">
                        <div class="card-header">
                            <h3>${evento.nome_evento}</h3>
                            <hr>
                            <span class="badge data">${dataFormatada}</span>
                        </div>
                        <div class="card-body">
                            <p><i>${evento.descricao || 'Sem descrição'}</i></p>
                            <p><strong>Local:</strong> ${evento.local || 'A definir...'}</p>
                        </div>
                        <div class="card-footer">
                            <button onclick="verDetalhes(${evento.idevento})" class="btn-detalhes">Ver Evento</button>
                        </div>
                    </div>
                `;

                mainContent.innerHTML += cardHTML;
            });

        } else {
            console.error("Erro na busca de todos os eventos:", dados.erro);
        }
    } catch (e) {
        console.error("Erro de conexão (todos os eventos):", e);
    }
}

function verDetalhes(idEvento) {
    window.location.href = "./eventoCliente.html?idevento=" + idEvento;
}

function gerarRelatorio(idEvento) {
    // Redireciona ou abre a lógica de relatório para o evento passado
    window.location.href = "./relatorioEvento.html?idevento=" + idEvento;
}