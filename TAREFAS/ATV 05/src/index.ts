import express, { Request, Response } from "express";
const app = express();
const PORT = 3000;

type situacaoMusica = "Ativa" | "Cancelado"
type generoMusica = "Rock" | "Pop" | "Funk"

interface Musicas {
    id: Number;
    titulo: String;
    artista: String;
    genero: generoMusica;
    anoLancamento: Number;
    duracao: Number;
    situacao: situacaoMusica;
}


app.get("/", (req: Request, res: Response) => {
res.send("Servidor funcionando!");
});
app.listen(PORT, () => {
console.log(`Servidor rodando na porta ${PORT}`);
})