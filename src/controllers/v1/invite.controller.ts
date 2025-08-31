import express, { Request, Response } from 'express';
import logger from '../../logger/v1/logger';

import InviteService from '../../services/v1/invites.service';


class InvitesController {
    private inviteService: InviteService;
    private router = express.Router();
    constructor() {
        this.initializeRoutes();
        this.inviteService = InviteService.getInstance();
    }

    private initializeRoutes() {
        this.router.get('/invites/:inviteCode', this.getInvitesByCode.bind(this));
    }

    private async getInvitesByCode(req: Request, res: Response) {
        try {
            const { inviteCode } = req.params;
            const invites = await this.inviteService.getInvitesByCode(inviteCode);
            if (invites.success && invites.data) {
                res.status(200).json({data: invites.data});
            } else {
                logger.warn(`[InviteService.getInvitesByCode] No invite found with code: ${inviteCode}`);
                res.status(404).json({ success: false, details: "Invite not found" });
            }
        } catch (error: any) {
            logger.error(`[InviteService.getInvitesByCode] fetching invite by code: ${error.message} | Stack Trace: ${error.stack}`);
            res.status(500).json({ success: false, details: "Internal Server Error" });
        }
    }

    public getRouter() {
        return this.router;
    }

};

export default InvitesController;