const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'ValidationError') {
        return response.status(400).send({ error: 'ValidationError' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: error.message })
    } else if (error.name === 'CastError') {
        return response.status(401).json({ error: 'malformated id' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'token expired' })
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', '')
        request.token = token
    }
    next()
}

module.exports = { unknownEndpoint, errorHandler, tokenExtractor }