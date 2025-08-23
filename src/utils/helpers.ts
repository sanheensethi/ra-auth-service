import bcrypt from 'bcryptjs';

export function isValidBaseRole(role: string): boolean {
    const validRoles = ["COMPANY", "WORKER", "CONTRACTOR"]; // Super Admin is not included as it's a top-level role
    return validRoles.includes(role);
}

export function encryptPassword(password: string): string {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return hash;
}

export function comparePasswords(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}