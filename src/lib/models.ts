export interface LanguageContent {
  text: string;
}

export interface EnglishText {
  narrator?: string;
  text: string;
}

export interface HadithLanguages {
  ar: LanguageContent;
  en: EnglishText;
  al?: LanguageContent;
}

export interface ChapterMetadata {
  id: number;
  language: {
    en: LanguageContent;
    ar: LanguageContent;
    al?: LanguageContent;
  };
}

export interface VolumeMetadata {
  id: number;
}

export interface HadithMetadata {
  volume: VolumeMetadata;
  chapter: ChapterMetadata;
}

export interface Hadith {
  id: number;
  metadata: HadithMetadata;
  language: HadithLanguages;
}

export interface Chapter {
  id: number;
  hadiths: Hadith[];
}

export interface Volume {
  id: number;
  chapters: Chapter[];
}

export interface Book {
  collection: string;
  slug: string;
  volumes?: Volume[];
}
