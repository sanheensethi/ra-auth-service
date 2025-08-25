import { dbCompanyFactory } from "../../factory/db/dbCompany.factory";
import logger from "../../logger/v1/logger";
import { CompanyRepository } from "../../repository/company.repository";

class CompanyService {
    private static instance: CompanyService;
    private companyRepository: CompanyRepository;

    constructor() {
        this.companyRepository = new CompanyRepository();
    }

    async createCompany(companyData: any) {
        try {
            let dbCompany = dbCompanyFactory(companyData);
            const res = await this.companyRepository.create(dbCompany);
            if (!res || res.success === false) {
                logger.error(`[CompanyService.createCompany] Company creation failed for data: ${JSON.stringify(companyData)} | Response: ${JSON.stringify(res)}`);
                return { success: false, message: "Company creation failed" };
            } else {
                return { success: true, data: res.data[0] };
            }
        } catch (error: any) {
            logger.error(`[CompanyService.createCompany] Error creating company: ${error.message} | Stack Trace: ${error.stack}`);
            throw new Error(`[CompanyService.createCompany] Error creating company: ${error.message}`);
        }
    }

    public static getInstance(): CompanyService {
        if (!CompanyService.instance) {
            CompanyService.instance = new CompanyService();
        }
        return CompanyService.instance;
    }

};

export default CompanyService;