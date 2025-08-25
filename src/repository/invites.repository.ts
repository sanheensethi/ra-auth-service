// repositories/user.repository.ts
import { pgSelect, pgInsert, pgUpdate, pgDelete } from "./pgrest/postgrest";

export class InviteRepository {
  async findAll(
    filters: Record<string, any> = {},
    select: string[] = ["*"],
    offset?: number,
    limit?: number
  ) {
    return pgSelect("invites", { ...filters, offset, limit, select });
  }

  async findById(id: string, select: string[] = ["*"]) {
    return pgSelect("invites", { id: "eq." + id, select });
  }

  async findByInvitedBy(invitedById: number, select: string[] = ["*"]) {
    return pgSelect("invites", { invited_by: "eq." + invitedById, select });
  }

  async findByCode(code: string, select: string[] = ["*"]) {
    return pgSelect("invites", { invite_code: "eq." + code, select });
  }

  async findByInvitationType(type: string, select: string[] = ["*"]) {
    return pgSelect("invites", { invitation_type: "eq." + type, select });
  }

  async create(invitationData: any) {
    return pgInsert("invites", invitationData);
  }

  async update(id: string, invitationData: any) {
    return pgUpdate("invites", { id: "eq." + id }, invitationData);
  }

  async updateByCode(code: string, invitationData: any) {
    return pgUpdate("invites", { invite_code: "eq." + code }, invitationData);
  }

  async delete(id: string) {
    return pgDelete("invites", { id: "eq." + id });
  }
}
