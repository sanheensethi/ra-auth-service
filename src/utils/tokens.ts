import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/v1/config';
import logger from '../logger/v1/logger';
import crypto from 'crypto';

class TokenService {
    private jwtSecret: string;
    private jwtExpiration: string;
    private jwtRefreshExpiration: string;
    private aesSeceret: string;
    private algorithm: string = 'aes-256-cbc';
    private iv: Buffer = crypto.randomBytes(16);
    constructor() {
        this.jwtSecret = config['jwtSecret'];
        this.jwtExpiration = config['jwtExpiresIn'];
        this.jwtRefreshExpiration = config['jwtRefreshExpiresIn'];
        this.aesSeceret = config['secretKey'];
    }

    public generateJwtToken(payload: Record<string, any>, isRefreshToken: boolean = false) {
        try {
            let expiresIn = isRefreshToken ? this.jwtRefreshExpiration : this.jwtExpiration;
            const options: any = {
                expiresIn: expiresIn || '1h', // Default to 1 hour if not specified
            };
            const token = jwt.sign(payload, this.jwtSecret, options);
            return token;
        } catch (error: any) {
            logger.error(`Error generating token: ${error.message}`);
            throw new Error('Token generation failed');
        }
    }

    // Function to verify a JWT token
    public verifyJwtToken = (token: string): JwtPayload | string => {
        try {
            return jwt.verify(token, this.jwtSecret) as JwtPayload;
        } catch (error) {
            logger.error(`Error on verifyJWT: ${error}`);
            throw new Error("Invalid or expired token");
        }
    };

    public generateAesToken(data: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.aesSeceret), this.iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return `${this.iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    public decryptAesToken(token: string): string {
        const [ivHex, encryptedText] = token.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedBuffer = Buffer.from(encryptedText, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.aesSeceret), iv);
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

}

const tokenService = new TokenService();
export default tokenService;