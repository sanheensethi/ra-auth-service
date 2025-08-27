export function dbCompanyMemberFactory(data: any) {
    return {
        company_id: data.company_id,
        user_id: data.user_id,
        role_in_company: data.role_in_company,
        hired_by: data.hired_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
}