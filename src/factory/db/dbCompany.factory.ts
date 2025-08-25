export function dbCompanyFactory(data: any) {
    return {
        name: data.name,
        address: data.address,
        owner_id: data.owner_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
}