import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../../currentSchema";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  },
  schema,
});
export { db };
