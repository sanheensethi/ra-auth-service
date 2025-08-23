// errorHandler.ts
import { Request, Response, NextFunction } from "express";
import logger from "../../logger/v1/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message} Stack Trace: ${err.stack}`);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
};
