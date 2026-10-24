import express from 'express';
const app = express();
const PORT = 3000;
app.use(express.json());
let transacoes = [
    {
        id: 1,
        descricao: 'Salário Estágio',
        valor: 1800.00,
        tipo: 'RECEITA',
        categoria: 'Trabalho',
        data: '2026-10-01'
    },
    {
        id: 2,
        descricao: 'Almoço Restaurante',
        valor: 35.50,
        tipo: 'DESPESA',
        categoria: 'Alimentação',
        data: '2026-10-02'
    },
    {
        id: 3,
        descricao: 'Mensalidade da Faculdade',
        valor: 650.00,
        tipo: 'DESPESA',
        categoria: 'Educação',
        data: '2026-10-05'
    },
    {
        id: 4,
        descricao: 'Projeto Freelance HTML/CSS',
        valor: 400.00,
        tipo: 'RECEITA',
        categoria: 'Trabalho',
        data: '2026-10-10'
    },
    {
        id: 5,
        descricao: 'Lanche McDonald\'s',
        valor: 48.00,
        tipo: 'DESPESA',
        categoria: 'Alimentação',
        data: '2026-10-12'
    }
];
app.get('/transacoes', (req, res) => {
    const { tipo } = req.query;
    if (tipo) {
        const tipoFormatado = String(tipo).toUpperCase();
        if (tipoFormatado !== 'RECEITA' && tipoFormatado !== 'DESPESAS') {
            return res.status(400).json({ mensagem: 'O parametro Tipo deve ser RECEITA ou DESPESAS' });
        }
        const filtradas = transacoes.filter(t => t.tipo === tipoFormatado);
        return res.status(200).json(filtradas);
    }
    return res.status(200).json(transacoes);
});
app.get('/transacoes:id', (req, res) => {
    const id = Number(req.params.id);
    if (!id) {
        return res.status(400).json({ mensagem: 'O ID informado deve ser um numero' });
    }
    const transacao = transacoes.find(t => t.id === id);
    if (!transacao) {
        return res.status(404).json({ mensagem: 'Transacao nao encontrada' });
    }
    return res.status(200).json(transacao);
});
app.post('/transacoes', (req, res) => {
    const { descricao, valor, tipo, categoria, data } = req.body;
    //Validar se todos os campos estao preenchidos
    if (descricao || valor === undefined || tipo || categoria || data) {
        return res.status(400).json({ mensagem: 'Todos os campos sao obrigatorios' });
    }
    //Validar o tipo
    if (tipo !== 'RECEITA' && tipo !== 'DESPESA') {
        return res.status(400).json({ mensagem: 'O tipo precisa ser Receita ou Despesa' });
    }
    //Validar o valor
    if (isNaN(valor) || valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor precisa ser numerico e maior que zero' });
    }
    const novaTransacao = {
        id: transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1,
        descricao,
        valor,
        tipo,
        categoria,
        data
    };
    transacoes.push(novaTransacao);
    return res.status(200).json(novaTransacao);
});
app.put('/transacoes:id', (req, res) => {
    const id = Number(req.params.id);
    const { descricao, valor, tipo, categoria, data } = req.body;
    const transacao = transacoes.find(t => t.id === id);
    const formData = /^\d{4}-\d{2}-\d{2}$/;
    const dataHoje = Date.parse(data);
    if (!transacao) {
        return res.status(404).json({ mensagem: 'Transacao nao encontrada' });
    }
    if (!descricao) {
        return res.status(400).json({ mensagem: 'A descricao precisa ser preencida' });
    }
    if (!valor || isNaN(valor) || valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor tem que ser preenchido, tem que ser um numero e nao pode ser menor ou igual a zero' });
    }
    if (!tipo || (tipo !== 'RECEITA' && tipo !== 'DESPESA')) {
        return res.status(400).json({ mensagem: 'O tipo tem que ser preenchido com RECEITA ou DESPESA' });
    }
    if (!categoria) {
        return res.status(400).json({ mensagem: 'A categoria tem que ser preenchida' });
    }
    if (!data || !formData.test(data)) {
        return res.status(400).json({ mensagem: 'A data nao pode estar vazia e tem que estar no formato AAAA-MM-DD' });
    }
    if (isNaN(dataHoje)) {
        return res.status(200).json({ mensagem: 'A data inserida esta invalida!' });
    }
    transacao.descricao = descricao;
    transacao.valor = valor;
    transacao.tipo = tipo;
    transacao.categoria = categoria;
    transacao.data = data;
    return res.status(200).json(transacao);
});
app.listen(PORT, () => {
    console.log('Servidor rodando em https://localhost:${PORT}');
});
//# sourceMappingURL=server.js.map