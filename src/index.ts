import { initContextCache } from '@pothos/core'
import 'dotenv/config'

import { ApolloServer } from 'apollo-server-express'
import express, { Request } from 'express'
import { decodeAuthHeader } from './utils/auth'

import { createServer } from 'http'
import { schema } from './graphql/index'

const startServer = async () => {
  const app = express()
  const httpServer = createServer(app)

  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    introspection: true,
    context: ({ req }: { req: Request }) => {
      const userId =
        req && req.headers.authorization
          ? decodeAuthHeader(req.headers.authorization)
          : undefined

      return {
        ...initContextCache(),
        userId,
      }
    },
  })

  await apolloServer.start()

  apolloServer.applyMiddleware({
    app,
    path: '/api',
  })

  httpServer.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(`Server listening on localhost:4000`)
  })
}

startServer()
