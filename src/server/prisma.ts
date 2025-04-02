import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaClient } from "@prisma/client";
import { raise } from "~/utils/errors";

type TransactionalPrisma = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export const prisma = new PrismaClient();
const als = new AsyncLocalStorage<TransactionalPrisma>();
export const runTransaction = <T>(scope: () => Promise<T>) =>
  prisma.$transaction((tx) => als.run(tx, scope), {
    isolationLevel: "RepeatableRead",
  });

export const tx = () =>
  als.getStore() ?? raise(new Error("Not in a transaction"));

const ROLLBACK = Symbol("ROLLBACK");

export const rollback = (): never => {
  throw ROLLBACK;
};

export interface Transaction {
  run<T>(tag: string, scope: () => Promise<T>): Promise<T>;
}

export class PrismaTransaction implements Transaction {
  async run<T>(tag: string, scope: () => Promise<T>): Promise<T> {
    const before = Date.now();
    try {
      return await runTransaction(scope);
    } finally {
      console.log(`Transaction ${tag} took ${Date.now() - before}ms`);
    }
  }
}
