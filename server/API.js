import { Random } from 'meteor/random';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export class API {
  static init(settings = {}, logger) {
    logger.info('MICROSERVICE - API init');

    const app = express();
    app.use(cors());
    app.use(express.json({ limit: settings.maxPayload || '500kb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(rateLimit({
      windowMs: 1000,
      max: settings.rateLimit || 200,
    }));

    // Set headers
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      if (req.method === 'OPTIONS') res.sendStatus(200);
      else next();
    });

    // Debugging log
    app.all('/api/*', (req, res, next) => {
      req.id = Random.id();
      const query = req.query && Object.keys(req.query).length && JSON.stringify(req.query);
      const body = req.body && Object.keys(req.body).length && JSON.stringify(req.body);
      let log = `MICROSERVICE - request ID: ${req.id} - ${req.method} - ${req.originalUrl}`;
      if (query) log += ` - query: ${query}`;
      if (body) log += ` - body: ${body}`;
      logger.debug(log);
      next();
    });

    // const sendError = (req, res, msg, code = 400) => {
    //   logger.debug(`MICROSERVICE - request ID: ${req.id} - error: ${msg} - code: ${code}`);
    //   const data = { success: false, message: msg };
    //   res.status(code).json(data);
    // };

    const sendSuccess = (req, res, data) => {
      logger.debug(`MICROSERVICE - request ID: ${req.id} - ${req.originalUrl} - response: ${JSON.stringify(data)}`);
      res.json(data);
    };

    app.get('/api/health', (req, res) => {
      const version = settings.version || 'v0.0.0';
      sendSuccess(req, res, { success: true, data: version });
    });

    WebApp.connectHandlers.use(app);
  }
}
