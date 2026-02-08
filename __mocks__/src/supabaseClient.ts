// __mocks__/src/supabaseClient.ts
const mockFrom = jest.fn(() => ({
  upsert: jest.fn(),
}));

const mockSupabase = {
  from: mockFrom,
};

export default mockSupabase;
