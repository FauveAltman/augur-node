import * as Knex from "knex";
import Promise = require("bluebird");

exports.seed = (knex: Knex): Promise<any> => {
  // Deletes ALL existing entries
  return knex("trades").del().then((): void => {
    // Inserts seed entries
    const seedData = [{
      orderID: "0x1100000000000000000000000000000000000000000000000000000000000000",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: 0,
      shareToken: "0x1000000000000000000000000000000000000000",
      orderType: "sell",
      creator: "0x0000000000000000000000000000000000000b0b",
      filler: "0x000000000000000000000000000000000000d00d",
      blockNumber: 1400051,
      numCreatorTokens: "0",
      numCreatorShares: "0.2",
      numFillerTokens: "1.1",
      numFillerShares: "0",
      price: "5.5",
      amount: "0.2",
      settlementFees: "0",
    }];
    knex.batchInsert("trades", seedData, seedData.length);
  });
};
