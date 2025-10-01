import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middleware/error';

dotenv.config();
const app = express();

const ORIGIN = process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'];
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use('/api', routes);
app.use(errorHandler);

export default app;
