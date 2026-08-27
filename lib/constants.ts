export const PI_PRICING = {
  SELLER_REGISTRATION: 0.01,
  PRODUCT_PUBLICATION: 0.001,
} as const;

export const PRODUCT_CATEGORIES = [
  'Électronique',
  'Services',
  'Mode & Vêtements',
  'Maison & Jardin',
  'Art & Collection',
  'Produits Numériques',
  'Autre',
] as const;

export const IS_SANDBOX = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';