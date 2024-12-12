import path from 'node:path';
import express, { json } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorHandler, routerNotFoundHandler } from './common/utils';
import { connect_db } from './common/db.connect';
import { checkToken } from './users/users.middleware';
import userRoutes from './users/users.router';


const app = express();
connect_db();

app.use(morgan('dev'));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(json());

app.use('/users', userRoutes);

app.use(routerNotFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log(`Listening on 3000`));
