import { PostgresStore } from "@mastra/pg";

const storage = new PostgresStore({
	connectionString: process.env.DATABASE_URL!,
});

export { storage };
