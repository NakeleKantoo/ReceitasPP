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
  },
  relations: {
    ingredientes: {
        type: 'many-to-many',
        target: 'Ingrediente',
        inverseSide: 'receitas',
    },
    usuarios: {
      type: 'many-to-many',
      target: 'Usuario',
      inverseSide: 'favoritos'
    },
    autor: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColum: { name: 'autor_id'},
      onDelete: "CASCADE"
    }
  }
});