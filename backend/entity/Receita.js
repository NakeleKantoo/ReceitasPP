import { EntitySchema } from "typeorm";

export const Receita = new EntitySchema({
  name: "Receita",
  tableName: "receitas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nome: {
      type: "text",
    },
    passos: {
      type: "text",
    },
    refeicao: {
      type: "text",
    },
    tempoPreparo: {
      type: "int",
    },
    porcoes: {
      type: "float",
    },
    status: {
      type: "text",
      default: "pending",
    },
    createdAt: {
      name: "created_at",
      type: "datetime",
      createDate: true,
    },
  },
  relations: {
    usuarios: {
      type: "many-to-many",
      target: "Usuario",
      inverseSide: "favoritos",
    },
    autor: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: { name: "autorId" },
      onDelete: "SET NULL",
      nullable: true,
    },
    ingredientes: {
      type: "one-to-many",
      target: "IngredienteReceita",
      inverseSide: "receita",
      cascade: true,
    },
  },
});
