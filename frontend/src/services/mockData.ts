import type { LostObject } from '../types';
import { ObjectCategory } from '../types';

export const mockLostObjects: LostObject[] = [
  {
    id: '1',
    description: 'MacBook Pro 14" M1 gris espacial con sticker de GitHub',
    photo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
    category: ObjectCategory.ELECTRONIC,
    location: 'Biblioteca - Sala de Estudio 3',
    foundAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    description: 'Termo Contigo azul oscuro, 24oz',
    photo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    category: ObjectCategory.COMMON,
    location: 'Cafetería Central - Mesa 12',
    foundAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    description: 'Calculadora Casio fx-991EX ClassWiz',
    photo: 'https://images.unsplash.com/photo-1620059179576-90e81fdd21b3?auto=format&fit=crop&q=80&w=400',
    category: ObjectCategory.STATIONERY,
    location: 'Bloque K - Salón 302',
    foundAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    description: 'Chaqueta de jean Levi\'s talla M con botón faltante',
    photo: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=400',
    category: ObjectCategory.CLOTHING,
    location: 'Canchas Múltiples',
    foundAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    description: 'Cédula de Ciudadanía - Juan Pérez',
    photo: 'https://images.unsplash.com/photo-1554200876-0f72381286b2?auto=format&fit=crop&q=80&w=400',
    category: ObjectCategory.DOCUMENT,
    location: 'Bloque G - Pasillo 2',
    // 5 meses de antigüedad
    foundAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
