import * as Knex from "knex";

exports.up = async (knex: Knex): Promise<any> => {
  return knex.schema.dropTableIfExists("reports").then( (): PromiseLike<any> => {
    return knex.schema.createTable("reports", (table: Knex.CreateTableBuilder): void => {
      table.increments("reportID").primary().notNullable();
      table.string("reporter", 66).notNullable();
      table.string("marketID", 66).notNullable();
      table.string("stakeToken", 42).notNullable();
      table.specificType("amountStaked", "NUMERIC");
    });
  });
};

exports.down = async (knex: Knex): Promise<any> => {
  return knex.schema.dropTableIfExists("reports");
};
