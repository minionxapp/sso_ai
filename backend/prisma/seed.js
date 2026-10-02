import { prismaClient } from "../src/application/database.js";
import bcrypt from "bcrypt";

async function main() {
    console.log("Seeding initial SSO database...");

    // 1. Tenant
    let tenant = await prismaClient.tenant.findUnique({
        where: { code: "default" }
    });

    if (!tenant) {
        tenant = await prismaClient.tenant.create({
            data: {
                code: "default",
                name: "Main Organization",
                domain: "sso.local",
                isActive: true
            }
        });
        console.log("Tenant created:", tenant.name);
    }

    // 2. Roles
    let role = await prismaClient.role.findFirst({
        where: { tenantId: tenant.id, name: "SUPER_ADMIN" }
    });

    if (!role) {
        role = await prismaClient.role.create({
            data: {
                tenantId: tenant.id,
                name: "SUPER_ADMIN",
                description: "Full system administrative access",
                isSystem: true
            }
        });
        console.log("Role created:", role.name);
    }

    // 3. Admin User (group: 'admin')
    let admin = await prismaClient.user.findFirst({
        where: { tenantId: tenant.id, username: "admin" }
    });

    const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
    if (!admin) {
        admin = await prismaClient.user.create({
            data: {
                tenantId: tenant.id,
                username: "admin",
                email: "admin@sso.local",
                fullName: "System Administrator",
                group: "admin",
                passwordHash: adminPasswordHash,
                isActive: true,
                isLocked: false
            }
        });
        await prismaClient.userRole.create({
            data: { userId: admin.id, roleId: role.id }
        });
        console.log("Admin user created (admin / Admin123!)");
    } else {
        await prismaClient.user.update({
            where: { id: admin.id },
            data: { group: "admin", passwordHash: adminPasswordHash }
        });
        console.log("Admin user updated with group: admin");
    }

    // 4. Regular User (group: 'user')
    let regularUser = await prismaClient.user.findFirst({
        where: { tenantId: tenant.id, username: "user" }
    });

    const userPasswordHash = await bcrypt.hash("User123!", 10);
    if (!regularUser) {
        regularUser = await prismaClient.user.create({
            data: {
                tenantId: tenant.id,
                username: "user",
                email: "user@sso.local",
                fullName: "Standard Staff User",
                group: "user",
                passwordHash: userPasswordHash,
                isActive: true,
                isLocked: false
            }
        });
        console.log("Standard user created (user / User123!)");
    } else {
        await prismaClient.user.update({
            where: { id: regularUser.id },
            data: { group: "user", passwordHash: userPasswordHash }
        });
        console.log("Standard user updated with group: user");
    }

    // 5. Sample Client Application
    let app = await prismaClient.application.findUnique({
        where: { clientId: "hris-client-app" }
    });

    if (!app) {
        app = await prismaClient.application.create({
            data: {
                tenantId: tenant.id,
                clientId: "hris-client-app",
                clientSecret: "hris-secret-123",
                name: "HRIS Portal",
                description: "Internal Employee & HR Information System",
                redirectUris: JSON.stringify(["http://localhost:5173/callback"]),
                postLogoutUris: JSON.stringify(["http://localhost:5173/login"]),
                isActive: true
            }
        });
        console.log("Client application registered:", app.name);
    }

    console.log("Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
