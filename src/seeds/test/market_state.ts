import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  // Deletes ALL existing entries
  return knex("market_state").del().then((): void => {
    // Inserts seed entries
    knex.batchInsert("market_state", [{
      marketStateID: 1,
      marketID: "0x0000000000000000000000000000000000000001",
      reportingState: "DESIGNATED_REPORTING",
      blockNumber: 1400000,
    }, {
      marketStateID: 2,
      marketID: "0x0000000000000000000000000000000000000002",
      reportingState: "DESIGNATED_REPORTING",
      blockNumber: 1400001,
    }, {
      marketStateID: 3,
      marketID: "0x0000000000000000000000000000000000000003",
      reportingState: "DESIGNATED_REPORTING",
      blockNumber: 1400002,
    }, {
      marketStateID: 4,
      marketID: "0x0000000000000000000000000000000000000011",
      reportingState: "FIRST_REPORTING",
      blockNumber: 1400002,
    }], 1000);
  });
};
