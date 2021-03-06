import * as _ from "lodash";
import * as Knex from "knex";
import { Address, Bytes32, OrdersRow } from "../../types";
import { queryModifier } from "./database";

interface Order {
  shareToken: Address;
  owner: Address;
  creationTime: number;
  creationBlockNumber: number;
  price: number|string;
  amount: number|string;
  fullPrecisionPrice: number|string;
  fullPrecisionAmount: number|string;
  tokensEscrowed: number|string;
  sharesEscrowed: number|string;
  betterOrderID: Bytes32|null;
  worseOrderID: Bytes32|null;
}

interface Orders {
  [marketID: string]: {
    [outcome: number]: {
      [orderType: string]: {
        [orderID: string]: Order;
      };
    };
  };
}

interface OrdersRowWithCreationTime extends OrdersRow {
  creationTime: number;
}

// market, outcome, creator, orderType, limit, sort
export function getOpenOrders(db: Knex, universe: Address|null, marketID: Address|null, outcome: number|null, orderType: string|null, creator: Address|null, sortBy: string|null|undefined, isSortDescending: boolean|null|undefined, limit: number|null|undefined, offset: number|null|undefined, callback: (err: Error|null, result?: any) => void): void {
  if (universe == null && marketID == null) return callback(new Error("Must provide universe, either via universe or marketID"));
  const queryData: {} = _.omitBy({
    marketID,
    outcome,
    orderType,
    orderCreator: creator,
  }, _.isNull);
  let query: Knex.QueryBuilder = db.select(["orders.*", `blocks.timestamp as creationTime`]).from("orders").leftJoin("blocks", "orders.creationBlockNumber", "blocks.blockNumber").where(queryData).whereNull("isRemoved");
  query = queryModifier(query, "volume", "desc", sortBy, isSortDescending, limit, offset);
  query.asCallback((err: Error|null, ordersRows?: Array<OrdersRowWithCreationTime>): void => {
    if (err) return callback(err);
    if (!ordersRows || !ordersRows.length) return callback(null);
    const orders: Orders = {};
    ordersRows.forEach((row: OrdersRowWithCreationTime): void => {
      if (!orders[row.marketID]) orders[row.marketID] = {};
      if (!orders[row.marketID][row.outcome]) orders[row.marketID][row.outcome] = {};
      if (!orders[row.marketID][row.outcome][row.orderType]) orders[row.marketID][row.outcome][row.orderType] = {};
      orders[row.marketID][row.outcome][row.orderType][row.orderID!] = {
        shareToken: row.shareToken,
        owner: row.orderCreator,
        creationTime: row.creationTime,
        creationBlockNumber: row.creationBlockNumber,
        price: row.price,
        amount: row.amount,
        fullPrecisionPrice: row.fullPrecisionPrice,
        fullPrecisionAmount: row.fullPrecisionAmount,
        tokensEscrowed: row.tokensEscrowed,
        sharesEscrowed: row.sharesEscrowed,
        betterOrderID: row.betterOrderID,
        worseOrderID: row.worseOrderID,
      };
    });
    callback(null, orders);
  });
}
