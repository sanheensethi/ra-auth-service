import { dbCompanyMemberFactory } from "../../factory/db/dbCompanyMember.factory";
import logger from "../../logger/v1/logger";
import { CompanyMemberRepository } from "../../repository/companyMember.repository";

class CompanyMemberService {
    private static instance: CompanyMemberService;
    private companyMemberRepository: CompanyMemberRepository;

    constructor() {
        this.companyMemberRepository = new CompanyMemberRepository();
    }

    async createCompanyMember(companyMemeberData: any) {
        try {
            let dbCompanyMember = dbCompanyMemberFactory(companyMemeberData);
            const res = await this.companyMemberRepository.create(dbCompanyMember);
            if (!res || res.success === false) {
                return { success: false, message: "Company Member creation failed" };
            } else {
                return { success: true, data: res.data[0] };
            }
        } catch (error: any) {
            logger.error(`[CompanyMemberService.createCompany] Error creating company: ${error.message} | Stack Trace: ${error.stack}`);
            throw new Error(`[CompanyMemberService.createCompany] Error creating company: ${error.message}`);
        }
    }

    public static getInstance(): CompanyMemberService {
        if (!CompanyMemberService.instance) {
            CompanyMemberService.instance = new CompanyMemberService();
        }
        return CompanyMemberService.instance;
    }

};

export default CompanyMemberService;