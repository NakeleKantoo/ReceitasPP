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
const PORT = 3069;
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

async function seedIngredients() {
  const ingredientsCount = await ingredienteRepo.count();
  if (ingredientsCount > 0) {
    return;
  }

  await ingredienteRepo.save([
    { nome: "Arroz", unidade: "g" },
    { nome: "Feijao", unidade: "g" },
    { nome: "Ovo", unidade: "un" },
    { nome: "Leite", unidade: "ml" },
    { nome: "Farinha", unidade: "g" },
    { nome: "Tomate", unidade: "g" },
    { nome: "Queijo", unidade: "g" },
    { nome: "Frango", unidade: "g" },
  ]);
}

async function seedUsers() {
  const usersCount = await usuarioRepo.count();
  if (usersCount > 0) {
    return;
  }

  const [adminPassword, userPassword, secondUserPassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("123456", 10),
    bcrypt.hash("123456", 10),
  ]);

  await usuarioRepo.save([
    {
      username: "Super Admin",
      email: "admin@receitaspp.com",
      password: adminPassword,
      account_type: "superadmin",
    },
    {
      username: "Ana Souza",
      email: "ana@receitaspp.com",
      password: userPassword,
      account_type: "normal",
    },
    {
      username: "Bruna Costa",
      email: "bruna@receitaspp.com",
      password: secondUserPassword,
      account_type: "normal",
    },
  ]);
}

async function seedRecipes() {
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

async function seedDatabase() {
  await seedIngredients();
  await seedUsers();
  await seedRecipes();
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
      return res.status(401).json({ message: "Usuario da sessao nao encontrado." });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Sem autorizacao." });
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
    return res.status(404).json({ message: "Receita nao encontrada." });
  }

  const isAdmin = req.user?.account_type === "superadmin";
  const isOwner = recipe.autor?.id === req.user?.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Voce nao pode alterar essa receita." });
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
    return res.status(404).json({ message: "Receita nao encontrada." });
  }

  if (!canUserAccessRecipe(req.user, recipe)) {
    return res.status(403).json({ message: "Voce nao tem acesso a esta receita." });
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
    app.listen(PORT, HOST, () => {
      console.log(`Receitas++ backend executando em http://${HOST}:${PORT}/`);
      console.log(`Teste local: http://127.0.0.1:${PORT}/health`);
      console.log(`Android Emulator: http://10.0.2.2:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar o backend:", error);
  });
