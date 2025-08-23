// routeHandler.ts
import { Request, Response, NextFunction } from "express";
import logger from "../../logger/v1/logger";

export const routeHandler = (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Request comes on ${req.url}`);
    next();
};
