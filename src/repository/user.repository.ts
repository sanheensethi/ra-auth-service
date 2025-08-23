// repositories/user.repository.ts
import { pgSelect, pgInsert, pgUpdate, pgDelete } from "./pgrest/postgrest";

export class UserRepository {
  async findAll(
    filters: Record<string, any> = {},
    select: string[] = ["*"],
    offset?: number,
    limit?: number
  ) {
    return pgSelect("users", { ...filters, offset, limit, select });
  }

  async findById(id: string, select: string[] = ["*"]) {
    return pgSelect("users", { id: "eq." + id, select });
  }

  async findByEmail(email: string, select: string[] = ["*"]) {
    return pgSelect("users", { email: "eq." + email, select });
  }

  async create(userData: any) {
    return pgInsert("users", userData);
  }

  async update(id: string, userData: any) {
    return pgUpdate("users", { id: "eq." + id }, userData);
  }

  async delete(id: string) {
    return pgDelete("users", { id: "eq." + id });
  }
}
