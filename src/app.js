import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import appRoutes from './routes/index.js';
import { PATHS } from './constants/api.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(PATHS.API, appRoutes);

app.use(errorHandler);

export default app;
