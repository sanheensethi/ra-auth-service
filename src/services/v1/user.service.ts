import { apiUserFactory } from "../../factory/api/apiUserFactory";
import { dbUserFactory } from "../../factory/db/dbUserFactory";
import logger from "../../logger/v1/logger";
import { UserRepository } from "../../repository/user.repository";
import { comparePasswords, encryptPassword } from "../../utils/helpers";
import tokenService from "../../utils/tokens";
class UserService {
    private static instance: UserService;
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async createUser(userData: any): Promise<any> {
        try {
            const dbUser = dbUserFactory(userData); // Format the data for database insertion
            const res = await this.userRepository.create(dbUser);
            if (!res || res.success === false) {
                return { success: false, message: "User creation failed" };
            } else {
                return { success: true, data: res.data[0] };
            }
        } catch (error: any) {
            logger.error(`[UserService.createUser] Error creating user: ${error.message} | Stack Trace: ${error.stack}`);
            throw new Error(`[UserService.createUser] Error creating user: ${error.message}`);
        }
    }

    async authenticateUser(email: string, password: string): Promise<any> {
        try {
            const user = await this.userRepository.findByEmail(email);
            console.log(`[UserService.authenticateUser] User: ${JSON.stringify(user)}`);
            if (!user || user.success === false || user.data.length === 0) {
                logger.error(`[UserService.authenticateUser] User not found`);
                return null; // User not found
            }
            const dbUser = user.data[0];
            // Here you would typically check the password hash
            if (comparePasswords(password, dbUser.password_hash)) { // Simplified for example purposes
                const apiUser = apiUserFactory(dbUser);
                return {
                    name: apiUser.name,
                    email: apiUser.email,
                    base_role: apiUser.base_role,
                    token: tokenService.generateJwtToken(apiUser),
                    refreshToken: tokenService.generateJwtToken(apiUser, true)
                }
            }
            return null; // Invalid password
        } catch (error: any) {
            logger.error(`[UserService.authenticateUser] Error during authentication: ${error.message} | Stack Trace: ${error.stack}`);
            throw new Error(`[UserService.authenticateUser] Error during authentication: ${error.message}`);
        }
    }

};

export default UserService;