export const PI_PRICING = {
  SELLER_REGISTRATION: 0.01,
  PRODUCT_PUBLICATION: 0.001,
} as const;

export const PRODUCT_CATEGORIES = [
  'Électronique',
  'Téléphones',
  'Ordinateurs',
  'Mode',
  'Chaussures',
  'Maison',
  'Beauté',
  'Services',
  'Jeux',
  'Accessoires',
  'Alimentation',
  'Autres',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  'Électronique': 'Zap',
  'Téléphones': 'Smartphone',
  'Ordinateurs': 'Laptop',
  'Mode': 'Shirt',
  'Chaussures': 'Footprints',
  'Maison': 'Home',
  'Beauté': 'Sparkles',
  'Services': 'Briefcase',
  'Jeux': 'Gamepad2',
  'Accessoires': 'Watch',
  'Alimentation': 'Utensils',
  'Autres': 'Package',
};

export const IS_SANDBOX = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true' || process.env.NEXT_PUBLIC_PI_SANDBOX === undefined;
export const SITE_NAME = 'PiMarket';
export const SITE_DESCRIPTION = 'La marketplace publique moderne pour acheter et vendre avec Pi Network';
