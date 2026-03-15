// Global Error Handler Middleware
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Axios errors (from AI API calls)
    if (err.response) {
        return res.status(err.response.status).json({
            error: 'Erro na API externa',
            details: err.response.data?.error?.message || err.message
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

// Not Found Handler
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
}

export default errorHandler;
