"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
let alunos = [
    {
        ra: 26001291,
        nome: "Lucas Minneh",
        email: "lucas.fm8@puccampinas.edu.br",
        curso: "Engenharia de Software",
        semestre: 2,
        situacao: "Ativo"
    },
    {
        ra: 1231232,
        nome: "Guilherme Baez",
        email: "guigui.bz8@puccampinas.edu.br",
        curso: "Engenharia de Software",
        semestre: 2,
        situacao: "Ativo"
    }
];
app.listen(PORT, () => {
    console.log("Servidor ativo na porta 3000");
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.get("/alunos", (req, res) => {
    const situacao = req.query.situacao;
    if (situacao) {
        const alunosFiltrados = alunos.filter((items) => {
            return items.situacao === situacao;
        });
        if (!alunosFiltrados) {
            return res.status(200).json({ mensagem: "Alunos não encontrados!" });
        }
        return res.status(200).json(alunosFiltrados);
    }
    return res.status(200).json(alunos);
});
app.get("/alunos/:ra", (req, res) => {
    const ra = Number(req.params.ra);
    const aluno = alunos.find((item) => item.ra === ra);
    if (!aluno) {
        return res.status(404).json({ mensagem: "Aluno não encontrado" });
    }
    return res.status(200).json(aluno);
});
app.post("/aluno", (req, res) => {
    const { ra, nome, email, curso, semestre } = req.body;
    //validacoes
    if (!ra || !nome || !email || !curso || !semestre) {
        return res.status(404).json({ mensagem: "Campos obrigatorios" });
    }
    const novoAluno = {
        ra, nome, email, curso, semestre, situacao: "Ativo"
    };
    alunos.push(novoAluno);
    return res.status(201).json(novoAluno);
});
app.put("/alunos/:ra", (req, res) => {
    const ra = Number(req.params.ra);
    const aluno = alunos.find((item) => item.ra === ra);
    if (!aluno) {
        return res.status(404).json({ mensagem: "Aluno não encontrado" });
    }
    const { nome, email, curso, semestre, situacao } = req.body;
    //Validacoes
    if (!nome || !email || !curso || !semestre || !situacao) {
        return res.status(404).json({ mensagem: "Todos os campos obrigatorios" });
    }
    aluno.nome = nome;
    aluno.email = email;
    aluno.curso = curso;
    aluno.semestre = semestre;
    aluno.situacao = situacao;
    return res.status(200).json(aluno);
});
app.delete("/aluno/:ra", (req, res) => {
    const ra = Number(req.params.ra);
    let aluno = alunos.find((item) => item.ra === ra);
    if (!aluno) {
        return res.status(404).json({ mensagem: "Aluno não encontrado" });
    }
    aluno.situacao = "Inativo";
    return res.status(200).json({
        mensagem: "Aluno inativado com sucesso!",
        aluno
    });
});
//# sourceMappingURL=index.js.map