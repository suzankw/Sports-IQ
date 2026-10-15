import { Router } from 'express';
import * as auth from '../controllers/auth.js';
import * as competitions from '../controllers/competitions.js';
import { crudController } from '../controllers/crud.js';
import * as matches from '../controllers/matches.js';
import * as sports from '../controllers/sports.js';
import * as teamSeasons from '../controllers/teamSeasons.js';
import * as uploads from '../controllers/uploads.js';
import * as users from '../controllers/users.js';
import { competitionService } from '../services/competitions.js';
import { playerService } from '../services/players.js';
import { schoolService } from '../services/schools.js';
import { seasonService } from '../services/seasons.js';
import { teamService } from '../services/teams.js';
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
apiRouter.get('/sports/:sport/overview', sports.overview);

mountCrud(apiRouter, '/seasons', crudController(seasonService));
mountCrud(apiRouter, '/schools', crudController(schoolService));
mountCrud(apiRouter, '/competitions', crudController(competitionService));
mountCrud(apiRouter, '/teams', crudController(teamService));
mountCrud(apiRouter, '/players', crudController(playerService));

apiRouter.get('/matches', matches.list);
apiRouter.post('/matches', matches.create);
apiRouter.get('/matches/:id', matches.get);
apiRouter.patch('/matches/:id', matches.update);
apiRouter.delete('/matches/:id', matches.remove);
apiRouter.put('/matches/:id/result', matches.result);

apiRouter.get('/team-seasons', teamSeasons.list);
apiRouter.post('/team-seasons', teamSeasons.create);
apiRouter.get('/team-seasons/:id', teamSeasons.get);
apiRouter.patch('/team-seasons/:id', teamSeasons.update);
apiRouter.delete('/team-seasons/:id', teamSeasons.remove);
apiRouter.put('/team-seasons/:id/squad', teamSeasons.squad);
apiRouter.get('/team-seasons/:id/stats', teamSeasons.stats);

apiRouter.get('/competitions/:id/standings', competitions.standings);

apiRouter.get('/users', users.list);
apiRouter.post('/users', users.create);
apiRouter.patch('/users/:id', users.update);
apiRouter.post('/users/:id/password-reset', users.passwordReset);

apiRouter.post('/uploads', uploads.create);
