const logger = require('../utils/logger')

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
  logger.error(err.message)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler
}