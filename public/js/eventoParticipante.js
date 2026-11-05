let temIngresso = null;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idevento');
    const idParticipante = localStorage.getItem('token');

    if (!idEvento) {
        alert("ID do evento não informado!");
        window.location.href = './homeParticipante.html';
        return;
    }

    try {
        const url = `http://localhost:3000/api/eventos/${idEvento}?idparticipante=${idParticipante}`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (resposta.ok) {
            const evento = dados.evento;
            temIngresso = evento.idingresso || null; // Null se não tem ou o valor do id do ingresso se tem

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

            const divCadastrado = document.getElementById("cadastrado");
            const divNaoCadastrado = document.getElementById("nao-cadastrado");
            const btnConfirmar = document.getElementById("confirmar");
            const btnCancelar = document.getElementById("cancelar");

            const estaCadastrado = Boolean(temIngresso);
            const estaConfirmado = evento.confirmacao == true;

            if (estaCadastrado) {
                if (divCadastrado) divCadastrado.style.display = "flex";
                if (divNaoCadastrado) divNaoCadastrado.style.display = "none";

                if (estaConfirmado && btnConfirmar) {
                    btnCancelar.style.display = "none";
                    btnConfirmar.disabled = true;
                    btnConfirmar.innerText = "Presença Confirmada";
                }
            } else {
                if (divCadastrado) divCadastrado.style.display = "none";
                if (divNaoCadastrado) divNaoCadastrado.style.display = "flex";
            }

        } else {
            alert(`Erro: ${dados.erro}`);
            window.location.href = './homeParticipante.html';
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Não foi possível carregar as informações do evento.");
    }
});

async function entrarEvento(){
    const params = new URLSearchParams(window.location.search);
    const idevento = params.get('idevento');
    const idparticipante = localStorage.getItem('token');
    const data = { idevento, idparticipante };

    try {
        const res = await fetch(`http://localhost:3000/api/eventos/entrarEvento/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resultado = await res.json();
        if(res.ok){
            alert(`${resultado.mensagem || 'Entrou no evento'}`);
            window.location.reload();
        }else{
            alert(`Erro ao entrar: ${resultado.mensagem}`);
        }
    } catch (e) {
        alert(`Erro de conexão com o servidor: ${e}`);
    }
}

async function confirmarPresenca() {
    try {
        const res = await fetch(`http://localhost:3000/api/eventos/confirmar/${temIngresso}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Presença confirmada com sucesso!');
            window.location.reload();
        } else {
            alert(`Erro: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro de conexão com o servidor.");
    }
}

async function cancelarIngresso() {
    if (!confirm("Tem certeza de que deseja cancelar sua inscrição neste evento?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/eventos/cancelar/${temIngresso}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await res.json();
        
        if (res.ok) {
            alert(resultado.mensagem || 'Ingresso cancelado com sucesso!');
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