import { initContextCache } from '@pothos/core'
import 'dotenv/config'

import { ApolloServer } from 'apollo-server-lambda'
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

// server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
//   console.log(`
//   🚀  Server is ready at ${url}
//   📭  Query at https://studio.apollographql.com/dev
// `)
// })

exports.handler = server.createHandler()
