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

            // Preenchimento dos dados na tela
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

            // Elementos do <aside>
            const divPassado = document.getElementById("evento-passado");
            const divFuturo = document.getElementById("evento-futuro");
            const divNaoSeu = document.getElementById("nao-seu-evento");
            const divCancelado = document.getElementById("evento-cancelado");

            // Função auxiliar para ocultar todos
            function ocultarTodasDivs() {
                if (divPassado) divPassado.style.display = "none";
                if (divFuturo) divFuturo.style.display = "none";
                if (divNaoSeu) divNaoSeu.style.display = "none";
                if (divCancelado) divCancelado.style.display = "none";
            }

            ocultarTodasDivs();

            // 1. Prioridade: Verificar se o evento foi cancelado
            const statusEvento = evento.status ? evento.status.toUpperCase() : '';
            if (statusEvento === 'CANCELADO') {
                if (divCancelado) divCancelado.style.display = "flex";
                return;
            }

            // 2. Verificar se o evento pertence ao cliente logado
            const idClienteLogado = Number(idCliente);
            const idClienteDono = Number(evento.idcliente);
            const ehMeuEvento = (idClienteDono === idClienteLogado);

            if (!ehMeuEvento) {
                // Div 3: O evento foi criado por outro usuário
                if (divNaoSeu) divNaoSeu.style.display = "flex";
            } else {
                // É meu evento, avaliamos se é passado ou futuro com base na data
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
                    // Div 1: Evento concluído (passado) -> Exibe botão de relatório
                    if (divPassado) divPassado.style.display = "flex";
                } else {
                    // Div 2: Evento futuro -> Exibe botão de cancelar evento
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

// Função chamada pelo botão de relatório
function gerarReloatorio() {
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idevento');
    window.location.href = `./relatorioEvento.html?idevento=${idEvento}`;
}

// Função chamada pelo botão de cancelar evento criado (usando a stored function cancelaEvento)
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

// Função auxiliar para formatar a data do padrão do banco para o padrão brasileiro
function formatarData(dataStr) {
    if (!dataStr) return 'A definir';
    const dataPartes = dataStr.split('T')[0].split('-');
    return `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
}