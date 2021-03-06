import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  // Deletes ALL existing entries
  return knex("orders").del().then((): void => {
    // Inserts seed entries
    const seedData = [{
      orderID: "0x1000000000000000000000000000000000000000000000000000000000000000",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: 0,
      shareToken: "0x1000000000000000000000000000000000000000",
      orderType: "buy",
      orderCreator: "0x0000000000000000000000000000000000000b0b",
      creationBlockNumber: 1400001,
      price: 0.7,
      amount: 1,
      fullPrecisionPrice: 0.7,
      fullPrecisionAmount: 1,
      tokensEscrowed: 0.7,
      sharesEscrowed: 0,
      betterOrderID: null,
      worseOrderID: null,
    }, {
      orderID: "0x2000000000000000000000000000000000000000000000000000000000000000",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: 0,
      shareToken: "0x1000000000000000000000000000000000000000",
      orderType: "buy",
      orderCreator: "0x000000000000000000000000000000000000d00d",
      creationBlockNumber: 1400002,
      price: 0.6,
      amount: 2,
      fullPrecisionPrice: 0.600001,
      fullPrecisionAmount: 2,
      tokensEscrowed: 1.200002,
      sharesEscrowed: 0,
      betterOrderID: null,
      worseOrderID: null,
    }, {
      orderID: "0x3000000000000000000000000000000000000000000000000000000000000000",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: 1,
      shareToken: "0x2000000000000000000000000000000000000000",
      orderType: "buy",
      orderCreator: "0x000000000000000000000000000000000000d00d",
      creationBlockNumber: 1400002,
      price: 0.6,
      amount: 2,
      fullPrecisionPrice: 0.6,
      fullPrecisionAmount: 2.0000001,
      tokensEscrowed: 1.20000006,
      sharesEscrowed: 0,
      betterOrderID: null,
      worseOrderID: null,
    }, {
      orderID: "0x4000000000000000000000000000000000000000000000000000000000000000",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: 1,
      shareToken: "0x2000000000000000000000000000000000000000",
      orderType: "sell",
      orderCreator: "0x000000000000000000000000000000000000d00d",
      creationBlockNumber: 1400002,
      price: 0.6,
      amount: 2,
      fullPrecisionPrice: 0.6,
      fullPrecisionAmount: 2,
      tokensEscrowed: 1.2,
      sharesEscrowed: 0,
      betterOrderID: null,
      worseOrderID: null,
    }];
    knex.batchInsert("orders", seedData, seedData.length);
  });
};
