import { vi } from 'vitest';

// Mock process.env
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_KEY = 'test-key';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    on: vi.fn(),
    off: vi.fn(),
  };

  return {
    createClient: vi.fn(() => mockClient),
  };
});

// Mock fs-extra
vi.mock('fs-extra', () => {
  const mockFs = {
    pathExists: vi.fn(),
    rmSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirp: vi.fn(),
    writeFile: vi.fn(),
    removeSync: vi.fn(),
  };

  return {
    default: mockFs,
    ...mockFs,
  };
});
