
let radioParticipante = document.getElementById("participante");
let radioCliente = document.getElementById("cliente");
let endereco = document.getElementById("endereco");
let cpf = document.getElementById("cpf");

if(radioParticipante.checked){
    endereco.disabled = true;
    cpf.disabled = true;
}

radioParticipante.addEventListener("click", () => {
    endereco.disabled = true;
    cpf.disabled = true;
});

radioCliente.addEventListener("click", () => {
    endereco.disabled = false;
    cpf.disabled = false;
});


const clientes = await fetch('http://localhost:3000/api/dados');
const clientesParsed = await clientes.json();
console.log(clientesParsed)