let idEventoCorrente = null;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    idEventoCorrente = params.get('idEvento') || params.get('idevento');

    if (!idEventoCorrente) {
        alert("Nenhum evento especificado.");
        window.location.href = './homeCliente.html';
        return;
    }

    await carregarDadosRelatorio();

    const form = document.getElementById("formAssinarRelatorio");
    form.addEventListener("submit", assinarRelatorioHandler);
});

async function carregarDadosRelatorio() {
    try {
        const resposta = await fetch(`http://localhost:3000/api/relatorios/evento/${idEventoCorrente}`);
        const resultado = await resposta.json();

        if (resposta.ok) {
            const { relatorio, fotos } = resultado;

            document.getElementById("idRelatorio").value = relatorio.idrelatorio;
            document.getElementById("avaliacaoGeral").value = relatorio.avaliacaogeral !== null ? relatorio.avaliacaogeral : '';
            document.getElementById("observacoes").value = relatorio.observacoes || '';
            document.getElementById("nomeEventoTitulo").textContent = `Evento ID: ${idEventoCorrente}`;

            const jaAssinado = relatorio.avaliacaogeral !== null;
            const statusEl = document.getElementById("statusRelatorioTexto");
            const mediaEl = document.getElementById("nota");
            const buttonSubmit = document.getElementById("btnSalvarAssinar");

            if (jaAssinado) {
                statusEl.textContent = "Assinado";
                statusEl.className = "text-green-600 font-bold";
                mediaEl.textContent = relatorio.avaliacaogeral;
                buttonSubmit.disabled = true;
                buttonSubmit.innerHTML = "Relatório já assinado";

            } else {
                statusEl.textContent = "Pendente de Assinatura";
                statusEl.className = "text-orange-500 font-bold";
                mediaEl.textContent = "Não avaliado";
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
        galeria.innerHTML = '<p id="semFotosMsg" class="text-sm text-gray-400 italic col-span-full py-6 text-center">Nenhuma foto cadastrada ainda.</p>';
        return;
    }

    galeria.innerHTML = '';
    fotos.forEach(foto => {
        const card = document.createElement("div");
        card.className = "imagem";
        card.innerHTML = `
            <img src="http://localhost:3000/api/relatorios/foto/${foto.idfoto}" alt="${foto.nomefoto || 'Foto'}" class="w-full h-24 object-cover rounded mb-1">
        `;
        galeria.appendChild(card);
    });
}

async function assinarRelatorioHandler(e) {
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