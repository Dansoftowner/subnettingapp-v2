import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import authRoutes from './routes/auth.routes';
import ipv4TasksRoutes from './routes/ipv4-tasks.routes';
import config from 'config';
import errorMiddleware from './middlewares/error.middleware';
import { logger } from './logger';

const app = express();
const PORT = process.env.PORT || 5000;

const corsConfig: CorsOptions = {
  origin: process.env.NODE_ENV === 'development' || config.get('frontend.host'),
  credentials: true,
  exposedHeaders: [config.get('jwt.headerName')],
};

app.use(cors(corsConfig));
if (process.env.NODE_ENV != 'test') app.use(morgan('combined'));

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', ipv4TasksRoutes);

app.use(errorMiddleware);

if (process.env.NODE_ENV != 'test')
  mongoose
    .connect(config.get('mongo.uri'))
    .then(() => {
      logger.info('MongoDB connected');
      app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
    })
    .catch((err) => logger.error(err));

export { app };
