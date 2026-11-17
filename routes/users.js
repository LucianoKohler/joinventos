const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { ObjectId } = require('mongodb');

router.post('/cadastro/cliente', async (req, res) => {
    const { nome, senha, telefone, email, endereco, cpf_cnpj } = req.body;
    const senhaCript = await bcrypt.hash(senha, 10);

    try {
        const database = await db.getDb();
        const novoCliente = {
            nome,
            senha: senhaCript,
            telefone,
            email,
            endereco,
            cpf_cnpj
        };

        const resultado = await database.collection('clientes').insertOne(novoCliente);

        res.status(201).json({ 
            mensagem: 'Cliente cadastrado com sucesso!', 
            token: resultado.insertedId.toString(),
            tipo: 'cliente'
        });    
    } catch (e) {
        console.log(e);
        res.status(500).json({ erro: 'Cadastro de cliente falhou', detalhe: e.message });
    }
});

router.post('/cadastro/participante', async (req, res) => {
    const { nome, senha, telefone, email } = req.body;
    const senhaCript = await bcrypt.hash(senha, 10);

    try {
        const database = await db.getDb();
        const novoParticipante = {
            nome,
            senha: senhaCript,
            telefone,
            email
        };

        const resultado = await database.collection('participantes').insertOne(novoParticipante);

        res.status(201).json({ 
            mensagem: 'Participante cadastrado com sucesso!', 
            token: resultado.insertedId.toString(),
            tipo: 'participante'
        });            
    } catch (e) {
        console.log(e);
        res.status(500).json({ erro: 'Cadastro de participante falhou', detalhe: e.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const database = await db.getDb();

        // Tenta achar em participantes 
        let usuario = await database.collection('participantes').findOne({ email });

        if (usuario) {
            const senhaOK = await bcrypt.compare(senha, usuario.senha);
            
            if (!senhaOK) {
                return res.status(403).json({ mensagem: 'E-mail ou senha incorretos' });
            }

            return res.status(200).json({ 
                mensagem: 'Login efetivado!', 
                token: usuario._id.toString(), 
                tipo: 'participante' 
            });
        }

        // Se não achou, tenta achar em clientes
        usuario = await database.collection('clientes').findOne({ email });

        if (usuario) {
            const senhaOK = await bcrypt.compare(senha, usuario.senha);
            
            if (!senhaOK) {
                return res.status(403).json({ mensagem: 'E-mail ou senha incorretos' });
            }

            return res.status(200).json({ 
                mensagem: 'Login efetivado!', 
                token: usuario._id.toString(), 
                tipo: 'cliente' 
            });
        }

        return res.status(404).json({ mensagem: 'Usuário não cadastrado no banco' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Erro interno do banco' });
    }
});

module.exports = router;