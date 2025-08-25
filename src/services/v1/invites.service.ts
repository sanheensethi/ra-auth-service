import logger from "../../logger/v1/logger";
import { InviteRepository } from "../../repository/invites.repository";

class InviteService {
    private static instance: InviteService;
    private inviteRepository: InviteRepository;

    constructor() {
        this.inviteRepository = new InviteRepository();
    }

    
    async getInvitesByCode(code: string) {
        try {
            const invites = await this.inviteRepository.findByCode(code);
            if (invites.success && invites.data && invites.data.length > 0) {
                return { success: true, data: invites.data[0] }; // Return the first matching invite
            } else {
                return { success: false, details: "Invite not found" };
            }
        } catch (error: any) {
            logger.error(`[InviteService.getInvitesByCode] fetching invite by code: ${error.message} | Stack Trace: ${error.stack}`);
            return { success: false, details: "Internal Server Error" };
        }
    }

    async updateInviteByCode(code: string, updateData: any) {
        try {
            const updateResult = await this.inviteRepository.updateByCode(code, updateData);
            if (updateResult.success) {
                return { success: true, data: updateResult.data[0] };
            } else {
                return { success: false, details: "Failed to update invite" };
            }
        } catch (error: any) {
            logger.error(`[InviteService.updateInviteByCode] updating invite by code: ${error.message} | Stack Trace: ${error.stack}`);
            return { success: false, details: "Internal Server Error" };
        }
    }

    public static getInstance(): InviteService {
        if (!InviteService.instance) {
            InviteService.instance = new InviteService();
        }
        return InviteService.instance;
    }

};

export default InviteService;