import express, { Request, Response } from 'express';
import logger from '../../logger/v1/logger';
import UserService from '../../services/v1/user.service';
import { isValidBaseRole } from '../../utils/helpers';
import { apiUserFactory } from '../../factory/api/apiUserFactory';
import InviteService from '../../services/v1/invites.service';

class UserController {
    private userService: UserService;
    private inviteService: InviteService;
    private router = express.Router();
    constructor() {
        this.initializeRoutes();
        this.userService = UserService.getInstance();
        this.inviteService = InviteService.getInstance();
    }

    private initializeRoutes() {
        this.router.post('/login', this.login.bind(this));
        this.router.post('/register', this.createUser.bind(this)); // Register a new user
        this.router.post('/register/:inviteCode', this.createUserWithInvite.bind(this)); // Register a new user with invite code
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

    async createUserWithInvite(req: Request, res: Response) {
        try {
            let { name, email, password, base_role } = req.body; // base role is company always, role in company is stored in invites, which is ADMIN by default
            const inviteCode = req.params.inviteCode as string;

            if (!name || !email || !password || !inviteCode) {
                res.status(400).json({ message: "Name, Email, Password, and Invite Code are required" });
                return;
            }

            if (!base_role) {
                base_role = "COMPANY"; // Default to COMPANY if not provided
            }

            if(!isValidBaseRole(base_role)) {
                res.status(400).json({ message: "Invalid base_role" });
                return;
            }

            // first check if inviteType is COMPANY_OWNER from database, if yes, then expect companyName and companyAddress in body

            let inviteData = await this.inviteService.getInvitesByCode(inviteCode);

            logger.info(`Invite Data: ${JSON.stringify(inviteData)}`);

            if (!inviteData || !inviteData.success) {
                res.status(400).json({ message: "Invalid invite code" });
                return;
            }

            if (inviteData.data.email !== email) {
                res.status(400).json({ message: "Invite code does not match email" });
                return;
            }

            const inviteType = inviteData.data.invitation_type;

            if (inviteType && inviteType == "COMPANY_OWNER") {
                let companyName;
                companyName = req.body.companyName;
                if (!companyName) {
                    res.status(400).json({ message: "Company Name and Company Address are required for COMPANY_OWNER invite" });
                    return;
                }

                // now, create user, create company, assign user to company with role ADMIN
                const result = await this.userService.createUserAndCompanyWithInvite({name, email, password, base_role, inviteCode, companyName});
                if (result.success) {
                    res.status(201).json({"message": "User and Company created successfully", data: result.data });
                } else {
                    res.status(400).json({ message: result.message });
                }

            } else if (inviteType && inviteType == "COMPANY_MEMBER") {
                // create user, assign user to company with role from invites table
            }

        } catch (error: any) {
            logger.error(`[UserController.createUserWithInvite] creating user with invite: ${error.message} | Stack Trace: ${error.stack}`);
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