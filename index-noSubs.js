const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const http = require('http')
const placeholderRouter = require('./controllers/placeholder')

const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const User = require('./models/user')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const config = require('./utils/config')

console.log('Connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const start = async () => {
  const app = express()
  app.use('/', placeholderRouter)
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(auth.substring(7), config.SECRET)
        const currentUser = await User.findById(decodedToken.id).populate(
          'friends'
        )
        return { currentUser }
      }
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  server.applyMiddleware({
    app,
    path: '/graphql',
  })

  const PORT = 4000

  httpServer.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`)
  })
}

start()

//apollo-server (no express)
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async ({ req }) => {
//     const auth = req ? req.headers.authorization : null
//     if (auth && auth.toLowerCase().startsWith('bearer')) {
//       const decodedToken = jwt.verify(auth.substring(7), config.SECRET)
//       const currentUser = await User.findById(decodedToken.id).populate(
//         'friends'
//       )
//       return { currentUser }
//     }
//   },
// })

// server.listen().then(({ url }) => {
//   console.log(`Server ready at ${url}`)
// })
