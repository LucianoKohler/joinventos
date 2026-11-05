document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await carregaEventos();
});

async function confirmarEvento(idEvento) {
    if (!confirm("Tem certeza que deseja confirmar este evento?")) {
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/eventos/confirmar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idEvento: parseInt(idEvento) })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert(resultado.mensagem);
            window.location.reload();
        } else {
            alert(`Erro ao confirmar: ${resultado.erro}`);
        }
    } catch (err) {
        console.error("Erro de conexão:", err);
        alert("Erro de conexão ao tentar confirmar o evento.");
    }
}

async function carregaEventos() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    try {
        const resposta = await fetch('http://localhost:3000/api/eventos/todos');
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

                const status = (evento.status || '').trim().toLowerCase();
                const jaConfirmado = status === 'confirmado';
                const jaCancelado = status === 'cancelado';

                const confirmarDisabled = (jaConfirmado || jaCancelado) ? 'disabled opacity-50 cursor-not-allowed' : '';
                const cancelarDisabled = jaCancelado ? 'disabled opacity-50 cursor-not-allowed' : '';

                const textoConfirmar = jaConfirmado ? 'Evento Confirmado' : 'Confirmar Evento';
                const textoCancelar = jaCancelado ? 'Evento Cancelado' : 'Cancelar Evento';

                const cardHTML = `
                    <div class="evento-card shadow-xl">
                        <div>
                            <h3>${evento.nome_evento}</h3>
                            <hr>
                            <span class="badge data">${dataFormatada}</span>
                            <span class="badge status">Status: ${evento.status || 'Orçamento'}</span>
                        </div>
                        <div>
                            <p><i>${evento.descricao || 'Sem descrição'}</i></p>
                            <p><strong>Local:</strong> ${evento.local || 'A definir...'}</p>
                        </div>
                        <div>
                            <button onclick="confirmarEvento(${evento.idevento})" class="w-[95%]! verde" ${confirmarDisabled}>${textoConfirmar}</button>
                            <button onclick="cancelarEvento(${evento.idevento})" class="w-[95%]! vermelho" ${cancelarDisabled}>${textoCancelar}</button>
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

async function cancelarEvento(idEvento) {

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
