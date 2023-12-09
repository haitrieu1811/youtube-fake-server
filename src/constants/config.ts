import { config } from 'dotenv'
config()

export const ENV_CONFIG = {
  PORT: process.env.PORT as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_ACCOUNTS_COLLECTION_NAME: process.env.DB_ACCOUNTS_COLLECTION_NAME as string
} as const
