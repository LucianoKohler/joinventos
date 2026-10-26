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
            res.status(201).json({ mensagem: 'Participante cadastrado com sucesso!', usuario: out.rows[0] });    } catch (e) {
        console.log(e);
            res.status(500).json({ erro: 'Cadastro de participante falhou' });
    }
});

module.exports = router;