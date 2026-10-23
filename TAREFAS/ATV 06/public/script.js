// O front chama o back-end do próprio projeto (mesmo endereço, sem CORS).
const campoCep = document.getElementById("cep");
const botao = document.getElementById("btnBuscar");
const mensagem = document.getElementById("mensagem");

const camposEndereco = ["logradouro", "bairro", "cidade", "uf"];

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem " + (tipo || "");
}

function limparCamposEndereco() {
  camposEndereco.forEach((id) => {
    document.getElementById(id).value = "";
  });
}

function preencherCampos(dados) {
  document.getElementById("logradouro").value = dados.logradouro || "";
  document.getElementById("bairro").value = dados.bairro || "";
  document.getElementById("cidade").value = dados.cidade || "";
  document.getElementById("uf").value = dados.uf || "";
}

async function buscarCep() {
  const cep = document.getElementById("cep").value.trim().replace("-", "");

  // Validação no front: não chama o back-end com CEP inválido
  if (cep === "") {
    limparCamposEndereco();
    mostrarMensagem("Informe um CEP para realizar a consulta.", "erro");
    return;
  }
  if (!/^\d{8}$/.test(cep)) {
    limparCamposEndereco();
    mostrarMensagem("CEP inválido. Digite exatamente 8 números, com ou sem hífen.", "erro");
    return;
  }

  botao.disabled = true;
  mostrarMensagem("Consultando CEP...", "info");

  try {
    const resposta = await fetch(`/api/cep/${cep}`, { method: "GET" });
    const dados = await resposta.json();

    if (resposta.status === 404) {
      limparCamposEndereco();
      mostrarMensagem("CEP não encontrado", "erro");
      return;
    }

    if (!resposta.ok) {
      // 400 (CEP inválido) ou 502 (falha ao falar com o ViaCEP)
      throw new Error(dados.erro || "Erro HTTP " + resposta.status);
    }

    preencherCampos(dados);
    mostrarMensagem("Endereço encontrado.", "sucesso");
    document.getElementById("numero").focus();
  } catch (erro) {
    console.error("Erro ao consultar o back-end:", erro);
    limparCamposEndereco();
    mostrarMensagem("Não foi possível realizar a consulta. Tente novamente em instantes.", "erro");
  } finally {
    botao.disabled = false;
  }
}

botao.addEventListener("click", buscarCep);

campoCep.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    evento.preventDefault();
    buscarCep();
  }
});