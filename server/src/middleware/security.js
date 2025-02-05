import rateLimit from 'express-rate-limit';
import ExpressMongoSanitize from 'express-mongo-sanitize';

// Rate Limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por windowMs
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos'
  }
});

// API Key Validation
export const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'API Key inválida ou não fornecida'
    });
  }
  
  next();
};

// Request Sanitization
export const sanitizeRequest = (req, res, next) => {
  // Remove caracteres que permitem injeção de MongoDB
  ExpressMongoSanitize()(req, res, next);
};

// Security Headers
export const securityHeaders = (req, res, next) => {
  // Remove o header X-Powered-By
  res.removeHeader('X-Powered-By');
  
  // Adiciona headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
};