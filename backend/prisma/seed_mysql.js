import { prismaClient as prisma } from '../src/application/database.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('Seeding data...');

  // 1. Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      code: 'DEFAULT',
      name: 'Default Tenant',
      domain: 'localhost'
    }
  });

  // 2. Create Users (admin and user)
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@example.com',
      username: 'admin',
      passwordHash,
      fullName: 'Administrator',
      group: 'admin'
    }
  });

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'user@example.com',
      username: 'user',
      passwordHash,
      fullName: 'Regular User',
      group: 'user'
    }
  });

  // 3. Create Application based on client_example
  const app = await prisma.application.create({
    data: {
      tenantId: tenant.id,
      clientId: 'e9175bb9bc36de63badca3f746db7aba',
      clientSecret: '72bcc46f646945c5d5686f37d9d5733e002b411d425155cfe509816d7359cbf9',
      name: 'Client Example App',
      description: 'Demo App for SSO',
      redirectUris: JSON.stringify(['http://localhost:4000/callback']),
      postLogoutUris: JSON.stringify(['http://localhost:5174/login']),
      isActive: true
    }
  });

  // 4. Grant access to admin
  await prisma.userApplicationAccess.create({
    data: {
      userId: admin.id,
      applicationId: app.id
    }
  });

  console.log('Seed completed successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
