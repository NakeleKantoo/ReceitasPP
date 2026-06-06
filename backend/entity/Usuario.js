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
    },
    password: {
      type: "text",
      select: false,
    },
    account_type: {
      type: "text",
      default: "normal",
    },
    createdAt: {
      name: "created_at",
      type: "datetime",
      createDate: true,
    },
  },
  relations: {
    favoritos: {
      type: "many-to-many",
      target: "Receita",
      inverseSide: "usuarios",
      joinTable: true,
    },
  },
});
