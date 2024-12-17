import path from 'node:path';
import express, { json } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorHandler, routerNotFoundHandler } from './common/utils';
import { connect_db } from './common/db.connect';
import userRoutes from './users/users.router';
import resourceRoutes from './resources/resources.router';
import chatRoutes from './resources/chat.router'


const app = express();
const port = process.env.PORT || 3000;
connect_db();

app.use(morgan('dev'));
app.use(cors());
app.use(json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/users', userRoutes);
app.use('/resources', resourceRoutes);
app.use('/chat', chatRoutes);

app.use(routerNotFoundHandler);
app.use(errorHandler);

app.listen(port, () => console.log(`Listening on 3000`));
