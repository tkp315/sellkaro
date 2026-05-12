
import { CookieConfig } from "@config/app/middlewares/cookie/index.js";
import { Application } from "express";
import cookieParser from "cookie-parser";
function init(config:CookieConfig, appObj:Application){
appObj.use(cookieParser())
}

export default init