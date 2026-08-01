export interface ActiveRelationship {
  targetCharacterId: string;
  targetCharacterName?: string;
  relationType: string;
  trustLevel?: number;       // 0 - 100
  tensionLevel?: 'baja' | 'media' | 'alta' | 'extrema';
  polarity?: number;         // -100 (hostil) a +100 (aliado)
}

export interface CharacterEntity {
  id?: string;
  name: string;
  description: string;
  archetype?: string;
  emotionalState?: string;
  knownSecrets?: string[];
  activeRelationships?: ActiveRelationship[];
}

export interface ArtifactItem {
  id?: string;
  name: string;
  physicalDescription: string;
  symbolism?: string;
  currentOwnerId?: string;
  status: 'intacto' | 'roto' | 'oculto' | 'encantado' | 'robado';
}

export interface SceneContext {
  id?: string;
  location?: string;
  weather?: string;
  dramaticTension?: number; // 1-10
  activeWorldRules?: string[];
  pacing?: 'exposition' | 'conflict' | 'climax' | 'resolution';
}

export interface SubplotThread {
  id: string;
  description: string;
  status: 'abierto' | 'intensificado' | 'resuelto';
  introducedInChapter: number;
}

export interface Chapter {
  title: string;
  summary?: string;
  content?: string;
  parts?: string[];
  images?: string[];
  sceneContext?: SceneContext;
  presentArtifacts?: ArtifactItem[];
  stateMutations?: {
    emotionalChanges?: { characterName: string; newState: string }[];
    artifactChanges?: { artifactName: string; newStatus: string }[];
    unresolvedThreads?: string[];
  };
}

export interface Novel {
  folderName: string;
  title: string;
  description: string;
  characters: CharacterEntity[];
  artifacts?: ArtifactItem[];
  globalSubplots?: SubplotThread[];
  chapters: Chapter[];
  dateCreated?: string;
  isComplete: boolean;
  totalWords?: number;
  totalImages?: number;
}
