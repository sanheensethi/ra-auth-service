

export function apiUserFactory(data: any) {
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        base_role: data.base_role,
        created_at: data.created_at
    }
}