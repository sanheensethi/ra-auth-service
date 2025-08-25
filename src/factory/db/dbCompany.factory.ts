export function dbCompanyFactory(data: any) {
    return {
        name: data.name,
        owner_id: data.owner_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
}