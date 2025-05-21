import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPasswords() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Skip if the password looks hashed (starts with $2b$ or $2a$)
    if (!user.password.startsWith('$2')) {
      const hashed = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      console.log(`✅ Updated password for: ${user.email}`);
    }
  }

  await prisma.$disconnect();
}

hashPasswords().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
