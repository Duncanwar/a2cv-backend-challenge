import 'dotenv/config'

const { PORT, NODE_ENV, DATABASE_URL, JWT_KEY, API_BASE_URL, ALLOWED_ORIGINS } =
  process.env

interface Config {
  PORT: number | string
  NODE_ENV?: string
  DATABASE_URL?: string
  JWT_KEY?: string
  API_BASE_URL?: string
  ALLOWED_ORIGINS?: string[]
}

const config: Config = {
  PORT: PORT || 5000,
  NODE_ENV,
  DATABASE_URL,
  JWT_KEY,
  API_BASE_URL,
  ALLOWED_ORIGINS: ALLOWED_ORIGINS?.split(','),
}

export default config
