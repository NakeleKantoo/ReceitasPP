import { EntitySchema } from "typeorm";

export const Usuario = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    email: {
      type: "text",
      unique: true,
    },
    username: {
      type: "text",
      unique: false,
    },
    password: {
      type: "text",
      select: false
    },
    account_type: {
      type: 'text'
    },
    created_at: {
      type: "date",
    },
  },
  relations: {
    favoritos: {
      type: 'many-to-many',
      target: 'Receita',
      inverseSide: 'usuarios',
      joinTable: true,
    }
  }
});