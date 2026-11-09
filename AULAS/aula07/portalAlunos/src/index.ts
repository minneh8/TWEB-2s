import express, {Request, Response} from "express";
import cors from "cors"
import "dotenv/config";
import { initPool, getConn, closePool } from "./db";

const app = express();
app.use(express.json());
app.use(cors());
iniciarServidor();

const PORT = Number(process.env.PORT ?? 3000);

async function iniciarServidor() {
    try {
        // Prepara o pool de conexões com o Oracle.
        await initPool();

        // Inicia o servidor HTTP.
        app.listen(PORT, () => {
            console.log(`Servidor ativo na porta ${PORT}`);
        });

        // Registra o encerramento ao pressionar Ctrl+C.
        process.on("SIGINT", encerrarServidor);

        // Registra o encerramento solicitado pelo ambiente.
        process.on("SIGTERM", encerrarServidor);
    } catch (erro) {
        console.error("Falha ao iniciar o servidor:", erro);
        process.exit(1);
    }
}

async function encerrarServidor() {
    try {
        await closePool();
        console.log("Pool de conexões encerrado.");
        process.exit(0);
    } catch (erro) {
        console.error("Falha ao encerrar o pool:", erro);
        process.exit(1);
    }
}

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/alunos", async (req: Request, res: Response) => {
   //TODO em aula
});

app.get("/alunos/:ra", async (req: Request, res: Response) => {
    const ra = Number(req.params.ra);

    let conn;
    try {
        conn = await getConn();

        const result = await conn.execute(
            `SELECT ra AS "ra", nome AS "nome", email AS "email",
             curso AS "curso", semestre AS "semestre",
             situacao AS "situacao"
             FROM alunos WHERE ra = :ra`,
            { ra }
        );

        return res.status(200).json(result.rows?.[0] ?? null);

    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao buscar aluno!" });
    } finally {
        if (conn) await conn.close();
    }
});

app.post("/alunos", async (req: Request, res: Response) => {
    const { ra, nome, email, curso, semestre } = req.body;

    let conn;
    try {
        conn = await getConn();

        await conn.execute(
            `INSERT INTO alunos (ra, nome, email, curso, semestre, situacao)
             VALUES (:ra, :nome, :email, :curso, :semestre, 'Ativo')`,
            { ra, nome, email, curso, semestre },
            { autoCommit: true }
        );

        return res.status(201).json({
            mensagem: "Aluno cadastrado com sucesso!"
        });

    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao cadastrar aluno!" });
    } finally {
        if (conn) await conn.close();
    }
});

app.put("/alunos/:ra", async (req: Request, res: Response) => {
    const ra = Number(req.params.ra);
    const { nome, email, curso, semestre, situacao } = req.body;

    let conn;
    try {
        conn = await getConn();

        const result = await conn.execute(
            `UPDATE alunos
             SET nome = :nome,
                 email = :email,
                 curso = :curso,
                 semestre = :semestre,
                 situacao = :situacao
             WHERE ra = :ra`,
            { ra, nome, email, curso, semestre, situacao },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ mensagem: "Aluno não encontrado!" });
        }

        const busca = await conn.execute(
            `SELECT ra AS "ra", nome AS "nome", email AS "email",
                    curso AS "curso", semestre AS "semestre",
                    situacao AS "situacao"
             FROM alunos WHERE ra = :ra`,
            { ra }
        );

        return res.status(200).json(busca.rows?.[0]);

    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao atualizar aluno!" });
    } finally {
        if (conn) await conn.close();
    }
});

app.delete("/alunos/:ra", async (req: Request, res: Response) => {
    const ra = Number(req.params.ra);

    let conn;
    try {
        conn = await getConn();

        const result = await conn.execute(
            `UPDATE alunos
             SET situacao = 'Inativo'
             WHERE ra = :ra`,
            { ra },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ mensagem: "Aluno não encontrado!" });
        }

        const busca = await conn.execute(
            `SELECT ra AS "ra", nome AS "nome", email AS "email",
                    curso AS "curso", semestre AS "semestre",
                    situacao AS "situacao"
             FROM alunos WHERE ra = :ra`,
            { ra }
        );

        return res.status(200).json({
            mensagem: "Aluno inativado com sucesso!",
            aluno: busca.rows?.[0]
        });

    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao inativar aluno!" });
    } finally {
        if (conn) await conn.close();
    }
});