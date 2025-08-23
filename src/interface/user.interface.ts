export interface User {
    id: string | null;
    email: string;
    name: string;
    password_hash: string;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}