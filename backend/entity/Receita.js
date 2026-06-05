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
      type: "text"
    },
    tempoPreparo: {
      type: 'int'
    },
    porcoes: {
      type: 'float'
    },
    createdAt: {
      type: 'date',
      createDate: true
    }
  },
  relations: {
    usuarios: {
      type: 'many-to-many',
      target: 'Usuario',
      inverseSide: 'favoritos'
    },
    autor: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'autorId' },
      onDelete: "CASCADE"
    },
    ingredientes: {
      type: "one-to-many",
      target: "IngredienteReceita",
      inverseSide: "receita" 
    }
  }
});