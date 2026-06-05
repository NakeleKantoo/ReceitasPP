import { DataSource } from "typeorm";
import { Ingrediente } from "./entity/Ingrediente.js";
import { Receita } from "./entity/Receita.js";
import { Usuario } from "./entity/Usuario.js";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "./receitas.db",
  synchronize: true,
  logging: true,
  entities: [Usuario, Receita, Ingrediente],
});