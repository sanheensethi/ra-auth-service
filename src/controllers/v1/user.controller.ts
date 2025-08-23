import express, { Request, Response } from 'express';
import logger from '../../logger/v1/logger';
import UserService from '../../services/v1/user.service';
import { isValidBaseRole } from '../../utils/helpers';
import { apiUserFactory } from '../../factory/api/apiUserFactory';

class UserController {
    private userService: UserService;
    private router = express.Router();
    constructor() {
        this.initializeRoutes();
        this.userService = UserService.getInstance();
    }

    private initializeRoutes() {
        this.router.post('/login', this.login.bind(this));
        this.router.post('/register', this.createUser.bind(this)); // Register a new user
    }

    async createUser(req: Request, res: Response) {
        try {
            const userData = req.body;
            const invitedBy = req.query.invitedBy || null; // Optional query parameter for invitedBy (AES Token)
            let { name, email, password, base_role } = userData;
            if (!name || !email || !password) {
                return res.status(400).json({ message: "Name, Email, and Password are required" });
            }
            if (!base_role) {
                base_role = "COMPANY"; // Default to WORKER if not provided
            }
            if(!isValidBaseRole(base_role)) {
                return res.status(400).json({ message: "Invalid base_role" });
            }

            // Logic to create a new user
            const result = await this.userService.createUser({name, email, password, base_role});
            
            if (result.success) {
                const user_data = apiUserFactory((result.data)[0]); // Assuming result.data is an array
                res.status(201).json({"message": "User created successfully", data: user_data });
            } else {
                res.status(400).json({ message: result.details });
            }
        } catch (error: any) {
            logger.error(`[UserController.createUser] creating user: ${error.message} | Stack Trace: ${error.stack}`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and Password are required" });
            }
            // Logic to authenticate user
            const user = await this.userService.authenticateUser(email, password);
            if (user) {
                res.status(200).json({ message: "Login successful", data: user });
            } else {
                res.status(401).json({ message: "Invalid email or password" });
            }
        } catch (error: any) {
            logger.error(`[UserController.login] Error during login: ${error.message} | Stack Trace: ${error.stack}`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    public getRouter() {
        return this.router;
    }

};

export default UserController;