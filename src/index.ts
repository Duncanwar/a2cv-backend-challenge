import express from 'express'
import { configureMiddleware } from './v1/config/app'
// import { connectDatabase, disconnectDatabase } from './config/database'
import env from './v1/config/env'
import ErrorHandler from './v1/middleware/errorHandler'
// import routes from './router'

const app = express()

const PORT: number | string = env.PORT

app.enable('trust proxy')

configureMiddleware(app)

// app.use('/api', routes)

app.use(ErrorHandler.handleErrors)

// const startServer = async (): Promise<void> => {
//   try {
//     await connectDatabase()
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`)
//     })
//   } catch (error) {
//     console.error('Failed to start server:', error)
//     process.exit(1)
//   }
// }

// startServer().catch(console.error)

// process.on('SIGINT', async () => {
//   try {
//     await disconnectDatabase()
//     process.exit(0)
//   } catch (error) {
//     console.error('Failed to disconnect from database :', error)
//     process.exit(1)
//   }
// })

console.log(`Server is configured to run on port ${PORT}`)

export default app
