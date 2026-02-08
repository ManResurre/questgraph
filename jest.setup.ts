// jest.setup.ts
// Мокаем все зависимости здесь

// Мокаем supabaseClient
jest.mock('./src/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      upsert: jest.fn(),
    })),
  },
}));

// Мокаем RepositoryHelper
jest.mock('./src/lib/RepositoryHelper', () => ({
  __esModule: true,
  parseLocations: jest.fn(),
  parsePaths: jest.fn(),
  cleanUndefined: (obj: any) => obj,
}));

// Мокаем supabase
jest.mock('./src/supabase', () => ({
  __esModule: true,
  Database: {
    public: {
      Tables: {
        scene: {
          Row: {
            id: 0,
            locPosition: null,
            name: null,
            position: null,
            quest_id: 0,
            samplyLink: null,
          },
          Insert: {},
          Update: {},
        },
        choice: {
          Row: {
            id: 0,
            label: null,
            nextSceneId: null,
            quest_id: null,
            text: null,
            transition_text: null,
          },
          Insert: {},
          Update: {},
        },
        scene_texts: {
          Row: {
            id: 0,
            scene_id: null,
            text: null,
          },
          Insert: {},
          Update: {},
        },
      },
    },
  },
}));

// Мокаем ChoiceRepository
jest.mock('./src/lib/ChoiceRepository', () => ({
  __esModule: true,
  Choice: {},
}));
