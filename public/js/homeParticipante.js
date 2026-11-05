document.addEventListener("DOMContentLoaded", async () => {
    const idParticipante = localStorage.getItem('token');

    if (!idParticipante) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await Promise.all([
        carregaMeusEventos(idParticipante),
        carregaTodosEventos(idParticipante)
    ]);
});

async function carregaMeusEventos(idParticipante) {
    const futuros = document.getElementById("eventosFuturos");
    const passados = document.getElementById("eventosPassados");

    try {
        const resposta = await fetch(`http://localhost:3000/api/eventos/inscritos/${idParticipante}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            const eventos = dados.eventos;

            futuros.innerHTML = "";
            passados.innerHTML = "";

            if (!eventos || eventos.length === 0) {
                futuros.innerHTML = `<p class="sem-eventos">Você ainda não está inscrito em nenhum evento.</p>`;
                passados.innerHTML = `<p class="sem-eventos">Nenhum evento no histórico.</p>`;
                return;
            }

            let temFuturos = false;
            let temPassados = false;

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            eventos.forEach(evento => {
                const dataRaw = evento.datainicio;
                const dataEventoStr = dataRaw ? dataRaw.split('T')[0] : '';
                
                let dataFormatada = 'Data a definir';
                let dataEvento = new Date();

                if (dataEventoStr) {
                    const [ano, mes, dia] = dataEventoStr.split('-');
                    dataEvento = new Date(ano, mes - 1, dia);
                    dataFormatada = `${dia}/${mes}/${ano}`;
                }

                let statusBadge = '';
                if (evento.confirmacao === true) {
                    statusBadge = `<span class="badge confirmado">Confirmado</span>`;
                } else {
                    statusBadge = `<span class="badge pendente">Não confirmado</span>`;
                }

                const cardHTML = `
                    <div class="evento-card shadow-xl">
                        <div>
                            <h3>${evento.nome_evento}</h3>
                            <hr>
                            ${statusBadge}
                            <span class="badge data">${dataFormatada}</span>
                        </div>
                        <div>
                            <p><i>${evento.descricao || 'Sem descrição'}</i></p>
                            <p><strong>Local:</strong> ${evento.local || 'A definir...'}</p>
                        </div>
                        <div>
                            <button onclick="verDetalhes(${evento.idevento})" class="btn-detalhes">Ver Evento</button>
                        </div>
                    </div>
                `;

                if (dataEvento >= hoje) {
                    futuros.innerHTML += cardHTML;
                    temFuturos = true;
                } else {
                    passados.innerHTML += cardHTML;
                    temPassados = true;
                }
            });

            if (!temFuturos) futuros.innerHTML = `<p class="sem-eventos">Você não tem próximos eventos agendados.</p>`;
            if (!temPassados) passados.innerHTML = `<p class="sem-eventos">Você não possui histórico de eventos passados.</p>`;

        } else {
            console.error("Erro na busca de inscritos:", dados.erro);
        }
    } catch (e) {
        console.error("Erro de conexão (inscritos):", e);
    }
}

// QUERY 2: todos os eventos 
async function carregaTodosEventos(idParticipante) {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch(`http://localhost:3000/api/eventos/todos/${idParticipante}`);
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

                // Definição das 3 flags
                let statusBadge = '';
                if (!evento.idingresso) {
                    statusBadge = `<span class="badge nao-cadastrado">Não cadastrado</span>`;
                } else if (evento.confirmacao === true) {
                    statusBadge = `<span class="badge confirmado">Confirmado</span>`;
                } else {
                    statusBadge = `<span class="badge pendente">Não confirmado</span>`;
                }

                const cardHTML = `
                    <div class="evento-card shadow-xl">
                        <div>
                            <h3>${evento.nome_evento}</h3>
                            <hr>
                            ${statusBadge}
                            <span class="badge data">${dataFormatada}</span>
                        </div>
                        <div>
                            <p><i>${evento.descricao || 'Sem descrição'}</i></p>
                            <p><strong>Local:</strong> ${evento.local || 'A definir...'}</p>
                        </div>
                        <div>
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
    window.location.href = "./eventoParticipante.html?idevento=" + idEvento
}