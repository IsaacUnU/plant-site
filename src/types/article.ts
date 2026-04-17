export interface ArticleFrontmatter {
  title: string;
  slug: string;
  type: 'listicle' | 'guide' | 'tutorial';
  category: string;
  tags: string[];
  description: string;
  featuredPlants?: string[];
  datePublished: string;
  dateModified: string;
  image?: string;
  imageAlt?: string;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: string;
  faqs?: { question: string; answer: string }[];
}

export interface ArticleCardData {
  title: string;
  slug: string;
  type: 'listicle' | 'guide' | 'tutorial';
  category: string;
  tags: string[];
  description: string;
  featuredPlants?: string[];
  datePublished: string;
  dateModified?: string;
  image?: string;
  imageAlt?: string;
}
