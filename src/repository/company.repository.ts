// repositories/user.repository.ts
import { pgSelect, pgInsert, pgUpdate, pgDelete } from "./pgrest/postgrest";

export class CompanyRepository {
  async findAll(
    filters: Record<string, any> = {},
    select: string[] = ["*"],
    offset?: number,
    limit?: number
  ) {
    return pgSelect("companies", { ...filters, offset, limit, select });
  }

  async findById(id: string, select: string[] = ["*"]) {
    return pgSelect("companies", { id: "eq." + id, select });
  }

  async findCompanyByOwnerId(ownerId: number, select: string[] = ["*"]) {
    return pgSelect("companies", { owner_id: "eq." + ownerId    , select });
  }

  async create(companyData: any) {
    return pgInsert("companies", companyData);
  }

  async update(id: string, companyData: any) {
    return pgUpdate("companies", { id: "eq." + id }, companyData);
  }

  async delete(id: string) {
    return pgDelete("companies", { id: "eq." + id });
  }
}
