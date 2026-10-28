document.addEventListener("DOMContentLoaded", async () => {
    const idParticipante = localStorage.getItem('token');

    if (!idParticipante) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    const containerFuturos = document.getElementById("eventosFuturos");
    const containerPassados = document.getElementById("eventosPassados");

    try {
        const resposta = await fetch(`http://localhost:3000/api/eventos/inscritos/${idParticipante}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            const eventos = dados.eventos;

            if (eventos.length === 0) {
                containerFuturos.innerHTML = `<p class="sem-eventos">Você ainda não está inscrito em nenhum evento.</p>`;
                containerPassados.innerHTML = `<p class="sem-eventos">Nenhum evento no histórico.</p>`;
                return;
            }

            containerFuturos.innerHTML = "";
            containerPassados.innerHTML = "";

            let temFuturos = false;
            let temPassados = false;

            // Reinicia o horário atual
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            eventos.forEach(evento => {
                // Tratamento das datas
                const dataEventoStr = evento.datainicio.split('T')[0];
                const [ano, mes, dia] = dataEventoStr.split('-');
                const dataEvento = new Date(ano, mes - 1, dia);

                const dataFormatada = dataEvento.toLocaleDateString('pt-BR');
                
                const statusBadge = evento.confirmado 
                    ? `Confirmado` 
                    : `Pendente`;

                const cardHTML = `
                    <div class="evento-card shadow-xl">
                        <div class="card-header">
                            <h3>${evento.nome_evento}</h3>
                            <hr>
                            <span class="card-status">${statusBadge} - ${dataFormatada}</span>
                        </div>
                        <div class="card-body">
                            <p><i>${evento.descricao || 'Sem descrição'}</i></p>
                            <p><strong>Local:</strong> ${evento.local || 'A definir...'}</p>
                        </div>
                        <div class="card-footer">
                            <button onclick="verDetalhes(${evento.idevento})" class="btn-detalhes">Ver Ingressos</button>
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

            if (!temFuturos) {
                containerFuturos.innerHTML = `<p class="sem-eventos">Você não tem próximos eventos agendados.</p>`;
            }
            if (!temPassados) {
                containerPassados.innerHTML = `<p class="sem-eventos">Você não possui histórico de eventos passados.</p>`;
            }

        } else {
            alert(`Erro: ${dados.erro}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Não foi possível carregar os seus eventos.");
    }
});

function verDetalhes(idEvento) {
    console.log("Clicou no evento ID:", idEvento);
}