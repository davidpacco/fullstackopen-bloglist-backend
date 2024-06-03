const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
  logger.error(err.message)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  } else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
    return res.status(400).json({ error: 'expected `username` to be unique' })
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  }

  next(err)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('Authorization')

  if (authorization && authorization.startsWith('Bearer')) {
    req.token = authorization.replace('Bearer ', '')
  }

  next()
}

const userExtractor = async (req, res, next) => {
  const authorization = req.get('Authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '')
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'invalid token' })
    }

    req.user = await User.findById(decodedToken.id)
  }

  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}