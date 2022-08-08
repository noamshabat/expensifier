import { Transaction } from "../shared.types";

export type RawTransaction = Omit<Transaction, 'category'>