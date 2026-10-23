/*
  Arquivo: api.js
  Responsabilidade: concentrar as chamadas para a API.

  Backend esperado:
  http://localhost:3000

  Rotas disponíveis no backend:
  GET    /alunos
  GET    /alunos?situacao=Ativo
  GET    /alunos/:ra
  POST   /alunos
  PUT    /alunos/:ra
  DELETE /alunos/:ra
*/

const API_BASE_URL = "http://localhost:3000";

async function listarAlunosApi(situacao = "") {
  let url = `${API_BASE_URL}/alunos`;

  if(situacao) {
    url += `?situacao=${encodeURLComponent(situacao)}`;
  }

  const resposta = await fetch(url);
  return await tratarRespostaApi(resposta);
}

async function tratarRespostaApi(resposta) {
  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagem = dados.mensagem || "Erro na requisição";
    throw new Error (mensagem);
  }

  return dados;
}

async function buscarAlunoApi(ra) {
  
const resposta = await fetch(`${API_BASE_URL}/alunos/${ra}`);
return await tratarRespostaApi(resposta);

}

async function cadastrarAlunoApi(aluno) {
  const resposta = await fetch(`${API_BASE_URL}/alunos`,
    { 
      method: "POST",
      headers: {
        "content-type" : "application/json"
      },
      body: JSON.stringify(aluno)
    }
  );
    return await tratarRespostaApi(resposta);
}

async function atualizarAlunoApi(ra, aluno) {

 const resposta = await fetch(`${API_BASE_URL}/alunos/${ra}`,
    { 
      method: "PUT",
      headers: {
        "content-type" : "application/json"
      },
      body: JSON.stringify(aluno)
    }
  );
    return await tratarRespostaApi(resposta);
}

async function inativarAlunoApi(ra) {

 const resposta = await fetch(`${API_BASE_URL}/alunos/${ra}`,
    { 
      method: "DELETE",
    }
  );
    return await tratarRespostaApi(resposta);
}
