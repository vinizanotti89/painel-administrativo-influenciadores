import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pkg from 'prom-client';
const { Registry, collectDefaultMetrics, Counter } = pkg;
import { swaggerDocs } from './config/swagger.js';
import { connectRedis } from './config/redis.js';
import { limiter, validateApiKey, sanitizeRequest, securityHeaders } from './middleware/security.js';
import { httpLogger } from './config/logger.js';
import influencerRoutes from './routes/influencerRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import { errorHandler } from './middleware/error.js';
import { initializeMonitoring, requestMonitoring, httpRequestDuration } from './config/monitoring.js';

dotenv.config();

const app = express();

// Configuração do Prometheus
const register = new Registry();

// Coletar métricas padrão com configurações mais robustas
collectDefaultMetrics({
  app: 'influencer-dashboard',
  prefix: 'node_',
  timeout: 10000,
  register,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Buckets personalizados para GC
});

// Métricas customizadas
const totalRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(totalRequests);

// Endpoint para métricas do Prometheus com tratamento de erro melhorado
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    console.error('Erro ao coletar métricas:', err);
    res.status(500).end(err.toString());
  }
});

// Initialize monitoring
initializeMonitoring();

// Middleware para métricas
app.use(requestMonitoring);

// Middlewares básicos
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(limiter);
app.use(validateApiKey);
app.use(sanitizeRequest);
app.use(securityHeaders);
app.use(httpLogger);

// Rotas da API
app.use('/api/influencers', influencerRoutes);
app.use('/api/claims', claimRoutes);

// Error handling
app.use(errorHandler);

// Configuração do mongoose com opções explícitas
const connectDB = async () => {
  try {
    console.info(`Tentando conectar ao MongoDB com URI: ${process.env.MONGODB_URI || 'undefined'}`);

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }

    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.info('📦 Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);

    console.debug('Variáveis de ambiente disponíveis:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI,
    });

    setTimeout(connectDB, 5000);
  }
};

// Event listeners do mongoose
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado. Tentando reconectar...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('Erro na conexão MongoDB:', err);
});

mongoose.connection.on('connected', () => {
  console.info('MongoDB conectado com sucesso');
});

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    console.info('🚀 Conexão com Redis estabelecida');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, '0.0.0.0', () => {
      console.info(`🌍 Servidor rodando na porta ${PORT}`);
      swaggerDocs(app, PORT);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export { app, connectDB };