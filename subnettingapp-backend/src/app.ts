import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import config from 'config';
import errorMiddleware from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(authRoutes);

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
