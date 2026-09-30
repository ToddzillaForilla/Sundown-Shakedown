export interface StageDefinition {
  id: string;
  displayName: string;
  subtitle: string;
  background: {
    textureKey: string;
    url: string;
  };
  skyTop: number;
  skyBottom: number;
  ground: number;
  fence: number;
}

