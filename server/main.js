import { Meteor } from 'meteor/meteor';
import winston from 'winston';
import { presets } from 'winston-humanize-formatter';
import { API } from './API';

Meteor.startup(() => {
  const logger = winston.createLogger({
    level: Meteor.settings.logLevel || 'info',
    format: presets.cli.dev,
    transports: [new winston.transports.Console()],
  });
  logger.info('MICROSERVICE - Starting...');
  API.init(Meteor.settings.api || {}, logger);
});
