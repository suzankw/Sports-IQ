import { Router } from 'express';
import * as auth from '../controllers/auth.js';
import * as competitions from '../controllers/competitions.js';
import { crudController } from '../controllers/crud.js';
import * as matches from '../controllers/matches.js';
import * as sports from '../controllers/sports.js';
import * as teamSeasons from '../controllers/teamSeasons.js';
import { schoolService } from '../services/schools.js';
import { seasonService } from '../services/seasons.js';
import { loginLimiter } from '../middleware/loginLimiter.js';
import { mountCrud } from './crud.js';

// URL → controller. Authentication is mounted once in app.js; authorization lives in the services.
export const apiRouter = Router();

apiRouter.post('/auth/login', loginLimiter, auth.login);
apiRouter.post('/auth/logout', auth.logout);
apiRouter.get('/auth/me', auth.me);
apiRouter.patch('/auth/me', auth.updateMe);
apiRouter.post('/auth/password', auth.changePassword);

apiRouter.get('/sports', sports.list);
apiRouter.post('/sports', sports.create);
apiRouter.get('/sports/:sport', sports.get);
apiRouter.patch('/sports/:sport', sports.update);

mountCrud(apiRouter, '/seasons', crudController(seasonService));
mountCrud(apiRouter, '/schools', crudController(schoolService));

apiRouter.get('/matches', matches.list);
apiRouter.get('/matches/:id', matches.get);

apiRouter.get('/team-seasons', teamSeasons.list);
apiRouter.get('/team-seasons/:id', teamSeasons.get);
apiRouter.get('/team-seasons/:id/stats', teamSeasons.stats);

apiRouter.get('/competitions/:id/standings', competitions.standings);
