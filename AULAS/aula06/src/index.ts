import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

type CursoAluno = "Engenharia de Software" | "Sistema de Informação";
type SituacaoAluno = "Ativo" | "Trancado" | "Formado" | "Inativo";

interface Aluno {
    ra: number;
    nome: string;
    email: string;
    curso: CursoAluno;
    semestre: number;
    situacao: SituacaoAluno;
}

let alunos:Aluno[] = [
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
]

app.listen(PORT, () => {
    console.log("Servidor ativo na porta 3000");
});

app.get("/" , (req: Request, res: Response) => {
    res.send("Hello World");
});

app.get("/alunos", (req: Request, res: Response) => {
    return res.status(200).json(alunos);
});

app.get("/alunos/:ra" , (req: Request, res: Response) => {
    const ra = Number(req.params.ra);
    const aluno = alunos.find((item) =>  item.ra === ra);

    if(!aluno) {
        return res.status(404).json({mensagem: "Aluno não encontrado"});
    }

    return res.status(200).json(aluno);
});

app.post("/aluno", (req: Request, res:Response)  => {
    const {ra, nome, email, curso, semestre} = req.body;

    //validacoes
    if(!ra || !nome || !email || !curso || !semestre) {
        return res.status(404).json({mensagem: "Campos obrigatorios"});
    }

    const novoAluno: Aluno = {
        ra,nome,email,curso,semestre, situacao: "Ativo"
    };

    alunos.push(novoAluno);
    return res.status(201).json(novoAluno);
});

app.put("/alunos/:ra", (req: Request, res: Response) => {
    const ra = Number(req.params.ra);
    const aluno = alunos.find((item) => item.ra === ra);

    if(!aluno) {
        return res.status(404).json({mensagem: "Aluno não encontrado"});
    }

    const {nome, email, curso, semestre, situacao} = req.body;

    //Validacoes
    if(!nome || !email || !curso || !semestre || !situacao) {
        return res.status(404).json({mensagem: "Todos os campos obrigatorios"});
    }

    aluno.nome = nome;
    aluno.email = email;
    aluno.curso = curso;
    aluno.semestre = semestre;
    aluno.situacao = situacao;

    return res.status(200).json(aluno);
});

app.delete("/aluno/:ra", (req: Request, res: Response) => {
    const ra = Number(req.params.ra);
    let aluno = alunos.find((item) => item.ra === ra);

    if(!aluno) {
        return res.status(404).json({mensagem:"Aluno não encontrado"});
    } 

    aluno.situacao = "Inativo";

    return res.status(200).json({
        mensagem: "Aluno inativado com sucesso!", 
        aluno
    });
});