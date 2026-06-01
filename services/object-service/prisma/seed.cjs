const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SHELVES = [
  'Estante 1 - Caja 3', 'Estante 1 - Caja 7', 'Estante 2 - Caja 1',
  'Estante 2 - Caja 4', 'Estante 2 - Caja 9', 'Estante 3 - Caja 2',
  'Estante 3 - Caja 6', 'Estante 3 - Bandeja A', 'Estante 4 - Caja 5',
  'Estante 4 - Bandeja B', 'Armario A - Gaveta 1', 'Armario A - Gaveta 2',
  'Armario B - Gaveta 3', 'Armario B - Gaveta 4', 'Vitrina 1 - Repisa Superior',
  'Vitrina 1 - Repisa Inferior', 'Vitrina 2 - Repisa Media', 'Caja Fuerte - Compartimento 1',
  'Depósito - Contenedor Plástico', 'Archivador - Cajón 3',
];

const OBJECT_DEFS = [
  // ELECTRONIC
  { 
    name: 'MacBook Pro M1', 
    description: 'Laptop Apple MacBook Pro chip M1, gris espacial, stickers en tapa trasera.', 
    category: 'ELECTRONIC', 
    location: 'Biblioteca 2do Piso',
    photo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'
  },
  { 
    name: 'Cargador USB-C Samsung', 
    description: 'Cargador rápido 25W con cable USB-C, color blanco.', 
    category: 'ELECTRONIC', 
    location: 'Sala de Estudio - Bloque B',
    photo: 'https://images.unsplash.com/photo-1619130778007-a13a6cba31d6?w=800&q=80'
  },
  { 
    name: 'iPad Air 2023', 
    description: 'iPad Air 5ta generación, color azul, funda magnética gris, Apple Pencil incluido.', 
    category: 'ELECTRONIC', 
    location: 'Biblioteca 3er Piso',
    photo: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'
  },
  { 
    name: 'Smartwatch Galaxy Watch', 
    description: 'Reloj inteligente Samsung Galaxy Watch, correa negra.', 
    category: 'ELECTRONIC', 
    location: 'Gimnasio',
    photo: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'
  },
  { 
    name: 'Audífonos Sony WH-1000XM4', 
    description: 'Audífonos over-ear con cancelación de ruido, estuche incluido.', 
    category: 'ELECTRONIC', 
    location: 'Lab de Sistemas - Bloque J',
    photo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
  },
  { 
    name: 'iPhone 14 Pro', 
    description: 'Teléfono iPhone 14 Pro, color morado, funda transparente.', 
    category: 'ELECTRONIC', 
    location: 'Cafetería Bloque K',
    photo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
  },
  { 
    name: 'Cable HDMI 2.1', 
    description: 'Cable HDMI de 3 metros, compatible con 4K 120Hz.', 
    category: 'ELECTRONIC', 
    location: 'Auditorio Central',
    photo: 'https://images.unsplash.com/photo-1557063673-0493e05d49ef?w=800&q=80'
  },
  { 
    name: 'Teclado Mecánico Logitech', 
    description: 'Teclado mecánico inalámbrico MX Keys, retroiluminado.', 
    category: 'ELECTRONIC', 
    location: 'Sala de Profesores - Bloque G',
    photo: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80'
  },
  { 
    name: 'Memoria USB Kingston 64GB', 
    description: 'Memoria USB 3.0 Kingston 64GB, carcasa metálica plateada.', 
    category: 'ELECTRONIC', 
    location: 'Lab de Sistemas - Bloque J',
    photo: 'https://images.unsplash.com/photo-1599939571322-792a326991f2?w=800&q=80'
  },

  // COMMON
  { 
    name: 'Termo Contigo Azul', 
    description: 'Termo acero inoxidable Contigo 500ml, azul marino.', 
    category: 'COMMON', 
    location: 'Cafetería Bloque K',
    photo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'
  },
  { 
    name: 'Botella de Agua HydroFlask', 
    description: 'Botella térmica HydroFlask 32oz, verde menta, stickers personalizados.', 
    category: 'COMMON', 
    location: 'Gimnasio',
    photo: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80'
  },
  { 
    name: 'Paraguas Negro', 
    description: 'Paraguas compacto automático, negro, marca Totto.', 
    category: 'COMMON', 
    location: 'Entrada Principal - Portería',
    photo: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=800&q=80'
  },
  { 
    name: 'Mochila Jansport Gris', 
    description: 'Mochila Jansport Big Student, gris oscuro, cierre frontal dañado.', 
    category: 'COMMON', 
    location: 'Biblioteca 1er Piso',
    photo: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&q=80'
  },
  { 
    name: 'Lentes de Sol Ray-Ban', 
    description: 'Gafas de sol Ray-Ban Aviator, cristales verdes, estuche de cuero.', 
    category: 'COMMON', 
    location: 'Zona Verde - Malecón',
    photo: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
  },
  { 
    name: 'Lonchera Térmica', 
    description: 'Lonchera azul rectangular con compartimentos internos.', 
    category: 'COMMON', 
    location: 'Comedor Estudiantil',
    photo: 'https://images.unsplash.com/photo-1622244244253-304fcef1d828?w=800&q=80'
  },
  { 
    name: 'Estuche de Lápices', 
    description: 'Estuche de tela con cierre, contiene 12 lápices de colores Faber-Castell.', 
    category: 'COMMON', 
    location: 'Salón 7G - Bloque G',
    photo: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80'
  },
  { 
    name: 'Botella de Vidrio', 
    description: 'Botella de vidrio reutilizable con funda de silicona rosada.', 
    category: 'COMMON', 
    location: 'Plazoleta Central',
    photo: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=800&q=80'
  },

  // CLOTHING
  { 
    name: 'Chaqueta Deportiva Nike', 
    description: 'Chaqueta deportiva Nike negra, logo blanco, talla M.', 
    category: 'CLOTHING', 
    location: 'Coliseo Deportivo',
    photo: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
  },
  { 
    name: 'Camiseta Uninorte', 
    description: 'Camiseta institucional Uninorte, talla L, color rojo.', 
    category: 'CLOTHING', 
    location: 'Cancha de Fútbol',
    photo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'
  },
  { 
    name: 'Tenis Nike Air Max', 
    description: 'Tenis Nike Air Max 270, color blanco/negro, talla 42.', 
    category: 'CLOTHING', 
    location: 'Gimnasio',
    photo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'
  },
  { 
    name: 'Sudadera Gris Under Armour', 
    description: 'Sudadera con capucha gris, talla M, con bolsillo canguro.', 
    category: 'CLOTHING', 
    location: 'Sala de Estudio - Bloque B',
    photo: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80'
  },
  { 
    name: 'Gorra Uninorte', 
    description: 'Gorra azul marino bordada con logo de Uninorte, ajustable.', 
    category: 'CLOTHING', 
    location: 'Biblioteca 2do Piso',
    photo: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80'
  },
  { 
    name: 'Bufanda Roja', 
    description: 'Bufanda de lana roja con rayas grises.', 
    category: 'CLOTHING', 
    location: 'Auditorio Central',
    photo: 'https://images.unsplash.com/photo-1520903722240-5e5f047b9523?w=800&q=80'
  },
  { 
    name: 'Saco de Compresión', 
    description: 'Saco deportivo de compresión, negro, manga larga.', 
    category: 'CLOTHING', 
    location: 'Coliseo Deportivo',
    photo: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&q=80'
  },

  // STATIONERY
  { 
    name: 'Calculadora Científica Casio', 
    description: 'Casio FX-991, negra, "Luis R." escrito con marcador atrás.', 
    category: 'STATIONERY', 
    location: 'Salón 7G - Bloque G',
    photo: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80'
  },
  { 
    name: 'Cuaderno Universitario', 
    description: 'Cuaderno argollado 7 materias, pasta dura azul, apuntes de Cálculo.', 
    category: 'STATIONERY', 
    location: 'Biblioteca 3er Piso',
    photo: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80'
  },
  { 
    name: 'Set de Colores Prismacolor', 
    description: 'Estuche con 24 lápices de colores Prismacolor Premier.', 
    category: 'STATIONERY', 
    location: 'Salón 5B - Bloque B',
    photo: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80'
  },
  { 
    name: 'Post-its de Colores', 
    description: 'Paquete con 6 pads de sticky notes fluorescentes.', 
    category: 'STATIONERY', 
    location: 'Sala de Profesores - Bloque G',
    photo: 'https://images.unsplash.com/photo-1606159068539-43f36b99d1b2?w=800&q=80'
  },
  { 
    name: 'Lapiceros Pilot G2', 
    description: 'Pack de 5 lapiceros gel Pilot G2, colores negro/azul/rojo.', 
    category: 'STATIONERY', 
    location: 'Dirección de Programa',
    photo: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80'
  },
  { 
    name: 'Juego de Reglas', 
    description: 'Escuadra, cartabón y regla de 30cm, plástico transparente.', 
    category: 'STATIONERY', 
    location: 'Salón 3F - Bloque F',
    photo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
  },
  { 
    name: 'Marcadores Resaltadores', 
    description: 'Pack de 6 resaltadores Stabilo Boss colores pastel.', 
    category: 'STATIONERY', 
    location: 'Biblioteca 1er Piso',
    photo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&q=80'
  },

  // DOCUMENT
  { 
    name: 'Carné Estudiantil', 
    description: 'Carné Uninorte 2025-2, foto del estudiante.', 
    category: 'DOCUMENT', 
    location: 'Entrada Principal - Portería',
    photo: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&q=80'
  },
  { 
    name: 'Libro de Cálculo', 
    description: 'Cálculo: Trascendentes Tempranas, Stewart 8va edición.', 
    category: 'DOCUMENT', 
    location: 'Biblioteca 2do Piso',
    photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'
  },
  { 
    name: 'Carpeta de Apuntes', 
    description: 'Carpeta negra tamaño oficio con separadores de materias.', 
    category: 'DOCUMENT', 
    location: 'Salón 7G - Bloque G',
    photo: 'https://images.unsplash.com/photo-1586075010923-2dd45e9b2d4f?w=800&q=80'
  },
  { 
    name: 'Billetera de Cuero', 
    description: 'Billetera de cuero café oscuro, contiene documentos personales.', 
    category: 'DOCUMENT', 
    location: 'Cafetería Central',
    photo: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'
  },
  { 
    name: 'Folder de Prácticas', 
    description: 'Folder plástico con prácticas de laboratorio de Física.', 
    category: 'DOCUMENT', 
    location: 'Lab de Química - Bloque H',
    photo: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  { 
    name: 'Libro de Programación', 
    description: 'Clean Code de Robert C. Martin, edición en español.', 
    category: 'DOCUMENT', 
    location: 'Lab de Sistemas - Bloque J',
    photo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'
  },
  { 
    name: 'Agenda Personal 2025', 
    description: 'Agenda 2025, pasta de cuero sintético color rosado.', 
    category: 'DOCUMENT', 
    location: 'Pasillo Bloque D',
    photo: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80'
  },

  // ACCESSORY
  { 
    name: 'Estuche AirPods Pro', 
    description: 'Estuche AirPods Pro blanco, sin audífonos adentro.', 
    category: 'ACCESSORY', 
    location: 'Lab de Sistemas - Bloque J',
    photo: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80'
  },
  { 
    name: 'Reloj de Pulsera Casio', 
    description: 'Reloj analógico Casio dorado, correa de cuero café.', 
    category: 'ACCESSORY', 
    location: 'Cafetería Bloque A',
    photo: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80'
  },
  { 
    name: 'Pulsera de Plata', 
    description: 'Pulsera de plata 925 con dije de cruz.', 
    category: 'ACCESSORY', 
    location: 'Biblioteca 1er Piso',
    photo: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
  },
  { 
    name: 'Anillo de Graduación', 
    description: 'Anillo de graduación Uninorte, oro blanco, talla 8.', 
    category: 'ACCESSORY', 
    location: 'Edificio de Postgrados',
    photo: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'
  },
  { 
    name: 'Collar con Dije', 
    description: 'Cadena de plata fina con dije de corazón.', 
    category: 'ACCESSORY', 
    location: 'Plazoleta Central',
    photo: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
  },
  { 
    name: 'Power Bank 20000mAh', 
    description: 'Batería externa Xiaomi 20000mAh, color negro, carga rápida.', 
    category: 'ACCESSORY', 
    location: 'Sala de Estudio - Bloque B',
    photo: 'https://images.unsplash.com/photo-1609592424085-f5da4ff16c35?w=800&q=80'
  },
  { 
    name: 'Audífonos Cableados JBL', 
    description: 'Audífonos JBL con cable USB-C, micrófono y control incluidos.', 
    category: 'ACCESSORY', 
    location: 'Estacionamiento Norte',
    photo: 'https://images.unsplash.com/photo-1613531755739-64b73b22a24f?w=800&q=80'
  },

  // OTHER
  { 
    name: 'Llaves con Llavero Uninorte', 
    description: 'Juego de 3 llaves con llavero institucional Uninorte.', 
    category: 'OTHER', 
    location: 'Recepción Bloque A',
    photo: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80'
  },
  { 
    name: 'Paraguas Compacto Azul', 
    description: 'Paraguas compacto azul oscuro, apertura automática.', 
    category: 'OTHER', 
    location: 'Entrada Principal - Portería',
    photo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80'
  },
  { 
    name: 'Mochila Deportiva Adidas', 
    description: 'Mochila pequeña deportiva Adidas, negra con rayas blancas.', 
    category: 'OTHER', 
    location: 'Coliseo Deportivo',
    photo: 'https://images.unsplash.com/photo-1575844621280-5757f406e88d?w=800&q=80'
  },
  { 
    name: 'Gafas de Sol Polarizadas', 
    description: 'Gafas de sol polarizadas, marco negro mate, estuche rígido.', 
    category: 'OTHER', 
    location: 'Cancha de Fútbol',
    photo: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'
  },
  { 
    name: 'Taza de Cerámica', 
    description: 'Taza de cerámica blanca con frase "Sí se puede".', 
    category: 'OTHER', 
    location: 'Sala de Profesores - Bloque G',
    photo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'
  },
  { 
    name: 'Llavero de Programa', 
    description: 'Llavero metálico del programa de Ingeniería de Sistemas.', 
    category: 'OTHER', 
    location: 'Dirección de Programa',
    photo: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80'
  },
  { 
    name: 'Bolsa Reutilizable', 
    description: 'Bolsa de tela reutilizable de la librería Uninorte.', 
    category: 'OTHER', 
    location: 'Comedor Estudiantil',
    photo: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&q=80'
  },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  console.log('🌱 Iniciando seeder de objetos...');
  await prisma.object.deleteMany();
  const objects = [];
  for (let i = 0; i < OBJECT_DEFS.length; i++) {
    const def = OBJECT_DEFS[i];
    const storageLocation = pick(SHELVES);
    const foundAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    const obj = await prisma.object.create({
      data: {
        name: def.name,
        description: def.description,
        photo: def.photo,
        category: def.category,
        location: def.location,
        storageLocation,
        status: 'AVAILABLE',
        foundAt,
      },
    });
    objects.push(obj);
  }
  console.log(`✅ ${objects.length} objetos creados.`);
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); });
