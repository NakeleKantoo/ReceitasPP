import { EntitySchema } from "typeorm";

export const IngredienteReceita = new EntitySchema({
  name: "IngredienteReceita",
  tableName: "ingrediente_receita",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    quantidade: {
      type: "float",
      default: 0
    }
  },
  relations: {
    receita: {
        type: 'many-to-one',
        target: 'Receita',
        joinColumn: { name: 'receitaId'},
        onDelete: "CASCADE"
    },
    ingrediente: {
        type: 'many-to-one',
        target: 'Ingrediente',
        joinColumn: { name: 'ingredienteId'},
        onDelete: "CASCADE"
    },
  }
});