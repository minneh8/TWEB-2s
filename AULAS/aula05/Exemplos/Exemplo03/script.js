const formulario = document.querySelector("#formAluno");

const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoMatricula = document.querySelector("#matricula");
const campoNascimento = document.querySelector("#nascimento");
const campoCurso = document.querySelector("#curso");
const campoSemestre = document.querySelector("#semestre");
const campoSenha = document.querySelector("#senha");
const campoConfirmacaoSenha = document.querySelector("#confirmacaoSenha");
const campoTermos = document.querySelector("#termos");

const erroNome = document.querySelector("#erroNome");
const erroEmail = document.querySelector("#erroEmail");
const erroMatricula = document.querySelector("#erroMatricula");
const erroNascimento = document.querySelector("#erroNascimento");
const erroCurso = document.querySelector("#erroCurso");
const erroSemestre = document.querySelector("#erroSemestre");
const erroSenha = document.querySelector("#erroSenha");
const erroConfirmacaoSenha = document.querySelector("#erroConfirmacaoSenha");
const erroTermos = document.querySelector("#erroTermos");

const painelResultado = document.querySelector("#painelResultado");
const resultado = document.querySelector("#resultado");

const camposComErro = [
    campoNome,
    campoEmail,
    campoMatricula,
    campoNascimento,
    campoCurso,
    campoSemestre,
    campoSenha,
    campoConfirmacaoSenha,
    campoTermos
];

const mensagensDeErro = [
    erroNome,
    erroEmail,
    erroMatricula,
    erroNascimento,
    erroCurso,
    erroSemestre,
    erroSenha,
    erroConfirmacaoSenha,
    erroTermos
];

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.innerText = mensagem;
}

function limparErros() {
    camposComErro.forEach(function (campo) {
        campo.classList.remove("is-invalid");
    });

    mensagensDeErro.forEach(function (elementoErro) {
        elementoErro.innerText = "";
    });
}

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(`${dataNascimento}T00:00:00`);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aniversarioAindaNaoOcorreu =
        hoje.getMonth() < nascimento.getMonth()
        || (
            hoje.getMonth() === nascimento.getMonth()
            && hoje.getDate() < nascimento.getDate()
        );

    if (aniversarioAindaNaoOcorreu) {
        idade--;
    }

    return idade;
}

formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    limparErros();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim().toLowerCase();
    const matricula = campoMatricula.value.trim();
    const dataNascimento = campoNascimento.value.trim();
    const curso = campoCurso.value;
    const semestre = Number(campoSemestre.value);
    const senha = campoSenha.value;
    const confirmacaoSenha = campoConfirmacaoSenha.value;
    const termosAceitos = campoTermos.checked;

    let formValido = true;
    
    //Validar Nome 
    if(nome === "") {
        mostrarErro(campoNome, erroNome, "Nome é obrigatório");
        formValido = false;
    } else if (nome.length < 5) {
        mostrarErro(campoNome, erroNome, "O nome deve possuir pelo menos 5 caracteres");
        formValido = false;
    } else if (nome.split(/\s+/).length < 2) {
        mostrarErro(campoNome, erroNome, "Informe Nome e Sobrenome");
        formValido = false;
    } 

    //Validar Email
    if(email === "") {
        mostrarErro(campoEmail, erroEmail, "O Email é obrigatório");
        formValido = false;
    } else if (campoEmail.validity.typeMismatch) {
        mostrarErro(campoEmail, erroEmail, "Insira um Email valido!");
        formValido = false;
    } else if (!email.endsWith("@aluno.edu.br")) {
        mostrarErro(campoEmail, erroEmail, "Insira um Email @aluno.edu.br");
        formValido = false;
    }

    //Validar Matricula
    //^ = Comeca, $ = Termina
    const formatoMatricula = /^[0-9]{8}$/
    if (formatoMatricula.test(matricula)) {
        mostrarErro(campoMatricula, erroMatricula, "A matrícula deve ser exatamente 8 digitos numericos");
        formValido = false;
    }

    //Validar Data de Nascimento 
    if(dataNascimento === "") {
        mostrarErro(campoNascimento, erroNascimento, "A Data de Nascimento é obrigatória");
        formValido = false;
    } else {
        const hoje = new Date();
        const nascimento = new Date(`${dataNascimento}T00:00:00`);

        if(nascimento > hoje) {
            mostrarErro(campoNascimento, erroNascimento, "Data de Nascimento não pode ser uma data futura");
            formValido = false;
        } else if (calcularIdade(dataNascimento) < 16 || calcularIdade(dataNascimento) > 120) {
            mostrarErro(campoNascimento, erroNascimento, "Idade fora do range permitido");
            formValido = false;
        }
    }

    //Validar Semestre
    if(!Number.isInteger(semestre) || semestre < 1 || semestre > 10) {
        mostrarErro(campoSemestre, erroSemestre, "informe um semestre valido");
        formValido = false;
    }

    //Validar Senha 
    const possuiMaiuscula = /[A-Z]/.test(senha);
    const possuiMinuscula = /[a-z]/.test(senha);
    const possuiNumero = /[0-9]/.test(senha);
    const possuiCaracter = /[_|@|!]/.test(senha);

    if (senha.length < 8) {
        mostrarErro(campoSenha, erroSenha, "Senha deve ter no minimo 8 caracteres");
        formValido = false;
    } else if (!possuiMaiuscula || !possuiCaracter || !possuiMinuscula || !possuiNumero) {
        mostrarErro(campoSenha, erroSenha, "Senha nao atende aos criterios");
        formValido = false;
    }
});
