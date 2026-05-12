import { Application } from 'express';
import { MorganConfig } from '@config/app/middlewares/morgan/index.js';
import morgan from 'morgan';
function init(config: MorganConfig, appObj: Application) {
  appObj.use(morgan(config.format));
}

export default init ;
