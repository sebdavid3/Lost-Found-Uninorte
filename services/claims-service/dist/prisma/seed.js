"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seeder...');
    const user = await prisma.user.upsert({
        where: { email: 'estudiante@uninorte.edu.co' },
        update: {},
        create: {
            email: 'estudiante@uninorte.edu.co',
            name: 'Estudiante de Prueba',
            role: 'STUDENT',
        },
    });
    console.log('✅ Usuario creado:', user.id);
    const electronicObject = await prisma.object.create({
        data: {
            description: 'MacBook Pro M1',
            category: client_1.ObjectCategory.ELECTRONIC,
            location: 'Biblioteca 2do Piso',
            photo: 'https://example.com/macbook.jpg',
        },
    });
    console.log('✅ Objeto Electrónico creado:', electronicObject.id);
    const commonObjectNoPhoto = await prisma.object.create({
        data: {
            description: 'Termo Contigo Azul',
            category: client_1.ObjectCategory.COMMON,
            location: 'Cafetería Bloque K',
            photo: '',
        },
    });
    console.log('✅ Objeto Común (Sin foto) creado:', commonObjectNoPhoto.id);
    console.log('🌱 Seeding completado!');
}
main()
    .catch((e) => {
    if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
        console.error('La base de datos aun no tiene las tablas del proyecto. Ejecuta `npx prisma migrate deploy` antes del seeder.');
    }
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map