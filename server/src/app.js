import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pkg from 'prom-client';
const { Registry, collectDefaultMetrics, Counter, Histogram } = pkg;
import { swaggerDocs } from './config/swagger.js';
import { connectRedis } from './config/redis.js';
import { limiter, validateApiKey, sanitizeRequest, securityHeaders } from './middleware/security.js';
import { httpLogger } from './config/logger.js';
import influencerRoutes from './routes/influencerRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import { errorHandler } from './middleware/error.js';
import { initializeMonitoring, requestMonitoring } from './config/monitoring.js';

dotenv.config();

const app = express();

// Configuração do Prometheus
const register = new Registry();

// Coletar métricas padrão
collectDefaultMetrics({
  app: 'influencer-dashboard',
  prefix: 'node_',
  timeout: 10000,
  register
});

// Métricas customizadas
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const totalRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(totalRequests);

// Endpoint para métricas do Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err);
  }
});

// Middleware para métricas
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, code: res.statusCode });
    totalRequests.inc({ method: req.method, route: req.route?.path || req.path, code: res.statusCode });
  });
  next();
});

// Middlewares básicos
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(limiter);
app.use(sanitizeRequest);
app.use(securityHeaders);
app.use(httpLogger);

// Rotas da API
app.use('/api/influencers', influencerRoutes);
app.use('/api/claims', claimRoutes);

// Error handling
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Conectado ao MongoDB');

    await connectRedis();
    console.log('🚀 Conexão com Redis estabelecida');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌍 Servidor rodando na porta ${PORT}`);
      swaggerDocs(app, PORT);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;