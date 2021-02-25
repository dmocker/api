/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, LoggerService } from '@nestjs/common'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'
import helmet from 'helmet'
import csurf from 'csurf'
import rateLimit from 'express-rate-limit'
import logger from 'morgan'
import compression from 'compression'
import { ValidationPipe } from './common/pipes/validation.pipe'

dotenv.config()

declare const module: any
const port = process.env.PORT || 4000
export class MyLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true, logger: new MyLogger() })
  app.use(helmet({ contentSecurityPolicy: false }))
  // app.use(csurf())
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 1,
  //     message: 'Too many request created from this IP, please try again after an hour.'
  //   })
  // )

  // logger.token('graphql-logger', (req) => {
  //   const { query, variables, operationName } = req.body
  //   return `graphql-logger: \n
  //   Query: ${query} \n
  //   Variables: ${JSON.stringify(variables)}
  //   `
  // })

  app.use(compression())
  app.use('/voyager', voyagerMiddleware({ endpointUrl: 'graphql' }))
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(port)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }

  Logger.log(`🚀 Server ready at http://localhost:${port}/graphql`, 'Bootstrap')
  Logger.log(`🚀 Subscriptions ready at ws://localhost:${port}/graphql`, 'Bootstrap')
}

bootstrap()
