"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const PORT = Number(process.env.PORT) || 3000;
const VIACEP_URL = "https://viacep.com.br/ws";
// dist/server.js -> ../public
const PUBLIC_DIR = node_path_1.default.resolve(__dirname, "..", "public");
const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
function enviarJson(res, status, corpo) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(corpo));
}
function normalizarCep(valor) {
    const cep = decodeURIComponent(valor).trim().replace("-", "");
    return /^\d{8}$/.test(cep) ? cep : null;
}
async function consultarViaCep(cep) {
    const resposta = await fetch(`${VIACEP_URL}/${cep}/json/`, {
        signal: AbortSignal.timeout(8000),
    });
    if (!resposta.ok) {
        throw new Error(`ViaCEP respondeu HTTP ${resposta.status}`);
    }
    const dados = (await resposta.json());
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
async function tratarApiCep(rotaCep, res) {
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
    }
    catch (erro) {
        console.error("Falha ao consultar o ViaCEP:", erro);
        enviarJson(res, 502, { erro: "Não foi possível consultar o serviço de CEP." });
    }
}
async function servirArquivoEstatico(pathname, res) {
    const relativo = pathname === "/" ? "index.html" : pathname;
    const caminho = node_path_1.default.resolve(PUBLIC_DIR, "." + node_path_1.default.sep + relativo);
    // Impede acesso a arquivos fora da pasta public (ex.: ../)
    if (!caminho.startsWith(PUBLIC_DIR + node_path_1.default.sep)) {
        enviarJson(res, 403, { erro: "Acesso negado" });
        return;
    }
    try {
        const conteudo = await promises_1.default.readFile(caminho);
        const tipo = TIPOS[node_path_1.default.extname(caminho)] ?? "application/octet-stream";
        res.writeHead(200, { "Content-Type": tipo });
        res.end(conteudo);
    }
    catch {
        enviarJson(res, 404, { erro: "Arquivo não encontrado" });
    }
}
async function tratarRequisicao(req, res) {
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
const servidor = node_http_1.default.createServer((req, res) => {
    tratarRequisicao(req, res).catch((erro) => {
        console.error("Erro inesperado:", erro);
        enviarJson(res, 500, { erro: "Erro interno do servidor" });
    });
});
servidor.listen(PORT, async () => {
    console.log(`Aplicação rodando em http://localhost:${PORT}`);
    console.log(`Pasta do front-end: ${PUBLIC_DIR}`);
    try {
        await promises_1.default.access(node_path_1.default.join(PUBLIC_DIR, "index.html"));
    }
    catch {
        console.error("\nATENÇÃO: index.html não encontrado nessa pasta.\n" +
            "Crie a pasta 'public' ao lado de 'src' e coloque nela index.html, style.css e script.js.");
    }
});
