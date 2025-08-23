import * as dotenv from "dotenv";
dotenv.config();

const service_name = "auth_service";
const default_service_port = 4002;
const default_log_level = "info";

export const config = {
    port: Number(process.env.SERVER_PORT ?? default_service_port),
    jwtSecret: process.env.JWT_SECRET || "change_me",
    secretKey: process.env.SECRET_KEY || "change_me", // This secret key is used for various cryptographic operations - like generating tokens for reset password, email verification, etc.
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    postgrestUrl: process.env.POSTGREST_URL || "http://localhost:3001",
    logsTimeFormat: process.env.LOGS_TIME_FORMAT || 'YYYY-MM-DDTHH:mm:ssZ',
    logsFilenameDatePattern: process.env.LOGS_FILENAME_DATE_PATTERN || 'YYYY-MM-DD',
    logFileName: `/usr/src/app/logs/${service_name}_%DATE%.log`,
    logsMaxSizePerFile: process.env.LOGS_MAX_SIZE_PER_FILE || '30m',
    logsMaxFiles: process.env.LOGS_MAX_FILES || '14d',
    logLevel: process.env.LOG_LEVEL || default_log_level,
    emailHost: process.env.EMAIL_HOST || "",
    emailUser: process.env.EMAIL_USER || "",
    emailPassword: process.env.EMAIL_PASSWORD || "",
    emailVerificationUrl: process.env.EMAIL_VERIFICATION_URL || "",
    passwordResetUrl: process.env.PASSWORD_RESET_URL || "",
};