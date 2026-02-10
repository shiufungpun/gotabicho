import {defineConfig} from "drizzle-kit";

export default defineConfig({
    dialect: 'sqlite', // 'mysql' | 'postgresql' | 'turso'
    schema: './src/db/schema.ts'
})
