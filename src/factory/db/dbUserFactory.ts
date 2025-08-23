// This factory is used to get data from request, and modify for database insertion

import { encryptPassword } from "../../utils/helpers";

// It should return an object that matches the database schema for user
export function dbUserFactory(data: any) {
    let { name, email, password, base_role } = data;
    if (base_role === undefined || base_role === null || base_role === "") {
        base_role = "COMPANY"; // Default to COMPANY if not provided
    }
    return {
        name: name,
        email: email,
        password_hash: encryptPassword(password),
        base_role: base_role,
        created_at: new Date().toISOString()
    }
}