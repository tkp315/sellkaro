
import { Application } from 'express';
import { HelmetConfig } from '@config/app/middlewares/helmet/index.js';
import helmet from 'helmet';
function init(config: HelmetConfig, appObj: Application) {
  appObj.use(
    helmet({
      contentSecurityPolicy: config.contentSecurityPolicy,
      crossOriginEmbedderPolicy: config.crossOriginEmbedderPolicy,
    })
  );
}

export default init ;
