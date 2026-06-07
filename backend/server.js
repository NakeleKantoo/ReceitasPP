import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { AppDataSource } from "./data-source.js";
import { Ingrediente } from "./entity/Ingrediente.js";
import { Receita } from "./entity/Receita.js";
import { Usuario } from "./entity/Usuario.js";
import { IngredienteReceita } from "./entity/IngredienteReceita.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "receitaspp-dev-secret";
const PORT = process.env.PORT ?? 3069;
const HOST = "0.0.0.0";
const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Receitas++ backend online.",
    health: "/health",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const usuarioRepo = AppDataSource.getRepository(Usuario);
const receitaRepo = AppDataSource.getRepository(Receita);
const ingredienteRepo = AppDataSource.getRepository(Ingrediente);
const ingredienteReceitaRepo = AppDataSource.getRepository(IngredienteReceita);

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    account_type: user.account_type,
    createdAt: user.createdAt,
  };
}

function canUserAccessRecipe(user, recipe) {
  if (!user || !recipe) {
    return false;
  }

  if (user.account_type === "superadmin") {
    return true;
  }

  if (recipe.autor?.id === user.id) {
    return true;
  }

  return recipe.status === "approved";
}

function sortEntries(entries) {
  return Object.entries(entries)
    .sort((first, second) => second[1] - first[1])
    .map(([label, value]) => ({ label, value }));
}

async function buildAdminAnalytics() {
  const [totalUsers, recipes] = await Promise.all([
    usuarioRepo.count(),
    receitaRepo.find({
      relations: {
        autor: true,
      },
    }),
  ]);

  const categories = {};
  const authors = {};
  const statuses = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const recipe of recipes) {
    categories[recipe.refeicao] = (categories[recipe.refeicao] ?? 0) + 1;

    if (recipe.status in statuses) {
      statuses[recipe.status] += 1;
    }

    const authorLabel = recipe.autor?.username ?? "Sem autor";
    authors[authorLabel] = (authors[authorLabel] ?? 0) + 1;
  }

  return {
    totalUsers,
    totalRecipes: recipes.length,
    pendingRecipes: statuses.pending,
    approvedRecipes: statuses.approved,
    rejectedRecipes: statuses.rejected,
    topCategories: sortEntries(categories),
    authorSummary: sortEntries(authors),
    statusSummary: sortEntries(statuses),
  };
}

async function buildRecipeResponse(recipeId) {
  return await receitaRepo.findOne({
    where: { id: Number(recipeId) },
    relations: {
      autor: true,
      ingredientes: {
        ingrediente: true,
      },
    },
  });
}

const allowedRecipeCategories = new Set([
  "Cafe da manha",
  "Almoco",
  "Jantar",
  "Lanche",
  "Sobremesa",
  "Bebida",
]);

const ingredientCatalog = [
  { nome: "Arroz", unidade: "g" },
  { nome: "Feijao", unidade: "g" },
  { nome: "Ovo", unidade: "un" },
  { nome: "Leite", unidade: "ml" },
  { nome: "Farinha", unidade: "g" },
  { nome: "Tomate", unidade: "g" },
  { nome: "Queijo", unidade: "g" },
  { nome: "Frango", unidade: "g" },
  { nome: "Acucar", unidade: "g" },
  { nome: "Agua", unidade: "ml" },
  { nome: "Alface", unidade: "g" },
  { nome: "Alho", unidade: "g" },
  { nome: "Aveia em flocos", unidade: "g" },
  { nome: "Azeite", unidade: "ml" },
  { nome: "Banana", unidade: "un" },
  { nome: "Batata", unidade: "g" },
  { nome: "Biscoito maizena", unidade: "g" },
  { nome: "Cafe em po", unidade: "g" },
  { nome: "Canela em po", unidade: "g" },
  { nome: "Carne moida", unidade: "g" },
  { nome: "Cebola", unidade: "g" },
  { nome: "Cenoura", unidade: "g" },
  { nome: "Chocolate em po", unidade: "g" },
  { nome: "Creme de leite", unidade: "ml" },
  { nome: "Fermento em po", unidade: "g" },
  { nome: "Goma de tapioca", unidade: "g" },
  { nome: "Iogurte natural", unidade: "ml" },
  { nome: "Leite condensado", unidade: "ml" },
  { nome: "Limao", unidade: "un" },
  { nome: "Macarrao espaguete", unidade: "g" },
  { nome: "Macarrao parafuso", unidade: "g" },
  { nome: "Manteiga", unidade: "g" },
  { nome: "Milho verde", unidade: "g" },
  { nome: "Molho de tomate", unidade: "ml" },
  { nome: "Oleo", unidade: "ml" },
  { nome: "Pao frances", unidade: "un" },
  { nome: "Pepino", unidade: "g" },
  { nome: "Pimenta calabresa", unidade: "g" },
  { nome: "Pimenta-do-reino", unidade: "g" },
  { nome: "Presunto", unidade: "g" },
  { nome: "Queijo parmesao", unidade: "g" },
  { nome: "Sal", unidade: "g" },
  { nome: "Vinagre", unidade: "ml" },
];

const defaultUsers = [
  {
    username: "Super Admin",
    email: "admin@receitaspp.com",
    password: "admin123",
    account_type: "superadmin",
  },
  {
    username: "Ana Souza",
    email: "ana@receitaspp.com",
    password: "123456",
    account_type: "normal",
  },
  {
    username: "Bruna Costa",
    email: "bruna@receitaspp.com",
    password: "123456",
    account_type: "normal",
  },
  {
    username: "Pedro",
    email: "pedro@unileste.com",
    password: "123456",
    account_type: "normal",
  },
];

const expandedPendingRecipeBlueprints = [
  {
    nome: "Tapioca com queijo",
    refeicao: "Cafe da manha",
    tempoPreparo: 10,
    porcoes: 1,
    passos: "Aqueca a frigideira.\nEspalhe a goma de tapioca.\nAdicione o queijo e dobre ate firmar.",
    ingredientes: [
      { nome: "Goma de tapioca", quantidade: 120 },
      { nome: "Queijo", quantidade: 80 },
    ],
  },
  {
    nome: "Mingau de aveia",
    refeicao: "Cafe da manha",
    tempoPreparo: 12,
    porcoes: 2,
    passos: "Misture o leite, a aveia e o acucar.\nCozinhe mexendo ate engrossar.\nFinalize com canela.",
    ingredientes: [
      { nome: "Leite", quantidade: 300 },
      { nome: "Aveia em flocos", quantidade: 40 },
      { nome: "Acucar", quantidade: 10 },
      { nome: "Canela em po", quantidade: 2 },
    ],
  },
  {
    nome: "Ovos mexidos com tomate",
    refeicao: "Cafe da manha",
    tempoPreparo: 10,
    porcoes: 2,
    passos: "Bata os ovos.\nRefogue o tomate na manteiga.\nJunte os ovos e mexa ate cozinhar.",
    ingredientes: [
      { nome: "Ovo", quantidade: 3 },
      { nome: "Tomate", quantidade: 80 },
      { nome: "Manteiga", quantidade: 10 },
      { nome: "Sal", quantidade: 2 },
    ],
  },
  {
    nome: "Panqueca de banana",
    refeicao: "Cafe da manha",
    tempoPreparo: 15,
    porcoes: 2,
    passos: "Amasse a banana.\nMisture com os ovos, a aveia e a canela.\nGrelhe pequenas porcoes dos dois lados.",
    ingredientes: [
      { nome: "Banana", quantidade: 2 },
      { nome: "Ovo", quantidade: 2 },
      { nome: "Aveia em flocos", quantidade: 40 },
      { nome: "Canela em po", quantidade: 2 },
    ],
  },
  {
    nome: "Pao na chapa com manteiga",
    refeicao: "Cafe da manha",
    tempoPreparo: 8,
    porcoes: 2,
    passos: "Abra os paes.\nPasse a manteiga.\nDoure na chapa ate ficar crocante.",
    ingredientes: [
      { nome: "Pao frances", quantidade: 2 },
      { nome: "Manteiga", quantidade: 20 },
    ],
  },
  {
    nome: "Crepioca simples",
    refeicao: "Cafe da manha",
    tempoPreparo: 10,
    porcoes: 1,
    passos: "Misture a goma com os ovos e o sal.\nDespeje na frigideira.\nAdicione o queijo e dobre para finalizar.",
    ingredientes: [
      { nome: "Goma de tapioca", quantidade: 60 },
      { nome: "Ovo", quantidade: 2 },
      { nome: "Queijo", quantidade: 40 },
      { nome: "Sal", quantidade: 1 },
    ],
  },
  {
    nome: "Arroz com alho e cebola",
    refeicao: "Almoco",
    tempoPreparo: 35,
    porcoes: 4,
    passos: "Refogue o alho e a cebola no oleo.\nAdicione o arroz e mexa bem.\nAcrescente a agua e cozinhe ate secar.",
    ingredientes: [
      { nome: "Arroz", quantidade: 240 },
      { nome: "Alho", quantidade: 12 },
      { nome: "Cebola", quantidade: 80 },
      { nome: "Oleo", quantidade: 20 },
      { nome: "Sal", quantidade: 4 },
      { nome: "Agua", quantidade: 500 },
    ],
  },
  {
    nome: "Feijao temperado caseiro",
    refeicao: "Almoco",
    tempoPreparo: 50,
    porcoes: 4,
    passos: "Cozinhe o feijao na agua.\nRefogue alho e cebola no oleo.\nMisture ao feijao e apure com sal.",
    ingredientes: [
      { nome: "Feijao", quantidade: 250 },
      { nome: "Alho", quantidade: 10 },
      { nome: "Cebola", quantidade: 80 },
      { nome: "Oleo", quantidade: 15 },
      { nome: "Sal", quantidade: 4 },
      { nome: "Agua", quantidade: 700 },
    ],
  },
  {
    nome: "Frango grelhado acebolado",
    refeicao: "Almoco",
    tempoPreparo: 30,
    porcoes: 4,
    passos: "Tempere o frango com sal e pimenta.\nGrelhe no oleo.\nJunte a cebola e cozinhe ate dourar.",
    ingredientes: [
      { nome: "Frango", quantidade: 500 },
      { nome: "Cebola", quantidade: 120 },
      { nome: "Alho", quantidade: 10 },
      { nome: "Oleo", quantidade: 20 },
      { nome: "Sal", quantidade: 5 },
      { nome: "Pimenta-do-reino", quantidade: 2 },
    ],
  },
  {
    nome: "Macarrao parafuso ao molho de tomate",
    refeicao: "Almoco",
    tempoPreparo: 30,
    porcoes: 4,
    passos: "Cozinhe o macarrao.\nPrepare o molho com alho e molho de tomate.\nMisture tudo e finalize com queijo parmesao.",
    ingredientes: [
      { nome: "Macarrao parafuso", quantidade: 250 },
      { nome: "Molho de tomate", quantidade: 300 },
      { nome: "Alho", quantidade: 10 },
      { nome: "Oleo", quantidade: 15 },
      { nome: "Sal", quantidade: 4 },
      { nome: "Queijo parmesao", quantidade: 30 },
    ],
  },
  {
    nome: "Carne moida com batata e cenoura",
    refeicao: "Almoco",
    tempoPreparo: 35,
    porcoes: 4,
    passos: "Refogue alho e cebola.\nAdicione a carne moida e cozinhe.\nJunte batata e cenoura ate ficarem macias.",
    ingredientes: [
      { nome: "Carne moida", quantidade: 400 },
      { nome: "Batata", quantidade: 250 },
      { nome: "Cenoura", quantidade: 150 },
      { nome: "Cebola", quantidade: 100 },
      { nome: "Alho", quantidade: 10 },
      { nome: "Oleo", quantidade: 20 },
      { nome: "Sal", quantidade: 5 },
    ],
  },
  {
    nome: "Salada completa de alface, tomate e pepino",
    refeicao: "Almoco",
    tempoPreparo: 15,
    porcoes: 3,
    passos: "Lave e corte os vegetais.\nMisture os ingredientes.\nTempere com azeite, vinagre e sal antes de servir.",
    ingredientes: [
      { nome: "Alface", quantidade: 150 },
      { nome: "Tomate", quantidade: 150 },
      { nome: "Pepino", quantidade: 120 },
      { nome: "Cebola", quantidade: 40 },
      { nome: "Azeite", quantidade: 20 },
      { nome: "Vinagre", quantidade: 15 },
      { nome: "Sal", quantidade: 3 },
    ],
  },
  {
    nome: "Sopa de legumes com frango",
    refeicao: "Jantar",
    tempoPreparo: 45,
    porcoes: 4,
    passos: "Cozinhe o frango com alho e cebola.\nAcrescente batata, cenoura e agua.\nTempere e cozinhe ate engrossar levemente.",
    ingredientes: [
      { nome: "Frango", quantidade: 300 },
      { nome: "Batata", quantidade: 250 },
      { nome: "Cenoura", quantidade: 150 },
      { nome: "Cebola", quantidade: 80 },
      { nome: "Alho", quantidade: 10 },
      { nome: "Agua", quantidade: 1000 },
      { nome: "Sal", quantidade: 5 },
    ],
  },
  {
    nome: "Omelete de cebola e tomate",
    refeicao: "Jantar",
    tempoPreparo: 15,
    porcoes: 2,
    passos: "Bata os ovos.\nMisture cebola, tomate e queijo.\nCozinhe na frigideira ate firmar.",
    ingredientes: [
      { nome: "Ovo", quantidade: 3 },
      { nome: "Cebola", quantidade: 60 },
      { nome: "Tomate", quantidade: 80 },
      { nome: "Queijo", quantidade: 50 },
      { nome: "Sal", quantidade: 2 },
      { nome: "Pimenta-do-reino", quantidade: 1 },
    ],
  },
  {
    nome: "Espaguete alho e oleo",
    refeicao: "Jantar",
    tempoPreparo: 20,
    porcoes: 3,
    passos: "Cozinhe o espaguete.\nDoure o alho no oleo.\nMisture com o macarrao e finalize com pimenta calabresa.",
    ingredientes: [
      { nome: "Macarrao espaguete", quantidade: 250 },
      { nome: "Alho", quantidade: 15 },
      { nome: "Oleo", quantidade: 30 },
      { nome: "Sal", quantidade: 4 },
      { nome: "Pimenta calabresa", quantidade: 2 },
    ],
  },
  {
    nome: "Frango ao molho de tomate",
    refeicao: "Jantar",
    tempoPreparo: 35,
    porcoes: 4,
    passos: "Sele o frango no oleo.\nRefogue alho e cebola.\nAcrescente o molho de tomate e cozinhe ate apurar.",
    ingredientes: [
      { nome: "Frango", quantidade: 500 },
      { nome: "Molho de tomate", quantidade: 300 },
      { nome: "Cebola", quantidade: 80 },
      { nome: "Alho", quantidade: 10 },
      { nome: "Oleo", quantidade: 20 },
      { nome: "Sal", quantidade: 5 },
    ],
  },
  {
    nome: "Caldo de batata com cebola",
    refeicao: "Jantar",
    tempoPreparo: 35,
    porcoes: 4,
    passos: "Cozinhe a batata na agua.\nRefogue a cebola e o alho na manteiga.\nBata parte do caldo e finalize com sal.",
    ingredientes: [
      { nome: "Batata", quantidade: 400 },
      { nome: "Cebola", quantidade: 100 },
      { nome: "Alho", quantidade: 8 },
      { nome: "Agua", quantidade: 800 },
      { nome: "Manteiga", quantidade: 20 },
      { nome: "Sal", quantidade: 4 },
    ],
  },
  {
    nome: "Macarrao cremoso com queijo",
    refeicao: "Jantar",
    tempoPreparo: 25,
    porcoes: 3,
    passos: "Cozinhe o macarrao.\nAqueca o leite com manteiga e alho.\nMisture o queijo e envolva o macarrao no molho.",
    ingredientes: [
      { nome: "Macarrao espaguete", quantidade: 220 },
      { nome: "Leite", quantidade: 250 },
      { nome: "Queijo", quantidade: 120 },
      { nome: "Manteiga", quantidade: 20 },
      { nome: "Alho", quantidade: 8 },
      { nome: "Sal", quantidade: 3 },
    ],
  },
  {
    nome: "Sanduiche quente de presunto e queijo",
    refeicao: "Lanche",
    tempoPreparo: 12,
    porcoes: 2,
    passos: "Abra os paes.\nRecheie com presunto, queijo e tomate.\nPasse manteiga e doure na frigideira.",
    ingredientes: [
      { nome: "Pao frances", quantidade: 2 },
      { nome: "Presunto", quantidade: 80 },
      { nome: "Queijo", quantidade: 80 },
      { nome: "Tomate", quantidade: 50 },
      { nome: "Manteiga", quantidade: 10 },
    ],
  },
  {
    nome: "Bolo simples",
    refeicao: "Lanche",
    tempoPreparo: 45,
    porcoes: 8,
    passos: "Misture ovos, acucar, leite e manteiga.\nAdicione farinha e fermento.\nAsse ate dourar.",
    ingredientes: [
      { nome: "Farinha", quantidade: 220 },
      { nome: "Leite", quantidade: 200 },
      { nome: "Ovo", quantidade: 3 },
      { nome: "Acucar", quantidade: 180 },
      { nome: "Fermento em po", quantidade: 10 },
      { nome: "Manteiga", quantidade: 40 },
    ],
  },
  {
    nome: "Bolo de chocolate simples",
    refeicao: "Lanche",
    tempoPreparo: 50,
    porcoes: 8,
    passos: "Misture os liquidos com o acucar.\nAcrescente farinha, chocolate e fermento.\nAsse ate o centro firmar.",
    ingredientes: [
      { nome: "Farinha", quantidade: 220 },
      { nome: "Leite", quantidade: 220 },
      { nome: "Ovo", quantidade: 3 },
      { nome: "Acucar", quantidade: 180 },
      { nome: "Chocolate em po", quantidade: 40 },
      { nome: "Fermento em po", quantidade: 10 },
      { nome: "Manteiga", quantidade: 40 },
    ],
  },
  {
    nome: "Pao com ovo e tomate",
    refeicao: "Lanche",
    tempoPreparo: 10,
    porcoes: 2,
    passos: "Prepare os ovos na frigideira.\nMonte os paes com tomate.\nSirva ainda quente.",
    ingredientes: [
      { nome: "Pao frances", quantidade: 2 },
      { nome: "Ovo", quantidade: 2 },
      { nome: "Tomate", quantidade: 60 },
      { nome: "Manteiga", quantidade: 10 },
      { nome: "Sal", quantidade: 2 },
    ],
  },
  {
    nome: "Biscoito de aveia e banana",
    refeicao: "Lanche",
    tempoPreparo: 25,
    porcoes: 4,
    passos: "Amasse as bananas.\nMisture com aveia, acucar e canela.\nModele os biscoitos e asse ate dourar.",
    ingredientes: [
      { nome: "Banana", quantidade: 2 },
      { nome: "Aveia em flocos", quantidade: 120 },
      { nome: "Acucar", quantidade: 30 },
      { nome: "Canela em po", quantidade: 2 },
    ],
  },
  {
    nome: "Torrada de alho com queijo",
    refeicao: "Lanche",
    tempoPreparo: 12,
    porcoes: 2,
    passos: "Misture alho com manteiga.\nPasse no pao e cubra com queijo.\nLeve para dourar ate ficar crocante.",
    ingredientes: [
      { nome: "Pao frances", quantidade: 2 },
      { nome: "Alho", quantidade: 5 },
      { nome: "Queijo", quantidade: 70 },
      { nome: "Manteiga", quantidade: 10 },
    ],
  },
  {
    nome: "Brigadeiro de panela",
    refeicao: "Sobremesa",
    tempoPreparo: 20,
    porcoes: 6,
    passos: "Leve todos os ingredientes ao fogo baixo.\nMexa sem parar ate desgrudar do fundo.\nDeixe esfriar antes de servir.",
    ingredientes: [
      { nome: "Leite condensado", quantidade: 395 },
      { nome: "Chocolate em po", quantidade: 20 },
      { nome: "Manteiga", quantidade: 15 },
    ],
  },
  {
    nome: "Mousse de limao",
    refeicao: "Sobremesa",
    tempoPreparo: 15,
    porcoes: 6,
    passos: "Bata o leite condensado com o creme de leite.\nAdicione o suco de limao.\nLeve para gelar ate firmar.",
    ingredientes: [
      { nome: "Leite condensado", quantidade: 395 },
      { nome: "Creme de leite", quantidade: 200 },
      { nome: "Limao", quantidade: 3 },
    ],
  },
  {
    nome: "Banana caramelizada com canela",
    refeicao: "Sobremesa",
    tempoPreparo: 15,
    porcoes: 4,
    passos: "Derreta o acucar ate formar caramelo.\nJunte a manteiga e as bananas.\nFinalize com canela.",
    ingredientes: [
      { nome: "Banana", quantidade: 4 },
      { nome: "Acucar", quantidade: 80 },
      { nome: "Manteiga", quantidade: 15 },
      { nome: "Canela em po", quantidade: 3 },
    ],
  },
  {
    nome: "Pudim simples de leite condensado",
    refeicao: "Sobremesa",
    tempoPreparo: 70,
    porcoes: 8,
    passos: "Bata os ovos com o leite condensado e o leite.\nPrepare a calda com acucar.\nAsse em banho-maria ate firmar.",
    ingredientes: [
      { nome: "Leite condensado", quantidade: 395 },
      { nome: "Leite", quantidade: 300 },
      { nome: "Ovo", quantidade: 3 },
      { nome: "Acucar", quantidade: 120 },
    ],
  },
  {
    nome: "Pave simples de chocolate",
    refeicao: "Sobremesa",
    tempoPreparo: 25,
    porcoes: 8,
    passos: "Prepare um creme com leite condensado, creme de leite, leite e chocolate.\nMonte camadas com biscoito.\nLeve para gelar.",
    ingredientes: [
      { nome: "Biscoito maizena", quantidade: 180 },
      { nome: "Leite", quantidade: 300 },
      { nome: "Leite condensado", quantidade: 395 },
      { nome: "Creme de leite", quantidade: 200 },
      { nome: "Chocolate em po", quantidade: 30 },
    ],
  },
  {
    nome: "Creme gelado de banana",
    refeicao: "Sobremesa",
    tempoPreparo: 10,
    porcoes: 4,
    passos: "Bata banana, leite, iogurte e acucar.\nPolvilhe canela.\nLeve para gelar antes de servir.",
    ingredientes: [
      { nome: "Banana", quantidade: 3 },
      { nome: "Leite", quantidade: 250 },
      { nome: "Iogurte natural", quantidade: 170 },
      { nome: "Acucar", quantidade: 25 },
      { nome: "Canela em po", quantidade: 2 },
    ],
  },
  {
    nome: "Cafe com leite",
    refeicao: "Bebida",
    tempoPreparo: 8,
    porcoes: 2,
    passos: "Prepare o cafe com agua.\nMisture com o leite aquecido.\nAdicione acucar a gosto.",
    ingredientes: [
      { nome: "Cafe em po", quantidade: 20 },
      { nome: "Agua", quantidade: 200 },
      { nome: "Leite", quantidade: 200 },
      { nome: "Acucar", quantidade: 20 },
    ],
  },
  {
    nome: "Chocolate quente caseiro",
    refeicao: "Bebida",
    tempoPreparo: 10,
    porcoes: 2,
    passos: "Aqueca o leite.\nMisture chocolate em po e acucar.\nMexa ate ficar homogeneo.",
    ingredientes: [
      { nome: "Leite", quantidade: 300 },
      { nome: "Chocolate em po", quantidade: 25 },
      { nome: "Acucar", quantidade: 20 },
    ],
  },
  {
    nome: "Limonada caseira",
    refeicao: "Bebida",
    tempoPreparo: 10,
    porcoes: 3,
    passos: "Esprema os limoes.\nMisture com agua e acucar.\nSirva imediatamente.",
    ingredientes: [
      { nome: "Limao", quantidade: 3 },
      { nome: "Agua", quantidade: 500 },
      { nome: "Acucar", quantidade: 50 },
    ],
  },
  {
    nome: "Vitamina de banana com aveia",
    refeicao: "Bebida",
    tempoPreparo: 8,
    porcoes: 2,
    passos: "Bata banana, leite, aveia e acucar.\nSirva logo em seguida.",
    ingredientes: [
      { nome: "Banana", quantidade: 2 },
      { nome: "Leite", quantidade: 300 },
      { nome: "Aveia em flocos", quantidade: 30 },
      { nome: "Acucar", quantidade: 15 },
    ],
  },
  {
    nome: "Cappuccino caseiro",
    refeicao: "Bebida",
    tempoPreparo: 10,
    porcoes: 2,
    passos: "Prepare o cafe.\nAqueca o leite com chocolate e acucar.\nMisture tudo e finalize com canela.",
    ingredientes: [
      { nome: "Cafe em po", quantidade: 20 },
      { nome: "Leite", quantidade: 250 },
      { nome: "Chocolate em po", quantidade: 10 },
      { nome: "Canela em po", quantidade: 2 },
      { nome: "Acucar", quantidade: 20 },
    ],
  },
  {
    nome: "Iogurte batido com banana",
    refeicao: "Bebida",
    tempoPreparo: 8,
    porcoes: 2,
    passos: "Bata o iogurte com banana, leite e acucar.\nSirva gelado.",
    ingredientes: [
      { nome: "Iogurte natural", quantidade: 250 },
      { nome: "Banana", quantidade: 2 },
      { nome: "Leite", quantidade: 100 },
      { nome: "Acucar", quantidade: 10 },
    ],
  },
];

function normalizeSeedKey(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildIngredientMap(ingredients) {
  return new Map(
    ingredients.map((ingredient) => [normalizeSeedKey(ingredient.nome), ingredient])
  );
}

function validateRecipeBlueprints(recipeBlueprints) {
  const seenRecipeNames = new Set();

  for (const recipe of recipeBlueprints) {
    const recipeKey = normalizeSeedKey(recipe.nome);
    if (seenRecipeNames.has(recipeKey)) {
      throw new Error(`Receita duplicada no seed expandido: ${recipe.nome}`);
    }
    seenRecipeNames.add(recipeKey);

    if (!allowedRecipeCategories.has(recipe.refeicao)) {
      throw new Error(`Categoria invalida no seed expandido: ${recipe.refeicao}`);
    }

    const ingredientNames = recipe.ingredientes.map((ingredient) =>
      normalizeSeedKey(ingredient.nome)
    );
    const uniqueIngredientNames = new Set(ingredientNames);

    if (uniqueIngredientNames.size !== ingredientNames.length) {
      throw new Error(`Ingrediente repetido dentro da receita: ${recipe.nome}`);
    }
  }
}

async function seedIngredients() {
  const existingIngredients = await ingredienteRepo.find();
  const existingIngredientKeys = new Set(
    existingIngredients.map((ingredient) => normalizeSeedKey(ingredient.nome))
  );
  const missingIngredients = ingredientCatalog.filter(
    (ingredient) => !existingIngredientKeys.has(normalizeSeedKey(ingredient.nome))
  );

  if (missingIngredients.length === 0) {
    return;
  }

  await ingredienteRepo.save(
    missingIngredients.map((ingredient) => ingredienteRepo.create(ingredient))
  );
}

async function seedUsers() {
  const existingUsers = await usuarioRepo.find({
    select: {
      email: true,
    },
  });
  const existingEmails = new Set(
    existingUsers.map((user) => normalizeSeedKey(user.email))
  );
  const missingUsers = defaultUsers.filter(
    (user) => !existingEmails.has(normalizeSeedKey(user.email))
  );

  if (missingUsers.length === 0) {
    return;
  }

  const usersToSave = await Promise.all(
    missingUsers.map(async (user) =>
      usuarioRepo.create({
        username: user.username,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        account_type: user.account_type,
      })
    )
  );

  await usuarioRepo.save(usersToSave);
}

async function seedLegacyRecipesIfDatabaseIsEmpty() {
  const recipesCount = await receitaRepo.count();
  if (recipesCount > 0) {
    return;
  }

  const [admin, ana, bruna] = await Promise.all([
    usuarioRepo.findOneByOrFail({ email: "admin@receitaspp.com" }),
    usuarioRepo.findOneByOrFail({ email: "ana@receitaspp.com" }),
    usuarioRepo.findOneByOrFail({ email: "bruna@receitaspp.com" }),
  ]);

  const ingredients = await ingredienteRepo.find();
  const ingredientByName = Object.fromEntries(
    ingredients.map((ingredient) => [ingredient.nome.toLowerCase(), ingredient])
  );

  const recipesToCreate = [
    {
      nome: "Omelete de queijo",
      passos: "Bata os ovos.\nMisture o queijo.\nLeve para a frigideira.",
      refeicao: "Cafe da manha",
      tempoPreparo: 10,
      porcoes: 2,
      status: "approved",
      autor: ana,
      ingredientes: [
        { ingrediente: ingredientByName.ovo, quantidade: 2 },
        { ingrediente: ingredientByName.queijo, quantidade: 60 },
      ],
    },
    {
      nome: "Arroz com tomate",
      passos: "Refogue o tomate.\nCozinhe com o arroz.",
      refeicao: "Almoco",
      tempoPreparo: 30,
      porcoes: 4,
      status: "pending",
      autor: bruna,
      ingredientes: [
        { ingrediente: ingredientByName.arroz, quantidade: 200 },
        { ingrediente: ingredientByName.tomate, quantidade: 80 },
      ],
    },
    {
      nome: "Panqueca simples",
      passos: "Misture tudo.\nAqueça a frigideira.\nGrelhe dos dois lados.",
      refeicao: "Lanche",
      tempoPreparo: 20,
      porcoes: 3,
      status: "rejected",
      autor: admin,
      ingredientes: [
        { ingrediente: ingredientByName.farinha, quantidade: 150 },
        { ingrediente: ingredientByName.leite, quantidade: 250 },
        { ingrediente: ingredientByName.ovo, quantidade: 2 },
      ],
    },
  ];

  for (const item of recipesToCreate) {
    const recipe = await receitaRepo.save(
      receitaRepo.create({
        nome: item.nome,
        passos: item.passos,
        refeicao: item.refeicao,
        tempoPreparo: item.tempoPreparo,
        porcoes: item.porcoes,
        status: item.status,
        autor: item.autor,
      })
    );

    const links = item.ingredientes.map((ingredient) =>
      ingredienteReceitaRepo.create({
        receita: recipe,
        ingrediente: ingredient.ingrediente,
        quantidade: ingredient.quantidade,
      })
    );

    await ingredienteReceitaRepo.save(links);
  }
}

async function seedExpandedPendingRecipes() {
  validateRecipeBlueprints(expandedPendingRecipeBlueprints);

  const [ingredients, normalUsers, existingRecipes] = await Promise.all([
    ingredienteRepo.find(),
    usuarioRepo.find({
      where: { account_type: "normal" },
      order: { id: "ASC" },
    }),
    receitaRepo.find({
      select: {
        nome: true,
      },
    }),
  ]);

  if (normalUsers.length === 0) {
    throw new Error("Nenhum usuario comum disponivel para distribuir autoria no seed.");
  }

  const ingredientByName = buildIngredientMap(ingredients);
  const existingRecipeKeys = new Set(
    existingRecipes.map((recipe) => normalizeSeedKey(recipe.nome))
  );

  for (const [index, blueprint] of expandedPendingRecipeBlueprints.entries()) {
    const recipeKey = normalizeSeedKey(blueprint.nome);
    if (existingRecipeKeys.has(recipeKey)) {
      continue;
    }

    const author = normalUsers[index % normalUsers.length];
    const ingredientLinks = blueprint.ingredientes.map((item) => {
      const ingredient = ingredientByName.get(normalizeSeedKey(item.nome));

      if (!ingredient) {
        throw new Error(
          `Ingrediente ausente no seed antes de criar a receita ${blueprint.nome}: ${item.nome}`
        );
      }

      return {
        ingrediente: ingredient,
        quantidade: item.quantidade,
      };
    });

    const recipe = await receitaRepo.save(
      receitaRepo.create({
        nome: blueprint.nome,
        passos: blueprint.passos,
        refeicao: blueprint.refeicao,
        tempoPreparo: blueprint.tempoPreparo,
        porcoes: blueprint.porcoes,
        status: "pending",
        autor: author,
      })
    );

    await ingredienteReceitaRepo.save(
      ingredientLinks.map((ingredientLink) =>
        ingredienteReceitaRepo.create({
          receita: recipe,
          ingrediente: ingredientLink.ingrediente,
          quantidade: ingredientLink.quantidade,
        })
      )
    );

    existingRecipeKeys.add(recipeKey);
  }
}

async function seedDatabase() {
  await seedIngredients();
  await seedUsers();
  await seedLegacyRecipesIfDatabaseIsEmpty();
  await seedExpandedPendingRecipes();
}

async function checkAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token ausente ou mal-formado." });
    }

    const token = authorization.slice("Bearer ".length);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await usuarioRepo.findOneBy({ id: payload.id });

    if (!user) {
      return res.status(401).json({ message: "Usuario da sessão nao encontrado." });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Sem autorização." });
  }
}

async function checkAdmin(req, res, next) {
  if (!req.user || req.user.account_type !== "superadmin") {
    return res.status(403).json({ message: "Acesso exclusivo do Superadmin." });
  }

  next();
}

async function checkRecipeOwnershipOrAdmin(req, res, next) {
  const recipe = await buildRecipeResponse(req.params.id);

  if (!recipe) {
    return res.status(404).json({ message: "Receita não encontrada." });
  }

  const isAdmin = req.user?.account_type === "superadmin";
  const isOwner = recipe.autor?.id === req.user?.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Voce não pode alterar essa receita." });
  }

  req.recipe = recipe;
  next();
}

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usuarioRepo.findOne({
      where: { email: String(email).trim().toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        account_type: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        account_type: user.account_type,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login bem sucedido.",
      token,
      usuario: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Nao foi possivel fazer login." });
  }
});

app.post("/register", async (req, res) => {
  const username = String(req.body.username ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Preencha nome, e-mail e senha." });
  }

  try {
    const existingUser = await usuarioRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Este e-mail ja esta cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await usuarioRepo.save(
      usuarioRepo.create({
        username,
        email,
        password: hashedPassword,
        account_type: "normal",
      })
    );

    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        account_type: createdUser.account_type,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Usuario registrado.",
      token,
      usuario: sanitizeUser(createdUser),
    });
  } catch (error) {
    return res.status(500).json({ message: "Nao foi possivel registrar o usuario." });
  }
});

async function handleResetPassword(req, res) {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e nova senha." });
  }

  try {
    const user = await usuarioRepo.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "Nenhuma conta foi encontrada com este e-mail." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usuarioRepo.update({ id: user.id }, { password: hashedPassword });

    return res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    return res.status(500).json({ message: "Nao foi possivel redefinir a senha." });
  }
}

app.post("/auth/reset-password", handleResetPassword);
app.post("/reset-password", handleResetPassword);

app.get("/auth/me", checkAuth, async (req, res) => {
  const user = await usuarioRepo.findOneBy({ id: req.user.id });

  if (!user) {
    return res.status(404).json({ message: "Usuario nao encontrado." });
  }

  return res.status(200).json(sanitizeUser(user));
});

app.get("/receitas", checkAuth, async (req, res) => {
  const recipes = await receitaRepo.find({
    order: { createdAt: "DESC" },
    relations: {
      autor: true,
      ingredientes: {
        ingrediente: true,
      },
    },
  });

  const visibleRecipes = req.user.account_type === "superadmin"
    ? recipes
    : recipes.filter((recipe) => canUserAccessRecipe(req.user, recipe));

  return res.status(200).json(visibleRecipes);
});

app.get("/receitas/:id", checkAuth, async (req, res) => {
  const recipe = await buildRecipeResponse(req.params.id);

  if (!recipe) {
    return res.status(404).json({ message: "Receita não encontrada." });
  }

  if (!canUserAccessRecipe(req.user, recipe)) {
    return res.status(403).json({ message: "Voce não tem acesso a esta receita." });
  }

  return res.status(200).json(recipe);
});

app.post("/receitas", checkAuth, async (req, res) => {
  try {
    const { nome, passos, refeicao, tempoPreparo, porcoes, ingredientes = [] } = req.body;

    const author = await usuarioRepo.findOneByOrFail({ id: req.user.id });
    const recipe = await receitaRepo.save(
      receitaRepo.create({
        nome,
        passos,
        refeicao,
        tempoPreparo: Number(tempoPreparo),
        porcoes: Number(porcoes),
        autor: author,
        status: "pending",
      })
    );

    if (Array.isArray(ingredientes) && ingredientes.length > 0) {
      const links = ingredientes.map((item) =>
        ingredienteReceitaRepo.create({
          receita: recipe,
          ingrediente: { id: Number(item.ingredienteId) },
          quantidade: Number(item.quantidade),
        })
      );

      await ingredienteReceitaRepo.save(links);
    }

    const createdRecipe = await buildRecipeResponse(recipe.id);
    return res.status(201).json(createdRecipe);
  } catch (error) {
    return res.status(400).json({ message: "Nao foi possivel criar a receita." });
  }
});

app.put("/receitas/:id", checkAuth, checkRecipeOwnershipOrAdmin, async (req, res) => {
  const { nome, passos, refeicao, tempoPreparo, porcoes } = req.body;
  const nextStatus = req.user.account_type === "superadmin" ? req.recipe.status : "pending";

  await receitaRepo.update(
    { id: req.recipe.id },
    {
      nome,
      passos,
      refeicao,
      tempoPreparo: Number(tempoPreparo),
      porcoes: Number(porcoes),
      status: nextStatus,
    }
  );

  return res.status(200).json(await buildRecipeResponse(req.recipe.id));
});

app.delete("/receitas/:id", checkAuth, checkRecipeOwnershipOrAdmin, async (req, res) => {
  await receitaRepo.delete({ id: req.recipe.id });
  return res.status(200).json({ message: "Receita removida com sucesso.", id: req.recipe.id });
});

app.put("/receitas/:id/ingredientes", checkAuth, checkRecipeOwnershipOrAdmin, async (req, res) => {
  const ingredientes = Array.isArray(req.body.ingredientes) ? req.body.ingredientes : [];

  await ingredienteReceitaRepo.delete({ receita: { id: req.recipe.id } });

  const links = ingredientes.map((item) =>
    ingredienteReceitaRepo.create({
      receita: { id: req.recipe.id },
      ingrediente: { id: Number(item.ingredienteId) },
      quantidade: Number(item.quantidade),
    })
  );

  if (links.length > 0) {
    await ingredienteReceitaRepo.save(links);
  }

  if (req.user.account_type !== "superadmin") {
    await receitaRepo.update({ id: req.recipe.id }, { status: "pending" });
  }

  return res.status(200).json(await buildRecipeResponse(req.recipe.id));
});

app.get("/ingredientes", checkAuth, async (_req, res) => {
  return res.status(200).json(await ingredienteRepo.find({ order: { nome: "ASC" } }));
});

app.post("/ingredientes", checkAuth, checkAdmin, async (req, res) => {
  const { nome, unidade } = req.body;
  const ingredient = await ingredienteRepo.save(ingredienteRepo.create({ nome, unidade }));
  return res.status(201).json(ingredient);
});

app.put("/ingredientes/:id", checkAuth, checkAdmin, async (req, res) => {
  const { nome, unidade } = req.body;
  await ingredienteRepo.update({ id: Number(req.params.id) }, { nome, unidade });
  return res.status(200).json(await ingredienteRepo.findOneBy({ id: Number(req.params.id) }));
});

app.delete("/ingredientes/:id", checkAuth, checkAdmin, async (req, res) => {
  await ingredienteRepo.delete({ id: Number(req.params.id) });
  return res.status(200).json({ message: "Ingrediente removido com sucesso." });
});

app.get("/admin/users", checkAuth, checkAdmin, async (_req, res) => {
  const users = await usuarioRepo.find({
    order: { createdAt: "DESC" },
    select: {
      id: true,
      username: true,
      email: true,
      account_type: true,
      createdAt: true,
    },
  });

  return res.status(200).json(users.map(sanitizeUser));
});

app.get("/admin/recipes", checkAuth, checkAdmin, async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const where = status ? { status } : {};

  const recipes = await receitaRepo.find({
    where,
    order: { createdAt: "DESC" },
    relations: {
      autor: true,
      ingredientes: {
        ingrediente: true,
      },
    },
  });

  return res.status(200).json(recipes);
});

app.patch("/admin/recipes/:id/status", checkAuth, checkAdmin, async (req, res) => {
  const status = String(req.body.status ?? "");

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status de moderacao invalido." });
  }

  const recipe = await buildRecipeResponse(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Receita nao encontrada." });
  }

  await receitaRepo.update({ id: recipe.id }, { status });
  return res.status(200).json(await buildRecipeResponse(recipe.id));
});

app.delete("/admin/recipes/:id", checkAuth, checkAdmin, async (req, res) => {
  const recipe = await buildRecipeResponse(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Receita nao encontrada." });
  }

  await receitaRepo.delete({ id: recipe.id });
  return res.status(200).json({ message: "Receita removida pelo Superadmin.", id: recipe.id });
});

app.get("/admin/dashboard", checkAuth, checkAdmin, async (_req, res) => {
  const analytics = await buildAdminAnalytics();

  return res.status(200).json({
    totalUsers: analytics.totalUsers,
    totalRecipes: analytics.totalRecipes,
    pendingRecipes: analytics.pendingRecipes,
    approvedRecipes: analytics.approvedRecipes,
    rejectedRecipes: analytics.rejectedRecipes,
    topCategories: analytics.topCategories.slice(0, 5),
    recipesByStatus: analytics.statusSummary,
  });
});

app.get("/admin/reports", checkAuth, checkAdmin, async (_req, res) => {
  const analytics = await buildAdminAnalytics();

  return res.status(200).json({
    categories: analytics.topCategories,
    authors: analytics.authorSummary,
    statuses: analytics.statusSummary,
  });
});

AppDataSource.initialize()
  .then(async () => {
    await seedDatabase();
    app.listen(PORT, HOST, (err) => {
      console.log(`Receitas++ backend executando em http://${HOST}:${PORT}/`);
      console.log(`Teste local: http://127.0.0.1:${PORT}/health`);
      console.log(`Android Emulator: http://10.0.2.2:${PORT}/health`);
      console.log(err);
    });
})
.catch((error) => {
    console.error("Falha ao iniciar o backend:", error);
});

