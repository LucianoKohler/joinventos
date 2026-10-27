const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// Cadastro de cliente
router.post('/cadastro/cliente', async (req, res) => {
    const { nome, senha, telefone, email, endereco, cpf_cnpj } = req.body;

    // Hash de senha
    const senhaCript = await bcrypt.hash(senha, 10); // 10 = n° saltos

    try {
        const out = await db.query(
            `INSERT INTO cliente (nome, senha, 
            telefone, email, endereco, cpf_cnpj)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;`, 
            [nome, senhaCript, telefone, email, endereco, cpf_cnpj]);
            res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso!', usuario: out.rows[0] });    } catch (e) {
        console.log(e);
            res.status(500).json({ erro: 'Cadastro de cliente falhou' });
    }
});

// Cadastro de participante
router.post('/cadastro/participante', async (req, res) => {
    const { nome, senha, telefone, email } = req.body;

    // Hash de senha
    const senhaCript = await bcrypt.hash(senha, 10); // 10 = n° saltos

    try {
        const out = await db.query(
            `INSERT INTO participante (nome, senha, 
            telefone, email)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`, 
            [nome, senhaCript, telefone, email]);
            res.status(201).json({ mensagem: 'Participante cadastrado com sucesso!', usuario: out.rows[0] });    
        } catch (e) {
        console.log(e);
            res.status(500).json({ erro: 'Cadastro de participante falhou' });
    }
});

// Cadastro de participante
router.post('/cadastro/participante', async (req, res) => {
    const { nome, senha, telefone, email } = req.body;

    // Hash de senha
    const senhaCript = await bcrypt.hash(senha, 10); // 10 = n° saltos

    try {
        const out = await db.query(
            `INSERT INTO participante (nome, senha, 
            telefone, email)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`, 
            [nome, senhaCript, telefone, email]);
            res.status(201).json({ mensagem: 'Participante cadastrado com sucesso!', usuario: out.rows[0] });    
        } catch (e) {
        console.log(e);
            res.status(500).json({ erro: 'Cadastro de participante falhou' });
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        let resultado = await db.query(
            `SELECT * FROM participante WHERE email = $1;`, 
            [email]
        );

        if (resultado.rowCount > 0) {
            const usuario = resultado.rows[0];
            const senhaOK = await bcrypt.compare(senha, usuario.senha);
            
            if (!senhaOK) {
                return res.status(403).json({ mensagem: 'E-mail ou senha incorretos' });
            }

            return res.status(200).json({ 
                mensagem: 'Login efetivado!', 
                token: usuario.email, 
                tipo: 'Participante' 
            });
        }

        // Não achou um participante? Tenta achar um cliente
        resultado = await db.query(
            `SELECT * FROM cliente WHERE email = $1;`, 
            [email]
        );

        if (resultado.rowCount > 0) {
            const usuario = resultado.rows[0];
            const senhaOK = await bcrypt.compare(senha, usuario.senha);
            
            if (!senhaOK) {
                return res.status(403).json({ mensagem: 'E-mail ou senha incorretos' });
            }

            return res.status(200).json({ 
                mensagem: 'Login efetivado!', 
                token: usuario.email, 
                tipo: 'Cliente' 
            });
        }

        return res.status(404).json({ mensagem: 'Usuário não cadastrado no banco' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Erro interno do banco' });
    }
});
    module.exports = router;