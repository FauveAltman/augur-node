import Augur from "augur.js";
import { parallel } from "async";
import BigNumber from "bignumber.js";
import * as Knex from "knex";
import { Address, Bytes32, FormattedLog, OrdersRow, ErrorCallback, AsyncCallback } from "../../types";
import { processOrderCanceledLog } from "./order-canceled";
import { augurEmitter } from "../../events";
import { convertFixedPointToDecimal } from "../../utils/convert-fixed-point-to-decimal";
import { denormalizePrice } from "../../utils/denormalize-price";
import { formatOrderAmount, formatOrderPrice } from "../../utils/format-order";
import { WEI_PER_ETHER } from "../../constants";

interface BlocksRow {
  timestamp: number;
}

interface TokensRow {
  marketID: Address;
  outcome: number;
}

interface MarketsRow {
  minPrice: string|number;
  maxPrice: string|number;
  numTicks: string|number;
}

interface OrderCreatedOnContractData {
  orderType: string;
  price: string;
  amount: string;
  sharesEscrowed: string;
  moneyEscrowed: string;
  creator: Address;
  betterOrderID: Bytes32;
  worseOrderID: Bytes32;
}

export function processOrderCreatedLog(db: Knex, augur: Augur, trx: Knex.Transaction, log: FormattedLog, callback: ErrorCallback): void {
  trx.select(["marketID", "outcome"]).from("tokens").where({ contractAddress: log.shareToken }).asCallback((err: Error|null, tokensRows?: Array<TokensRow>): void => {
    if (err) return callback(err);
    if (!tokensRows || !tokensRows.length) return callback(new Error("market and outcome not found"));
    const { marketID, outcome } = tokensRows[0];
    trx.select(["minPrice", "maxPrice", "numTicks"]).from("markets").where({ marketID }).asCallback((err: Error|null, marketsRows?: Array<MarketsRow>): void => {
      if (err) return callback(err);
      if (!marketsRows || !marketsRows.length) return callback(new Error("market min price, max price, and/or num ticks not found"));
      const { minPrice, maxPrice, numTicks } = marketsRows[0];
      const ordersPayload = { _orderId: log.orderId };
      parallel({
        orderType: (next: AsyncCallback): void => augur.api.Orders.getOrderType(ordersPayload, next),
        price: (next: AsyncCallback): void => augur.api.Orders.getPrice(ordersPayload, next),
        amount: (next: AsyncCallback): void => augur.api.Orders.getAmount(ordersPayload, next),
        sharesEscrowed: (next: AsyncCallback): void => augur.api.Orders.getOrderSharesEscrowed(ordersPayload, next),
        moneyEscrowed: (next: AsyncCallback): void => augur.api.Orders.getOrderMoneyEscrowed(ordersPayload, next),
        betterOrderID: (next: AsyncCallback): void => augur.api.Orders.getBetterOrderId(ordersPayload, next),
        worseOrderID: (next: AsyncCallback): void => augur.api.Orders.getWorseOrderId(ordersPayload, next),
      }, (err: Error|null, onContractData: OrderCreatedOnContractData): void => {
        if (err) return callback(err);
        const { price, amount, orderType, moneyEscrowed, sharesEscrowed, betterOrderID, worseOrderID } = onContractData;
        const fullPrecisionPrice = denormalizePrice(minPrice, maxPrice, convertFixedPointToDecimal(new BigNumber(price, 16).toFixed(), numTicks));
        const fullPrecisionAmount = convertFixedPointToDecimal(new BigNumber(amount, 16).toFixed(), numTicks);
        const orderTypeLabel = parseInt(orderType, 16) === 0 ? "buy" : "sell";
        const orderData: OrdersRow = {
          marketID,
          outcome,
          shareToken: log.shareToken,
          orderCreator: log.creator,
          creationBlockNumber: log.blockNumber,
          tradeGroupID: log.tradeGroupId,
          orderType: orderTypeLabel,
          price: formatOrderPrice(orderTypeLabel, minPrice, maxPrice, fullPrecisionPrice),
          amount: formatOrderAmount(minPrice, maxPrice, fullPrecisionAmount),
          fullPrecisionPrice,
          fullPrecisionAmount,
          tokensEscrowed: convertFixedPointToDecimal(new BigNumber(moneyEscrowed, 16).toFixed(), WEI_PER_ETHER),
          sharesEscrowed: convertFixedPointToDecimal(new BigNumber(sharesEscrowed, 16).toFixed(), numTicks),
          betterOrderID,
          worseOrderID,
        };
        const orderID = { orderID: log.orderId };
        augurEmitter.emit("OrderCreated", Object.assign(orderData, orderID));
        trx.select(["marketID"]).from("orders").where(orderID).asCallback((err: Error|null, ordersRows?: any): void => {
          if (err) return callback(err);
          if (!ordersRows || !ordersRows.length) {
            db.transacting(trx).insert(Object.assign(orderData, orderID)).into("orders").asCallback(callback);
          } else {
            db.transacting(trx).from("orders").where(orderID).update(orderData).asCallback(callback);
          }
        });
      });
    });
  });
}

export function processOrderCreatedLogRemoval(db: Knex, augur: Augur, trx: Knex.Transaction, log: FormattedLog, callback: ErrorCallback): void {
  augurEmitter.emit("OrderCreated", log);
  processOrderCanceledLog(db, augur, trx, log, callback);
}
