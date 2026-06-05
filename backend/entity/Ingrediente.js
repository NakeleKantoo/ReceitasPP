import { EntitySchema } from "typeorm";

export const Ingrediente = new EntitySchema({
  name: "Ingrediente",
  tableName: "ingredientes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nome: {
      type: "text",
    },
    unidade: {
        type: 'text',
    }
  },
});