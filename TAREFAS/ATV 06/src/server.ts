import http, { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.PORT) || 3000;
const VIACEP_URL = "https://viacep.com.br/ws";
// dist/server.js -> ../public
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

const TIPOS: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function enviarJson(res: ServerResponse, status: number, corpo: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

function normalizarCep(valor: string): string | null {
  const cep = decodeURIComponent(valor).trim().replace("-", "");
  return /^\d{8}$/.test(cep) ? cep : null;
}

async function consultarViaCep(cep: string): Promise<Endereco | null> {
  const resposta = await fetch(`${VIACEP_URL}/${cep}/json/`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!resposta.ok) {
    throw new Error(`ViaCEP respondeu HTTP ${resposta.status}`);
  }

  const dados = (await resposta.json()) as ViaCepResponse;

  // CEP com formato válido, mas inexistente: HTTP 200 com { "erro": true }
  if (dados.erro) {
    return null;
  }

  return {
    cep: dados.cep ?? cep,
    logradouro: dados.logradouro ?? "",
    bairro: dados.bairro ?? "",
    cidade: dados.localidade ?? "",
    uf: dados.uf ?? "",
  };
}

async function tratarApiCep(rotaCep: string, res: ServerResponse): Promise<void> {
  const cep = normalizarCep(rotaCep);
  if (!cep) {
    enviarJson(res, 400, { erro: "CEP inválido. Informe exatamente 8 números." });
    return;
  }

  try {
    const endereco = await consultarViaCep(cep);
    if (!endereco) {
      enviarJson(res, 404, { erro: "CEP não encontrado" });
      return;
    }
    enviarJson(res, 200, endereco);
  } catch (erro) {
    console.error("Falha ao consultar o ViaCEP:", erro);
    enviarJson(res, 502, { erro: "Não foi possível consultar o serviço de CEP." });
  }
}

async function servirArquivoEstatico(pathname: string, res: ServerResponse): Promise<void> {
  const relativo = pathname === "/" ? "index.html" : pathname;
  const caminho = path.resolve(PUBLIC_DIR, "." + path.sep + relativo);

  // Impede acesso a arquivos fora da pasta public (ex.: ../)
  if (!caminho.startsWith(PUBLIC_DIR + path.sep)) {
    enviarJson(res, 403, { erro: "Acesso negado" });
    return;
  }

  try {
    const conteudo = await fs.readFile(caminho);
    const tipo = TIPOS[path.extname(caminho)] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": tipo });
    res.end(conteudo);
  } catch {
    enviarJson(res, 404, { erro: "Arquivo não encontrado" });
  }
}

async function tratarRequisicao(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    enviarJson(res, 405, { erro: "Método não permitido" });
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const rotaApi = url.pathname.match(/^\/api\/cep\/([^/]+)$/);

  if (rotaApi) {
    await tratarApiCep(rotaApi[1], res);
    return;
  }

  await servirArquivoEstatico(decodeURIComponent(url.pathname), res);
}

const servidor = http.createServer((req, res) => {
  tratarRequisicao(req, res).catch((erro) => {
    console.error("Erro inesperado:", erro);
    enviarJson(res, 500, { erro: "Erro interno do servidor" });
  });
});

servidor.listen(PORT, async () => {
  console.log(`Aplicação rodando em http://localhost:${PORT}`);
  console.log(`Pasta do front-end: ${PUBLIC_DIR}`);
  try {
    await fs.access(path.join(PUBLIC_DIR, "index.html"));
  } catch {
    console.error(
      "\nATENÇÃO: index.html não encontrado nessa pasta.\n" +
        "Crie a pasta 'public' ao lado de 'src' e coloque nela index.html, style.css e script.js."
    );
  }
});