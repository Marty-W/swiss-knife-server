import { initContextCache } from '@pothos/core'
import 'dotenv/config'

import { ApolloServer } from 'apollo-server'
import { Request } from 'express'
import { decodeAuthHeader } from './utils/auth'

import { schema } from './graphql/index'

const server = new ApolloServer({
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

const port = 4000

server.listen({ port }).then(({ url }) => {
  console.log(`🌍 Server ready at ${url}`)
})
