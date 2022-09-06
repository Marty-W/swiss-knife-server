import 'dotenv/config'

import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-lambda'
import { decodeAuthHeader } from './utils/auth'

import { schema } from './graphql/index'

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: 'bounded',
  context: ({ event, context, express }) => {
    context.callbackWaitsForEmptyEventLoop = false

    const { authorization } = express.req.headers

    const userId = authorization ? decodeAuthHeader(authorization) : null

    return {
      userId,
    }
  },
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
})

exports.graphqlHandler = server.createHandler()
