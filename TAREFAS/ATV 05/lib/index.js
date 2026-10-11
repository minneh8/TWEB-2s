"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
let musicas = [
    {
        id: 1,
        titulo: "Bohemian Rhapsody",
        artista: "Queen",
        genero: "Rock",
        anoLancamento: 1975,
        duracao: 354,
        situacao: "Ativa",
    },
    {
        id: 2,
        titulo: "Billie Jean",
        artista: "Michael Jackson",
        genero: "Pop",
        anoLancamento: 1982,
        duracao: 294,
        situacao: "Ativa",
    },
    {
        id: 3,
        titulo: "Garota de Ipanema",
        artista: "Tom Jobim",
        genero: "Bossa Nova",
        anoLancamento: 1962,
        duracao: 170,
        situacao: "Ativa",
    },
    {
        id: 4,
        titulo: "Lose Yourself",
        artista: "Eminem",
        genero: "Rap",
        anoLancamento: 2002,
        duracao: 326,
        situacao: "Inativa",
    },
];
const MENSAGEM_CAMPOS_OBRIGATORIOS = "Título, artista, gênero, ano de lançamento e duração são obrigatórios.";
function gerarId() {
    return musicas.length > 0 ? Math.max(...musicas.map((m) => m.id)) + 1 : 1;
}
function preenchido(valor) {
    if (valor === undefined || valor === null)
        return false;
    if (typeof valor === "string" && valor.trim() === "")
        return false;
    return true;
}
function camposObrigatoriosPresentes(body) {
    return (preenchido(body?.titulo) &&
        preenchido(body?.artista) &&
        preenchido(body?.genero) &&
        preenchido(body?.anoLancamento) &&
        preenchido(body?.duracao));
}
function numerosValidos(body) {
    const ano = Number(body.anoLancamento);
    const duracao = Number(body.duracao);
    return Number.isFinite(ano) && ano > 0 && Number.isFinite(duracao) && duracao > 0;
}
app.get("/musicas", (req, res) => {
    const { genero, situacao, artista, anoLancamento } = req.query;
    let resultado = [...musicas];
    if (typeof genero === "string") {
        resultado = resultado.filter((m) => m.genero.toLowerCase() === genero.toLowerCase());
    }
    if (typeof situacao === "string") {
        resultado = resultado.filter((m) => m.situacao.toLowerCase() === situacao.toLowerCase());
    }
    if (typeof artista === "string") {
        resultado = resultado.filter((m) => m.artista.toLowerCase().includes(artista.toLowerCase()));
    }
    if (typeof anoLancamento === "string") {
        resultado = resultado.filter((m) => m.anoLancamento === Number(anoLancamento));
    }
    return res.status(200).json(resultado);
});
app.get("/musicas/:id", (req, res) => {
    const id = Number(req.params.id);
    const musica = musicas.find((m) => m.id === id);
    if (!musica) {
        return res.status(404).json({ mensagem: "Música não encontrada." });
    }
    return res.status(200).json(musica);
});
app.post("/musicas", (req, res) => {
    const body = req.body;
    if (!camposObrigatoriosPresentes(body) || !numerosValidos(body)) {
        return res.status(400).json({ mensagem: MENSAGEM_CAMPOS_OBRIGATORIOS });
    }
    const novaMusica = {
        id: gerarId(),
        titulo: String(body.titulo).trim(),
        artista: String(body.artista).trim(),
        genero: String(body.genero).trim(),
        anoLancamento: Number(body.anoLancamento),
        duracao: Number(body.duracao),
        situacao: "Ativa", // toda música nova começa como Ativa
    };
    musicas.push(novaMusica);
    return res.status(201).json(novaMusica);
});
app.put("/musicas/:id", (req, res) => {
    const id = Number(req.params.id);
    const body = req.body;
    const musica = musicas.find((m) => m.id === id);
    if (!musica) {
        return res.status(404).json({ mensagem: "Música não encontrada." });
    }
    if (!camposObrigatoriosPresentes(body) || !numerosValidos(body)) {
        return res.status(400).json({ mensagem: MENSAGEM_CAMPOS_OBRIGATORIOS });
    }
    if (preenchido(body.situacao) && !["Ativa", "Inativa"].includes(body.situacao)) {
        return res
            .status(400)
            .json({ mensagem: 'A situação deve ser "Ativa" ou "Inativa".' });
    }
    musica.titulo = String(body.titulo).trim();
    musica.artista = String(body.artista).trim();
    musica.genero = String(body.genero).trim();
    musica.anoLancamento = Number(body.anoLancamento);
    musica.duracao = Number(body.duracao);
    if (preenchido(body.situacao)) {
        musica.situacao = body.situacao;
    }
    return res.status(200).json(musica);
});
app.delete("/musicas/:id", (req, res) => {
    const id = Number(req.params.id);
    const musica = musicas.find((m) => m.id === id);
    if (!musica) {
        return res.status(404).json({ mensagem: "Música não encontrada." });
    }
    musica.situacao = "Inativa";
    return res.status(200).json({
        mensagem: "Música inativada com sucesso.",
        musica,
    });
});
app.use((err, _req, res, _next) => {
    console.error(err);
    // JSON malformado no body também cai aqui
    if (err instanceof SyntaxError) {
        return res.status(400).json({ mensagem: "JSON inválido no corpo da requisição." });
    }
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
});
app.listen(PORT, () => {
    console.log(`Musicoteca rodando em http://localhost:${PORT}`);
});
