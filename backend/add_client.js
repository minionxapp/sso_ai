import { prismaClient as prisma } from './src/application/database.js';
import crypto from 'crypto';

async function run() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant found");
  
  const admin = await prisma.user.findFirst({ where: { group: 'admin' } });
  
  const clientId = crypto.randomBytes(16).toString('hex');
  const clientSecret = crypto.randomBytes(32).toString('hex');
  
  const app = await prisma.application.create({
    data: {
      tenantId: tenant.id,
      clientId,
      clientSecret,
      name: 'SSO Client Example',
      description: 'Example application for testing SSO',
      redirectUris: JSON.stringify(['http://localhost:4000/callback']),
      postLogoutUris: JSON.stringify(['http://localhost:5174/login']),
      isActive: true
    }
  });
  
  if (admin) {
    await prisma.userApplicationAccess.create({
       data: { userId: admin.id, applicationId: app.id }
    });
  }

  console.log(JSON.stringify({ clientId, clientSecret }));
}

run().catch(console.error).finally(() => prisma.$disconnect());
