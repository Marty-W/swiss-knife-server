import 'dotenv/config'

import { ApolloServer } from 'apollo-server'
import { decodeAuthHeader } from './utils/auth'

import { Request } from 'express'
import { schema } from './graphql/index'

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: 'bounded',
  introspection: true,
  context: ({ req }: { req: Request }) => {
    const { authorization } = req.headers

    const userId = authorization ? decodeAuthHeader(authorization) : null

    return {
      userId,
    }
  },
})

const port = 4000

server.listen({ port }).then(({ url }) => {
  console.log(`🌍 Server ready at ${url}`)
})
