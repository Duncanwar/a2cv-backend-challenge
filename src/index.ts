import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { configureMiddleware } from './config/app'
import { connectDatabase, disconnectDatabase } from './config/database'
import env from './config/env'
import ErrorHandler from './middleware/errorHandler'
import routes from './router'
import swaggerSpec from './config/swagger'

const app = express()

const PORT: number | string = env.PORT

app.enable('trust proxy')

configureMiddleware(app)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec)
})

app.use('/api', routes)

app.use(ErrorHandler.handleErrors)

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase()
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error)
}

process.on('SIGINT', async () => {
  try {
    await disconnectDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Failed to disconnect from database :', error)
    process.exit(1)
  }
})

console.log(`Server is configured to run on port ${PORT}`)

export default app
