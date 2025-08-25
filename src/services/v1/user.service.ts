import { apiUserFactory } from "../../factory/api/apiUserFactory";
import { dbUserFactory } from "../../factory/db/dbUserFactory";
import logger from "../../logger/v1/logger";
import { UserRepository } from "../../repository/user.repository";
import { comparePasswords } from "../../utils/helpers";
import tokenService from "../../utils/tokens";
import CompanyService from "./company.service";
import CompanyMemberService from "./companyMember.service";
import InviteService from "./invites.service";
class UserService {
    private static instance: UserService;
    private companyService: CompanyService;
    private userRepository: UserRepository;
    private inviteService: InviteService;
    private companyMemberService: CompanyMemberService;

    constructor() {
        this.userRepository = new UserRepository();
        this.companyService = CompanyService.getInstance();
        this.inviteService = InviteService.getInstance();
        this.companyMemberService = CompanyMemberService.getInstance();
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

    async createUserAndCompanyWithInvite(userData: any) {
        // inviteType = COMPANY_OWNER
        try {
            let dbUser:any = dbUserFactory(userData);
            const { inviteCode, companyName, companyAddress } = userData;
            // first create user with is_active = true, then create company, then assign user to company with role ADMIN, then update the invites table to mark the invite as used
            
            // activate the user as it is created via invite code
            dbUser['is_active'] = true;

            const res = await this.userRepository.create(dbUser);
            if (!res || res.success === false) {
                return { success: false, message: "User creation failed" };
            }

            const user = res.data[0];
            const userId = user.id;

            // create companys
            let companyResult = await this.companyService.createCompany({
                name: companyName, 
                address: companyAddress, 
                owner_id: userId
            });
            
            if (!companyResult || companyResult.success === false) {
                logger.error(`[UserService.createUserAndCompanyWithInvite] Company creation failed after user creation with id: ${userId}`);
                return { success: false, message: "User Created, Company creation failed" };
            }

            // mark the invite as used
            let updateInvitesResult = await this.inviteService.updateInviteByCode(inviteCode, { 
                    status: "ACCEPTED", 
                    accepted_at: new Date().toISOString(), 
                    updatedAt: new Date().toISOString() 
                });

            if (!updateInvitesResult || updateInvitesResult.success === false) {
                logger.error(`[UserService.createUserAndCompanyWithInvite] Updating invite status failed for code: ${inviteCode}`);
                return { success: false, message: "User and Company Created, but updating invite status failed" };
            }
            
            // adding company member logic
            let companyMemberResult = await this.companyMemberService.createCompanyMember({
                company_id: companyResult.data.id,
                user_id: userId,
                role_in_company: "ADMIN",
                hired_by: userId // self hired as owner of the company
            })

            if (!companyMemberResult || companyMemberResult.success === false) {
                logger.error(`[UserService.createUserAndCompanyWithInvite] Adding company member failed for user id: ${userId} and company id: ${companyResult.data.id}`);
                return { success: false, message: "User and Company Created, but adding company member failed" };
            }

            return { success: true, data: { user: apiUserFactory(user), company: companyResult.data, companyMember: companyMemberResult.data } };

        } catch (error: any) {
            logger.error(`[UserService.createUserAndCompanyWithInvite] Error creating user and company with invite: ${error.message} | Stack Trace: ${error.stack}`);
            throw new Error(`[UserService.createUserAndCompanyWithInvite] Error creating user and company with invite: ${error.message}`);
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