
const form = document.querySelector('#reserva-form');
const resultado = document.querySelector('#resultado');
const jsonReserva = document.querySelector('#json-reserva');
const checkinInput = document.querySelector('#checkin');

const capacidadeQuartos = {
  Individual: 1,
  Duplo: 2,
  Família: 5
};


const hojeISO = new Date().toISOString().split('T')[0];
checkinInput.setAttribute('min', hojeISO);


function mostrarErro(campoId, mensagem) {
  const input = document.querySelector(`#${campoId}`);
  const erro = document.querySelector(`#erro-${campoId}`);
  input.classList.add('invalido');
  erro.textContent = mensagem;
}


function limparErros() {
  document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.invalido').forEach((el) => el.classList.remove('invalido'));
}

function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento + 'T00:00:00');
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

function calcularDiarias(checkin, checkout) {
  const UM_DIA_MS = 24 * 60 * 60 * 1000;
  const dataCheckin = new Date(checkin + 'T00:00:00');
  const dataCheckout = new Date(checkout + 'T00:00:00');
  return Math.round((dataCheckout - dataCheckin) / UM_DIA_MS);
}


form.addEventListener('submit', function (event) {
  event.preventDefault();
  limparErros();
  resultado.classList.add('oculto');

  let formularioValido = true;

  const nomeInput = document.querySelector('#nome');
  const emailInput = document.querySelector('#email');
  const telefoneInput = document.querySelector('#telefone');
  const nascimentoInput = document.querySelector('#nascimento');
  const checkoutInput = document.querySelector('#checkout');
  const hospedesInput = document.querySelector('#hospedes');
  const quartoInput = document.querySelector('#quarto');
  const senhaInput = document.querySelector('#senha');
  const confirmarSenhaInput = document.querySelector('#confirmarSenha');
  const aceiteInput = document.querySelector('#aceite');

  const nome = nomeInput.value.trim();
  const palavras = nome.split(/\s+/).filter((p) => p.length > 0);
  if (nome.length === 0) {
    mostrarErro('nome', 'O nome completo é obrigatório.');
    formularioValido = false;
  } else if (nome.length < 5) {
    mostrarErro('nome', 'O nome deve possuir pelo menos 5 caracteres.');
    formularioValido = false;
  } else if (palavras.length < 2) {
    mostrarErro('nome', 'Informe pelo menos nome e sobrenome.');
    formularioValido = false;
  }

  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length === 0) {
    mostrarErro('email', 'O e-mail é obrigatório.');
    formularioValido = false;
  } else if (!emailInput.checkValidity() || !emailRegex.test(email)) {
    mostrarErro('email', 'Informe um e-mail válido.');
    formularioValido = false;
  }

  const telefoneDigitos = telefoneInput.value.replace(/\D/g, '');
  const telefoneRegex = /^\d{11}$/;
  if (telefoneInput.value.trim().length === 0) {
    mostrarErro('telefone', 'O telefone é obrigatório.');
    formularioValido = false;
  } else if (!telefoneRegex.test(telefoneDigitos)) {
    mostrarErro('telefone', 'O telefone deve possuir exatamente 11 números.');
    formularioValido = false;
  }

  const nascimentoValue = nascimentoInput.value;
  if (!nascimentoValue) {
    mostrarErro('nascimento', 'A data de nascimento é obrigatória.');
    formularioValido = false;
  } else if (calcularIdade(nascimentoValue) < 18) {
    mostrarErro('nascimento', 'O hóspede responsável deve possuir 18 anos ou mais.');
    formularioValido = false;
  }


  const checkinValue = checkinInput.value;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (!checkinValue) {
    mostrarErro('checkin', 'A data de check-in é obrigatória.');
    formularioValido = false;
  } else if (new Date(checkinValue + 'T00:00:00') < hoje) {
    mostrarErro('checkin', 'A data de check-in não pode ser anterior à data atual.');
    formularioValido = false;
  }


  const checkoutValue = checkoutInput.value;
  if (!checkoutValue) {
    mostrarErro('checkout', 'A data de check-out é obrigatória.');
    formularioValido = false;
  } else if (checkinValue) {
    const dataCheckin = new Date(checkinValue + 'T00:00:00');
    const dataCheckout = new Date(checkoutValue + 'T00:00:00');
    if (dataCheckout <= dataCheckin) {
      mostrarErro('checkout', 'A data de check-out deve ser posterior à data de check-in.');
      formularioValido = false;
    }
  }

  const hospedesValue = Number(hospedesInput.value);
  if (!hospedesInput.value) {
    mostrarErro('hospedes', 'A quantidade de hóspedes é obrigatória.');
    formularioValido = false;
  } else if (hospedesValue < 1 || hospedesValue > 5) {
    mostrarErro('hospedes', 'A quantidade deve estar entre 1 e 5 hóspedes.');
    formularioValido = false;
  }

  const quartoValue = quartoInput.value;
  if (!quartoValue) {
    mostrarErro('quarto', 'Selecione um tipo de quarto.');
    formularioValido = false;
  } else if (hospedesInput.value && hospedesValue > capacidadeQuartos[quartoValue]) {
    mostrarErro(
      'quarto',
      `O quarto ${quartoValue} suporta no máximo ${capacidadeQuartos[quartoValue]} pessoa(s).`
    );
    formularioValido = false;
  }


  const senha = senhaInput.value;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  if (!senha) {
    mostrarErro('senha', 'A senha é obrigatória.');
    formularioValido = false;
  } else if (senha.length < 8 || !temMaiuscula || !temNumero) {
    mostrarErro(
      'senha',
      'A senha deve ter no mínimo 8 caracteres, com pelo menos 1 letra maiúscula e 1 número.'
    );
    formularioValido = false;
  }

  const confirmarSenha = confirmarSenhaInput.value;
  if (!confirmarSenha) {
    mostrarErro('confirmarSenha', 'Confirme a senha.');
    formularioValido = false;
  } else if (confirmarSenha !== senha) {
    mostrarErro('confirmarSenha', 'As senhas digitadas não coincidem.');
    formularioValido = false;
  }


  if (!aceiteInput.checked) {
    mostrarErro('aceite', 'Você deve aceitar as condições da reserva.');
    formularioValido = false;
  }

  if (!formularioValido) {
    return;
  }

  const diarias = calcularDiarias(checkinValue, checkoutValue);

  const reserva = {
    nome: nome,
    email: email,
    telefone: telefoneDigitos,
    nascimento: nascimentoValue,
    checkin: checkinValue,
    checkout: checkoutValue,
    hospedes: hospedesValue,
    quarto: quartoValue,
    diarias: diarias
  };

  jsonReserva.textContent = JSON.stringify(reserva, null, 2);
  resultado.classList.remove('oculto');
  resultado.scrollIntoView({ behavior: 'smooth' });

  form.reset();
});
