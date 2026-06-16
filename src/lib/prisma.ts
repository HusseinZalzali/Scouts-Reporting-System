import { PrismaClient, Prisma } from "@prisma/client";

// Transient connection errors worth retrying (e.g. a cold Supabase pooler).
const RETRYABLE = new Set(["P1001", "P1002", "P1008", "P1017"]);

function isRetryable(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE.has(err.code))
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Retry transient connection failures with short backoff (300ms, 800ms, 1500ms).
  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        const delays = [300, 800, 1500];
        let lastErr: unknown;
        for (let attempt = 0; attempt <= delays.length; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            lastErr = err;
            if (attempt < delays.length && isRetryable(err)) {
              await sleep(delays[attempt]);
              continue;
            }
            throw err;
          }
        }
        throw lastErr;
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrisma | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
