export type Difficulty = 'easy' | 'medium' | 'hard';
export type Light = 'low' | 'indirect' | 'indirect-bright' | 'direct';
export type WaterFrequency = 'daily' | 'every-2-3-days' | 'weekly' | 'every-2-weeks' | 'monthly';
export type Humidity = 'low' | 'medium' | 'high';
export type ToxicityLevel = 'non-toxic' | 'mildly-toxic' | 'toxic-to-pets' | 'toxic';
export type SecondaryFunction =
  | 'humidity-boosting'
  | 'air-purifying'
  | 'insect-repelling'
  | 'pleasant-scent'
  | 'medicinal'
  | 'pet-safe';

export interface PlantFrontmatter {
  title: string;
  slug: string;
  commonName: string;
  scientificName: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  light: Light;
  water: WaterFrequency;
  humidity: Humidity;
  temperature: string;
  toxicity: ToxicityLevel;
  growthRate: 'slow' | 'moderate' | 'fast';
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;           // local path e.g. /images/plants/monstera-deliciosa.jpg
  imageAlt?: string;        // descriptive alt text
  imageCredit?: string;     // photographer name for Unsplash attribution
  imageCreditUrl?: string;  // link to photographer's profile
  secondaryFunctions?: SecondaryFunction[];
}

export interface Plant extends PlantFrontmatter {
  content: string;
  readingTime: string;
  faqs?: { question: string; answer: string }[];
}

export interface PlantCardData {
  title: string;
  slug: string;
  commonName: string;
  scientificName: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  light: Light;
  water: WaterFrequency;
  humidity: Humidity;
  toxicity: ToxicityLevel;
  growthRate: 'slow' | 'moderate' | 'fast';
  description: string;
  searchTerms: string[];
  searchText: string;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  secondaryFunctions?: SecondaryFunction[];
}
