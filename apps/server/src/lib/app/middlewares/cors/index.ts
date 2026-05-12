import { CorsConfig } from "@config/app/middlewares/cors/index.js";
import { Application } from "express";
import cors from 'cors'
function init (config:CorsConfig, appObj:Application){
appObj.use(cors({
 allowedHeaders: config.allowedHeaders,
 credentials:config.credentials,
 methods:config.methods,
 origin:config.origins,
 exposedHeaders:config.exposedHeaders,
 maxAge:config.maxAge,
}))
}
export default  init