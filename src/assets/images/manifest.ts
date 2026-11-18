import heroPharmacyAvif from './source/hero-pharmacy.jpg?w=480;960;1440;2400&format=avif&as=srcset';
import heroPharmacyWebp from './source/hero-pharmacy.jpg?w=480;960;1440;2400&format=webp&as=srcset';
import heroPharmacyJpgSet from './source/hero-pharmacy.jpg?w=480;960;1440;2400&format=jpg&as=srcset';
import heroPharmacyJpg from './source/hero-pharmacy.jpg?w=1440&format=jpg&as=url';
import heroPharmacyBlur from './source/hero-pharmacy.jpg?w=24&format=webp&inline';
import shelvesAvif from './source/shelves.jpg?w=480;960;1440;1600&format=avif&as=srcset';
import shelvesWebp from './source/shelves.jpg?w=480;960;1440;1600&format=webp&as=srcset';
import shelvesJpgSet from './source/shelves.jpg?w=480;960;1440;1600&format=jpg&as=srcset';
import shelvesJpg from './source/shelves.jpg?w=1440&format=jpg&as=url';
import shelvesBlur from './source/shelves.jpg?w=24&format=webp&inline';
import capsulesAvif from './source/capsules.jpg?w=480;960;1440;1600&format=avif&as=srcset';
import capsulesWebp from './source/capsules.jpg?w=480;960;1440;1600&format=webp&as=srcset';
import capsulesJpgSet from './source/capsules.jpg?w=480;960;1440;1600&format=jpg&as=srcset';
import capsulesJpg from './source/capsules.jpg?w=1440&format=jpg&as=url';
import capsulesBlur from './source/capsules.jpg?w=24&format=webp&inline';
import suppliesAvif from './source/supplies.jpg?w=480;960;1440;1600&format=avif&as=srcset';
import suppliesWebp from './source/supplies.jpg?w=480;960;1440;1600&format=webp&as=srcset';
import suppliesJpgSet from './source/supplies.jpg?w=480;960;1440;1600&format=jpg&as=srcset';
import suppliesJpg from './source/supplies.jpg?w=1440&format=jpg&as=url';
import suppliesBlur from './source/supplies.jpg?w=24&format=webp&inline';
import dashboardTileAvif from './source/dashboard-tile.jpg?w=480;960;1440;1600&format=avif&as=srcset';
import dashboardTileWebp from './source/dashboard-tile.jpg?w=480;960;1440;1600&format=webp&as=srcset';
import dashboardTileJpgSet from './source/dashboard-tile.jpg?w=480;960;1440;1600&format=jpg&as=srcset';
import dashboardTileJpg from './source/dashboard-tile.jpg?w=1440&format=jpg&as=url';
import dashboardTileBlur from './source/dashboard-tile.jpg?w=24&format=webp&inline';
import bottleStillAvif from './source/bottle-still.jpg?w=480;960;1200&format=avif&as=srcset';
import bottleStillWebp from './source/bottle-still.jpg?w=480;960;1200&format=webp&as=srcset';
import bottleStillJpgSet from './source/bottle-still.jpg?w=480;960;1200&format=jpg&as=srcset';
import bottleStillJpg from './source/bottle-still.jpg?w=1200&format=jpg&as=url';
import bottleStillBlur from './source/bottle-still.jpg?w=24&format=webp&inline';

export interface ImageCredit {
  photographer: string;
  source: string;
  licence: string;
}

export interface ImageSources {
  avif: string;
  webp: string;
  jpgSrcset: string;
  jpg: string;
  placeholder: string;
}

export interface ImageEntry {
  key: ImageKey;
  src: ImageSources;
  width: number;
  height: number;
  alt: string;
  credit: ImageCredit;
  isPlaceholder: boolean;
}

export type ImageKey = 'heroPharmacy' | 'shelves' | 'capsules' | 'supplies' | 'dashboardTile' | 'bottleStill';

export const images: Record<ImageKey, ImageEntry> = {
  heroPharmacy: {
    key: 'heroPharmacy',
    src: {
      avif: heroPharmacyAvif,
      webp: heroPharmacyWebp,
      jpgSrcset: heroPharmacyJpgSet,
      jpg: heroPharmacyJpg,
      placeholder: heroPharmacyBlur,
    },
    width: 2400,
    height: 1600,
    alt: "Bright, modern pharmacy interior with neatly stocked white shelves",
    credit: {
      photographer: "Unsplash contributor",
      source: "https://images.unsplash.com/photo-1576602976047-174e57a47881",
      licence: "Unsplash License (https://unsplash.com/license)",
    },
    isPlaceholder: false,
  },
  shelves: {
    key: 'shelves',
    src: {
      avif: shelvesAvif,
      webp: shelvesWebp,
      jpgSrcset: shelvesJpgSet,
      jpg: shelvesJpg,
      placeholder: shelvesBlur,
    },
    width: 1600,
    height: 1067,
    alt: "Medicine bottles lined up on a pharmacy shelf in soft focus",
    credit: {
      photographer: "Unsplash contributor",
      source: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a",
      licence: "Unsplash License (https://unsplash.com/license)",
    },
    isPlaceholder: false,
  },
  capsules: {
    key: 'capsules',
    src: {
      avif: capsulesAvif,
      webp: capsulesWebp,
      jpgSrcset: capsulesJpgSet,
      jpg: capsulesJpg,
      placeholder: capsulesBlur,
    },
    width: 1600,
    height: 1067,
    alt: "Close-up of assorted capsules and tablets",
    credit: {
      photographer: "Unsplash contributor",
      source: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6",
      licence: "Unsplash License (https://unsplash.com/license)",
    },
    isPlaceholder: false,
  },
  supplies: {
    key: 'supplies',
    src: {
      avif: suppliesAvif,
      webp: suppliesWebp,
      jpgSrcset: suppliesJpgSet,
      jpg: suppliesJpg,
      placeholder: suppliesBlur,
    },
    width: 1600,
    height: 1067,
    alt: "Stethoscope, pill organiser, blister pack and thermometer on a white surface",
    credit: {
      photographer: "Unsplash contributor",
      source: "https://images.unsplash.com/photo-1603398938378-e54eab446dde",
      licence: "Unsplash License (https://unsplash.com/license)",
    },
    isPlaceholder: false,
  },
  dashboardTile: {
    key: 'dashboardTile',
    src: {
      avif: dashboardTileAvif,
      webp: dashboardTileWebp,
      jpgSrcset: dashboardTileJpgSet,
      jpg: dashboardTileJpg,
      placeholder: dashboardTileBlur,
    },
    width: 1600,
    height: 1067,
    alt: "Blister packs of tablets and capsules arranged together",
    credit: {
      photographer: "Unsplash contributor",
      source: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926",
      licence: "Unsplash License (https://unsplash.com/license)",
    },
    isPlaceholder: false,
  },
  bottleStill: {
    key: 'bottleStill',
    src: {
      avif: bottleStillAvif,
      webp: bottleStillWebp,
      jpgSrcset: bottleStillJpgSet,
      jpg: bottleStillJpg,
      placeholder: bottleStillBlur,
    },
    width: 1200,
    height: 900,
    alt: "Hand holding a vintage glass bottle of aspirin tablets",
    credit: {
      photographer: "Unsplash contributor",
      source: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76",
      licence: "Unsplash License (https://unsplash.com/license)",
    },
    isPlaceholder: false,
  },
};

export const imageKeys = Object.keys(images) as ImageKey[];
