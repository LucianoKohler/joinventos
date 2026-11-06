let passo = 1;
let contadorCronograma = 0;

// Esse é parrudo

let dados = {
    dadosIniciais: {},
    servicos: [],
    cronograma: [],
    orcamentoInicial: null
};

let servicos = [];
let fornecedores = [];
let apresentadores = [];

document.addEventListener("DOMContentLoaded", async () => {
    const idCliente = localStorage.getItem('token');

    if (!idCliente) {
        alert("Sessão expirada ou acesso negado. Faça login novamente.");
        window.location.href = './login.html';
        return;
    }

    await carregaDados();
    configuraTela();
});

async function carregaDados() {
    try {
        const [resCat, resLoc, resServ, resForn, resApres] = await Promise.all([
            fetch('http://localhost:3000/api/eventos/categorias/todas').catch(() => ({ ok: false })),
            fetch('http://localhost:3000/api/localizacoes').catch(() => ({ ok: false })),
            fetch('http://localhost:3000/api/servicos').catch(() => ({ ok: false })),
            fetch('http://localhost:3000/api/fornecedores').catch(() => ({ ok: false })),
            fetch('http://localhost:3000/api/apresentadores').catch(() => ({ ok: false }))
        ]);

        // Categorias
        if (resCat.ok) {
            const dataCat = await resCat.json();
            const selectCat = document.getElementById("idCategoriaEvento");
            (dataCat.categorias || []).forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.idcategoriaevento;
                opt.textContent = c.nomecategoria;
                selectCat.appendChild(opt);
            });
        }

        // Localizações
        if (resLoc.ok) {
            const dataLoc = await resLoc.json();
            const selectLoc = document.getElementById("idLocalizacao");
            (dataLoc.localizacoes || []).forEach(l => {
                const opt = document.createElement("option");
                opt.value = l.idlocalizacao;
                opt.textContent = `${l.nome} (Cap: ${l.capmaxima})`;
                selectLoc.appendChild(opt);
            });
        }

        // Serviços
        if (resServ.ok) {
            const dataServ = await resServ.json();
            servicos = dataServ.servicos || [];
        }

        // Fornecedores
        if (resForn.ok) {
            const dataForn = await resForn.json(); // Linha abaixo remove fornecedores inativos
            fornecedores = (dataForn.fornecedores || []).filter(f => f.ativo !== false);
        }

        // Apresentadores
        if (resApres.ok) {
            const dataApres = await resApres.json();
            apresentadores = dataApres.apresentadores || [];
        }

    } catch (e) {
        console.error("Erro ao carregar dados auxiliares:", e);
    }
}

function configuraTela() {
    const btnAvancar = document.getElementById("btnAvancar");
    const btnVoltar = document.getElementById("btnVoltar");
    const btnAddServico = document.getElementById("btnAddServico");
    const btnAddCronograma = document.getElementById("btnAddCronograma");

    btnAvancar.addEventListener("click", () => {
        if (passo === 1) {
            dados.dadosIniciais = {
                nomeEvento: document.getElementById("nomeEvento").value,
                idCategoriaEvento: parseInt(document.getElementById("idCategoriaEvento").value),
                dataInicio: document.getElementById("dataInicio").value,
                dataTermino: document.getElementById("dataTermino").value,
                horarioInicio: document.getElementById("horarioInicio").value,
                horarioTermino: document.getElementById("horarioTermino").value,
                valorIngresso: parseFloat(document.getElementById("valorIngresso").value),
                numParticipantes: parseInt(document.getElementById("numParticipantes").value),
                idLocalizacao: parseInt(document.getElementById("idLocalizacao").value),
                descricao: document.getElementById("descricao").value
            };

            mudarEtapa(2);

        } else if (passo === 2) {
            coletaServicos();
            mudarEtapa(3);

        } else if (passo === 3) {
            coletaCronograma();
            mudarEtapa(4);

        } else if (passo === 4) {
            const valOrcamento = document.getElementById("orcamentoInicial").value;
            dados.orcamentoInicial = parseFloat(valOrcamento);

            enviar();
        }
    });

    btnVoltar.addEventListener("click", () => {
        if (passo > 1) {
            mudarEtapa(passo - 1);
        }
    });

    btnAddServico.addEventListener("click", () => {
        adicionarServico();
    });

    btnAddCronograma.addEventListener("click", () => {
        adicionaCronograma();
    });
}

function mudarEtapa(v) {
    document.getElementById(`passo-${passo}`).classList.add("hidden");
    passo = v;
    document.getElementById(`passo-${passo}`).classList.remove("hidden");

    const indicador = document.getElementById("indicador");
    const btnAvancar = document.getElementById("btnAvancar");
    const btnVoltar = document.getElementById("btnVoltar");

    const titulosEtapas = {
        1: "Etapa 1 de 4: Dados Iniciais",
        2: "Etapa 2 de 4: Serviços do Evento",
        3: "Etapa 3 de 4: Cronograma",
        4: "Etapa 4 de 4: Orçamento Inicial"
    };

    indicador.textContent = titulosEtapas[passo];
    btnVoltar.classList.toggle("hidden", passo === 1);
    btnAvancar.textContent = passo === 4 ? "Concluir Cadastro" : "Avançar →";

    lucide.createIcons();
}

// Adiciona linha de serviço (itemServiço)
function adicionarServico() {
    const container = document.getElementById("servicosContainer");
    const msgVazia = document.getElementById("semServicosMsg");
    if (msgVazia) msgVazia.remove();

    const rowId = 'servico-row-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const linhaDiv = document.createElement("div");
    linhaDiv.className = "flex flex-wrap px-2! gap-2 rounded-lg border border-sky-600 h-min";
    linhaDiv.id = rowId;

    let optionsServicos = '<option value="">Selecione o serviço...</option>';
    servicos.forEach(s => {
        optionsServicos += `<option value="${s.idservico}">${s.descricao} (${s.unidmedida} - R$ ${s.valorunit})</option>`;
    });

    let optionsFornecedores = '<option value="">Nenhum (Serviço da Casa)</option>';
    fornecedores.forEach(f => {
        optionsFornecedores += `<option value="${f.idfornecedor}">${f.nome}</option>`;
    });

    linhaDiv.innerHTML = `
        <div class="flex-2 min-w-[150px]">
            <label class="font-bold">SERVIÇO</label>
            <select class="select-servico w-full p-1 text-sm border rounded bg-white" required>
                ${optionsServicos}
            </select>
        </div>
        <div class="flex-2 min-w-[150px]">
            <label class="font-bold">FORNECEDOR</label>
            <select class="select-fornecedor w-full p-1 text-sm border rounded bg-white">
                ${optionsFornecedores}
            </select>
        </div>
        <div class="flex-1 min-w-[150px]">
            <label class="font-bold">QUANT.</label>
            <input type="number" step="any" min="0.01" class="input-quant w-full p-1 text-sm border rounded bg-white" placeholder="Qtd" required>
        </div>
        <div class="flex-1 min-w-[150px]">
            <label class="font-bold">VALOR (R$)</label>
            <input type="number" step="0.01" min="0" class="input-valor w-full p-1 text-sm border rounded bg-white" placeholder="R$" required>
        </div>
        <button type="button" onclick="document.getElementById('${rowId}').remove()" class="vermelho" title="Remover">
            <i data-lucide="trash-2"></i>
        </button>
    `;

    container.appendChild(linhaDiv);
    lucide.createIcons();
}

function coletaServicos() {
    dados.servicos = [];
    const linhas = document.querySelectorAll("#servicosContainer > div");

    linhas.forEach(linha => {
        const selServico = linha.querySelector(".select-servico");
        const selFornecedor = linha.querySelector(".select-fornecedor");
        const inputQuant = linha.querySelector(".input-quant");
        const inputValor = linha.querySelector(".input-valor");

        if (selServico && selServico.value && inputQuant && inputValor) {
            dados.servicos.push({
                idServico: parseInt(selServico.value),
                idFornecedor: selFornecedor.value ? parseInt(selFornecedor.value) : null,
                quantContratada: parseFloat(inputQuant.value),
                valorAcordado: parseFloat(inputValor.value)
            });
        }
    });
}

function adicionaCronograma() {
    const container = document.getElementById("cronogramaContainer");
    const msgVazia = document.getElementById("semCronogramaMsg");
    if (msgVazia) msgVazia.remove();

    const rowId = `cron-row-${++contadorCronograma}`; // Usa o contador global incrementado
    const linhaDiv = document.createElement("div");
    linhaDiv.className = "flex flex-wrap px-2! gap-2 rounded-lg border border-sky-600 h-min p-2 items-center";
    linhaDiv.id = rowId;

    let optionsApresentador = '<option value="">Sem apresentador</option>';
    apresentadores.forEach(a => {
        optionsApresentador += `<option value="${a.idapresentador}">${a.nome}</option>`;
    });

    linhaDiv.innerHTML = `
        <div class="flex-2 min-w-[180px]">
            <label class="font-bold text-xs">INÍCIO (DATA/HORA)</label>
            <input type="datetime-local" class="input-data-inicio w-full p-1 text-sm border rounded bg-white" required>
        </div>
        <div class="flex-1 min-w-[90px]">
            <label class="font-bold text-xs">DURAÇÃO (MIN)</label>
            <input type="number" min="1" class="input-duracao w-full p-1 text-sm border rounded bg-white" placeholder="Min" required>
        </div>
        <div class="flex-1 min-w-[110px]">
            <label class="font-bold text-xs">CACHÊ (R$)</label>
            <input type="number" step="0.01" min="0" class="input-cache w-full p-1 text-sm border rounded bg-white" placeholder="R$" required>
        </div>
        <div class="flex-2 min-w-[150px]">
            <label class="font-bold text-xs">APRESENTADOR</label>
            <select class="select-apresentador w-full p-1 text-sm border rounded bg-white">
                <option value="">Sem apresentador</option>
                ${apresentadores.map(a => `<option value="${a.idapresentador}">${a.nome}</option>`).join('')}
            </select>
        </div>
        <button type="button" onclick="document.getElementById('${rowId}').remove()" class="vermelho p-2 mt-4 cursor-pointer flex items-center justify-center" title="Remover">
            <i data-lucide="trash-2"></i>
        </button>
    `;

    container.appendChild(linhaDiv);
    lucide.createIcons();
}

function coletaCronograma() {
    dados.cronograma = [];
    const linhas = document.querySelectorAll("#cronogramaContainer > div");

    linhas.forEach(linha => {
        const inputDataInicio = linha.querySelector(".input-data-inicio");
        const inputDuracao = linha.querySelector(".input-duracao");
        const inputCache = linha.querySelector(".input-cache");
        const selectApresentador = linha.querySelector(".select-apresentador");

        if (inputDataInicio && inputDataInicio.value && inputDuracao && inputCache) {
            let dataValor = inputDataInicio.value.replace('T', ' ');
            if (dataValor.length === 16) { 
                dataValor += ':00';
            }

            const idApresVal = selectApresentador.value ? parseInt(selectApresentador.value) : null;

            dados.cronograma.push({
                dataInicio: dataValor,
                duracaoMinutos: parseInt(inputDuracao.value),
                valorCache: parseFloat(inputCache.value),
                idApresentador: idApresVal
            });
        }
    });
}

function coletaCronograma() {
    dados.cronograma = [];
    const linhas = document.querySelectorAll("#cronogramaContainer > div");

    linhas.forEach(linha => {
        const inputDataInicio = linha.querySelector(".input-data-inicio");
        const inputDuracao = linha.querySelector(".input-duracao");
        const inputCache = linha.querySelector(".input-cache");
        const selectApresentador = linha.querySelector(".select-apresentador");

        if (inputDataInicio && inputDataInicio.value && inputDuracao && inputCache) {
            let dataValor = inputDataInicio.value.replace('T', ' ');
            if (dataValor.length === 16) { 
                dataValor += ':00';
            }

            const idApresVal = selectApresentador.value ? parseInt(selectApresentador.value) : null;

            dados.cronograma.push({
                dataInicio: dataValor,
                duracaoMinutos: parseInt(inputDuracao.value),
                valorCache: parseFloat(inputCache.value),
                idApresentador: idApresVal
            });
        }
    });
}

async function enviar() {
    try {
        const idCliente = localStorage.getItem('token');
        const dadosFinais = {
            idCliente: parseInt(idCliente),
            ...dados.dadosIniciais, // Separa os caras
            servicos: dados.servicos,
            cronograma: dados.cronograma,
            orcamentoInicial: dados.orcamentoInicial
        };

        const resposta = await fetch('http://localhost:3000/api/eventos/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFinais)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert(resultado.mensagem || 'Evento cadastrado com sucesso!');
            window.location.href = './homeCliente.html';
        } else {
            alert(`Erro ao cadastrar evento: ${resultado.erro || resultado.mensagem}`);
        }

    } catch (err) {
        console.error("Erro de conexão:", err);
        alert("Erro de conexão com o servidor ao finalizar o cadastro.");
    }
}