let idEvento = null;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    idEvento = params.get('idevento');

    if (!idEvento) {
        alert("Nenhum evento especificado.");
        window.location.href = './homeCliente.html';
        return;
    }

    await carregaRelatorio();

    const form = document.getElementById("formAssinarRelatorio");
    form.addEventListener("submit", assinaRelatorioAux);
});

async function carregaRelatorio() {
    try {
        const resposta = await fetch(`http://localhost:3000/api/relatorios/evento/${idEvento}`);
        const resultado = await resposta.json();

        if (resposta.ok) {
            const { relatorio, fotos } = resultado;

            document.getElementById("idRelatorio").value = relatorio.idrelatorio;
            document.getElementById("avaliacaoGeral").value = relatorio.avaliacaogeral != null ? relatorio.avaliacaogeral : '';
            document.getElementById("observacoes").value = relatorio.observacoes || '';
            document.getElementById("nomeEventoTitulo").textContent = `Evento ID: ${idEvento}`;

            const jaAssinado = relatorio.avaliacaogeral != null;
            const status = document.getElementById("statusRelatorioTexto");
            const nota = document.getElementById("nota");
            const submit = document.getElementById("btnSalvarAssinar");

            if (jaAssinado) {
                status.textContent = "Assinado";
                status.className = "text-green-600 font-bold";
                nota.textContent = relatorio.avaliacaogeral;
                submit.disabled = true;
                submit.innerHTML = "Relatório já assinado";

            } else {
                status.textContent = "Não assinado";
                status.className = "text-orange-500 font-bold";
                nota.textContent = "Não avaliado";
            }

            renderizarGaleria(fotos);
            lucide.createIcons();
        } else {
            alert(resultado.erro || "Erro ao carregar relatório.");
        }
    } catch (err) {
        console.error("Erro de conexão:", err);
        alert("Erro de conexão ao buscar o relatório.");
    }
}

function renderizarGaleria(fotos) {
    const galeria = document.getElementById("galeriaFotos");

    if (!fotos || fotos.length === 0) {
        galeria.innerHTML = '<p id="semFotosMsg" class="text-gray-400 italic text-center">Nenhuma foto cadastrada ainda.</p>';
        return;
    }

    galeria.innerHTML = '';
    fotos.forEach(foto => {
        const card = document.createElement("div");
        card.className = "imagem";
        card.innerHTML = `
            <img src="http://localhost:3000/api/relatorios/foto/${foto.idfoto}">
        `;
        galeria.appendChild(card);
    });
}

async function assinaRelatorioAux(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("idRelatorio", document.getElementById("idRelatorio").value);
    formData.append("avaliacaoGeral", document.getElementById("avaliacaoGeral").value);
    formData.append("observacoes", document.getElementById("observacoes").value);

    const inputFotos = document.getElementById("fotosInput");
    for (let i = 0; i < inputFotos.files.length; i++) {
        formData.append("fotos", inputFotos.files[i]);
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/relatorios/assinar', {
            method: 'POST',
            body: formData
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert(resultado.mensagem);
            window.location.reload();
        } else {
            alert(`Erro ao assinar: ${resultado.erro}`);
        }
    } catch (err) {
        console.error("Erro ao enviar formulário:", err);
        alert("Erro de conexão com o servidor.");
    }
}