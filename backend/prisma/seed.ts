import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@codelab.eu' },
        update: {},
        create: {
            email: 'admin@codelab.eu',
            name: 'Admin User',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });
    console.log({ admin });

    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@codelab.eu' },
        update: {},
        create: {
            email: 'user@codelab.eu',
            name: 'Standard User',
            password: userPassword,
            role: Role.USER,
        },
    });
    console.log({ user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
