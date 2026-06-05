import express from "express";

import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { AppDataSource } from "./data-source.js";

import { Ingrediente } from "./entity/Ingrediente.js";
import { Receita } from "./entity/Receita.js";
import { Usuario } from "./entity/Usuario.js";
import { IngredienteReceita } from "./entity/IngredienteReceita.js";
import { resumeToPipeableStream } from "react-dom/server";

AppDataSource.initialize().then(
    () => console.log("Banco de dados inicializado com sucesso!")
);

const usuarioRepo = AppDataSource.getRepository(Usuario);
const receitaRepo = AppDataSource.getRepository(Receita);
const ingredienteRepo = AppDataSource.getRepository(Ingrediente);
const ingredienteReceitaRepo = AppDataSource.getRepository(IngredienteReceita);

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({ limit: '20mb' }));

dotenv.config({ quiet: false, debug: true });

const checkAuth = (req, res, next) => {
    try {
        const bearertoken = req.headers['authorization'];
        if (!bearertoken && !bearertoken.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token mal-formado' });
        }
        const token = bearertoken.split(' ')[1];

        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (user) {
            req.user = user
            next();
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Sem autorização' })
    }
}

const checkAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        const realUser = await usuarioRepo.findOneBy({ id: user.id, email: user.email });
        if (realUser.account_type && (realUser.account_type !== 'normal' && realUser.account_type === 'superadmin')) {
            next();
        } else { throw 'Not admin trying to connect to admin endpoint' }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Sem autorização' })
    }
}

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await usuarioRepo.findOne({where: {email}, select: {id: true, username: true, password: true, email: true}});
        const isUser = await bcrypt.compare(password, user.password);
        if (isUser) {
            const token = jwt.sign({ id: user.id, email: user.email, username: user.username },
                process.env.JWT_SECRET,
                {
                    expiresIn: '7d'
                }
            );

            const usuario = await usuarioRepo.findOne({where: {id:user.id}});

            res.status(202).json({ message: 'Login bem sucedido', token, usuario});
        } else { throw 'fuck'; }

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const pass = await bcrypt.hash(password, 10);

        await usuarioRepo.insert({
            username, email, password: pass, account_type: 'normal', created_at: new Date()
        });

        const user = await usuarioRepo.findOneBy({
            username, email
        });

        const usuario = { password: null, ...user };

        const token = jwt.sign({ id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.status(202).json({ message: 'Usuario registrado', token, usuario });
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Algo deu errado. (E-mail já cadastrado?)' });

    }
});


app.get('/receitas', checkAuth, async (req, res) => {
    const result = await receitaRepo.find({ 'relations': { 'ingredientes': {'ingrediente': true}, 'autor': true } });
    res.status(200).json(result);
});

app.get('/receitas/:id', checkAuth, async (req, res) => {
    const id = req.params.id;
    const result = await receitaRepo.findOne({'where': {id}, 'relations': { 'ingredientes': {'ingrediente': true}, 'autor': true } });
    res.status(200).json(result);
});

app.post('/receitas', checkAuth, async (req, res) => {
    try {
        const { nome, passos, refeicao, tempoPreparo, porcoes } = req.body;
        
        const result = await receitaRepo.insert({
            nome, passos, refeicao, tempoPreparo, porcoes
        });
        
        const receita = await receitaRepo.findOne({
            where: {
                id: result.raw,
            }
        });

        receita.autor = req.user.id;
        console.log(req.user, req.user.id);

        await receitaRepo.save(receita);

        res.status(201).json({ message: 'Receita criada com sucesso', id: result.raw });
    } catch (err) {
        res.status(400).json({ message: 'Algo deu errado, tente novamente mais tarde' });
    }
});

app.put('/receitas/ingredientes', checkAuth, async (req, res) => {
    try {
        const { id, ingredientes } = req.body;

        const receita = await receitaRepo.findOneBy({ id });
        if (!receita) {
            return res.status(404).json({ message: 'Receita não encontrada' });
        }

        await ingredienteReceitaRepo.delete({ receita: { id } });

        const novosVinculos = Object.keys(ingredientes).map((ingredienteId) => {
            return ingredienteReceitaRepo.create({
                receita: { id },
                ingrediente: { id: Number(ingredienteId) },
                quantidade: ingredientes[ingredienteId]
            });
        });

        
        await ingredienteReceitaRepo.save(novosVinculos);

        const newReceita = await receitaRepo.findOne({where: {id}, relations: {'ingredientes': {'ingrediente': true}}});

        res.status(200).json({ message: 'Ingredientes da receita atualizados com sucesso', receita: newReceita });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Algo deu errado, tente novamente mais tarde' });
    }
});

app.put('/receitas', checkAuth, async (req, res) => {
    try {
        const { id, nome, passos, refeicao, tempoPreparo, porcoes } = req.body;

        const result = await receitaRepo.update({
            id
        }, { nome, passos, refeicao, tempoPreparo, porcoes });

        res.status(201).json({ message: 'Receita atualizada com sucesso', id: result.raw['id'] });
    } catch (err) {
        res.status(400).json({ message: 'Algo deu errado, tente novamente mais tarde' });
    }
});

app.delete('/receitas/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;

        const result = await receitaRepo.delete({
            id
        });

        res.status(201).json({ message: 'Receita deletada com sucesso', id: result.raw['id'] });
    } catch (err) {
        res.status(400).json({ message: 'Algo deu errado, tente novamente mais tarde' });
    }
});

app.get('/ingredientes', checkAuth, async (req, res) => {
    try {
        const result = await ingredienteRepo.find();

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Algo deu errado, tente novamente mais tarde' });
    }
});

app.post('/ingredientes', checkAuth, checkAdmin, async (req, res) => {
    try {
        const { nome, unidade } = req.body;
        await ingredienteRepo.insert({ nome, unidade });

        res.status(201).json({message: 'Ingrediente inserido com sucesso'});
    } catch (err) {
        res.status(400).json({ message: 'Algo deu errado, tente novamente mais tarde' });
    }
});

app.put('/ingredientes', checkAuth, checkAdmin, async (req, res) => {
    try {
        const { id, nome, unidade } = req.body;
        await ingredienteRepo.update({id}, {nome, unidade});

        res.status(202).json({message: 'Ingrediente atualizado com sucesso'});
    } catch (err) {
        res.status(400).json({message: 'Requisição mal-formada'})
    }
});

app.delete('/ingredientes/:id', checkAuth, checkAdmin, async (req, res) => {
    try {
        const id = req.params.id
        await ingredienteRepo.delete({id});

        res.status(202).json({message: 'Ingrediente removido com sucesso'});
    } catch (err) {
        res.status(400).json({message: 'Requisição mal-formada'})
    }
});



app.listen(3069, () => console.log('Receitas++ sendo executado na porta 3069, acesse via http://localhost:3069/'))


