const placeholderRouter = require('express').Router()

placeholderRouter.get('/', async (req, res) => {
  res.json({
    message: 'graphql endpoint lives at /graphql',
  })
})

module.exports = placeholderRouter
