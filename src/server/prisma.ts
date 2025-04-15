import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaClient } from "@prisma/client";
import { raise } from "~/utils/errors";
import process from "node:process";

type TransactionalPrisma = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];
type PostCommitCallback = () => void | Promise<void>;

export const prisma = new PrismaClient();
const als = new AsyncLocalStorage<{
  tx: TransactionalPrisma;
  addCallback: (cb: PostCommitCallback) => void;
}>();
export const runTransaction = async <T>(scope: () => Promise<T>) => {
  const postCommitCallbacks: PostCommitCallback[] = [];

  const result = await prisma.$transaction(
    (tx) =>
      als.run({ tx, addCallback: (cb) => postCommitCallbacks.push(cb) }, scope),
    { isolationLevel: "RepeatableRead" },
  );

  process.nextTick(() => {
    void Promise.allSettled(postCommitCallbacks.map((cb) => cb()));
  });

  return result;
};

const getStore = () =>
  als.getStore() ?? raise(new Error("Not in a transaction"));

export const tx = () => getStore().tx;

export const postCommit = (cb: PostCommitCallback) =>
  getStore().addCallback(cb);

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
