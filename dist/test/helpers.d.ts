import type { Logger } from '../types/logger';
import type { Config } from '../types/config.js';
export declare const createMockLogger: () => Logger;
export declare function createTestConfig(overrides?: Partial<Config>): Config;
