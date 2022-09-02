import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'
import ValidationPlugin from '@pothos/plugin-validation'
import { DateTimeResolver } from 'graphql-scalars'
import { prisma } from './db'
import type PrismaTypes from './prisma/pothos-types'

type Context = {
  userId: string | null
}

export const builder = new SchemaBuilder<{
  Context: Context
  AuthScopes: {
    loggedIn: boolean
  }
  PrismaTypes: PrismaTypes
  Scalars: {
    DateTime: {
      Output: Date
      Input: Date
    }
  }
  AuthContexts: {
    loggedIn: Context & { userId: string }
  }
}>({
  plugins: [
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    ValidationPlugin,
    PrismaPlugin,
  ],
  prisma: {
    client: prisma,
  },
  authScopes: async ({ userId }) => ({
    loggedIn: !!userId,
  }),
})

builder.queryType({})
builder.mutationType({})

builder.addScalarType('DateTime', DateTimeResolver, {})
