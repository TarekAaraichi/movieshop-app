// prisma.config.ts
import { defineDatasource } from "prisma-config-helper";

export default defineDatasource({
  url: process.env.DATABASE_URL,
});
