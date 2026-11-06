document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idevento');
    const idCliente = localStorage.getItem('token');

    if (!idEvento) {
        alert("ID do evento não informado!");
        window.location.href = './homeCliente.html';
        return;
    }

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:3000/api/eventos/${idEvento}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            const evento = dados.evento;

            document.getElementById("nomeEvento").innerText = evento.nome_evento;
            document.getElementById("categoriaEvento").innerText = evento.categoria || 'Geral';
            document.getElementById("descricaoEvento").innerText = evento.descricao || 'Nenhuma descrição informada.';
            document.getElementById("dataInicio").innerText = formatarData(evento.datainicio);
            document.getElementById("dataTermino").innerText = formatarData(evento.datatermino);
            document.getElementById("horarioInicio").innerText = evento.horarioinicio || '';
            document.getElementById("horarioTermino").innerText = evento.horariotermino || '';
            document.getElementById("nomeLocal").innerText = evento.nome_local || 'Local a definir';
            document.getElementById("enderecoLocal").innerText = evento.endereco_local || '';
            document.getElementById("infraLocal").innerText = evento.infradisp || 'Não informada';
            document.getElementById("valorIngresso").innerText = `R$ ${Number(evento.valoringresso).toFixed(2)}`;
            document.getElementById("statusEvento").innerText = evento.status;
            document.getElementById("nomeOrganizador").innerText = evento.nome_cliente || 'Organização Interna';

            const containerServicos = document.getElementById("listaServicos");
            if (evento.servicos && evento.servicos.length > 0) {
                containerServicos.innerHTML = evento.servicos.map(serv => `
                    <div>
                        <b>${serv.nomeservico || 'Serviço'}</b>
                        <p>Qtd: ${serv.quantcontratada} | Valor: R$ ${Number(serv.valoracordado).toFixed(2)}</p>
                    </div>
                `).join('');
            } else {
                containerServicos.innerHTML = `<p class="italic text-gray-500">Nenhum serviço informado.</p>`;
            }

            const containerCronograma = document.getElementById("listaCronograma");
            if (evento.cronograma && evento.cronograma.length > 0) {
                containerCronograma.innerHTML = evento.cronograma.map(cron => `
                    <div>
                        <b>Atividade (Duração: ${cron.duracaominutos} min)</b>
                        ${cron.nomeapresentador ? `<p>Apresentador: ${cron.nomeapresentador}</p>` : ''}
                        <p>Início: ${formatarData(cron.datainicio)}</p>
                    </div>
                `).join('');
            } else {
                containerCronograma.innerHTML = `<p class="italic text-gray-500">Nenhum cronograma cadastrado.</p>`;
            }

            const divPassado = document.getElementById("evento-passado");
            const divFuturo = document.getElementById("evento-futuro");
            const divNaoAutor = document.getElementById("nao-seu-evento");
            const divCancelado = document.getElementById("evento-cancelado");

            function ocultar() {
                if (divPassado) divPassado.style.display = "none";
                if (divFuturo) divFuturo.style.display = "none";
                if (divNaoAutor) divNaoAutor.style.display = "none";
                if (divCancelado) divCancelado.style.display = "none";
            }

            ocultar();

            const statusEvento = evento.status ? evento.status.toUpperCase() : '';
            if (statusEvento == 'CANCELADO') {
                if (divCancelado) divCancelado.style.display = "flex";
                return;
            }

            const autor = (idCliente == evento.idcliente);

            if (!autor) {
                if (divNaoAutor) divNaoAutor.style.display = "flex";
            } else {
                const dataRaw = evento.datainicio;
                const dataEventoStr = dataRaw ? dataRaw.split('T')[0] : '';
                
                let dataEvento = new Date();
                if (dataEventoStr) {
                    const [ano, mes, dia] = dataEventoStr.split('-');
                    dataEvento = new Date(ano, mes - 1, dia);
                }

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                if (dataEvento < hoje) { 
                    if (divPassado) divPassado.style.display = "flex";
                } else { 
                    if (divFuturo) divFuturo.style.display = "flex";
                }
            }

        } else {
            alert(`Erro: ${dados.erro}`);
            window.location.href = './homeCliente.html';
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Não foi possível carregar as informações do evento.");
    }
});

function gerarRelatorio() {
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idevento');
    window.location.href = `./relatorioEvento.html?idevento=${idEvento}`;
}

async function cancelarEvento() {
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idevento');

    if (!confirm("Tem certeza de que deseja cancelar este evento?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/eventos/cancelar-evento/${idEvento}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Evento cancelado com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}

function formatarData(dataStr) {
    if (!dataStr) return 'A definir';
    const dataPartes = dataStr.split('T')[0].split('-');
    return `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
}