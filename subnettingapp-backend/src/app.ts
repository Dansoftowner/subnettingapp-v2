import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import authRoutes from './routes/auth.routes';
import config from 'config';
import errorMiddleware from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

const corsConfig: CorsOptions = {
  origin: process.env.NODE_ENV === 'development' || config.get('frontend.host'),
  credentials: true,
  exposedHeaders: [config.get('jwt.headerName')],
};

app.use(cors(corsConfig));
app.use(morgan('combined'));

app.use(express.json());
app.use('/api', authRoutes);

app.use(errorMiddleware);

mongoose
  .connect(config.get('mongo.uri'))
  .then(() => {
    console.log('MongoDB connected');
    if (process.env.NODE_ENV != 'test')
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));

export { app };
