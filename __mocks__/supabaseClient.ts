// __mocks__/@/supabaseClient.ts
export default {
  from: jest.fn(() => ({
    upsert: jest.fn(),
  })),
};
