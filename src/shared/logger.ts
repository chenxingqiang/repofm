import * as prompts from '@clack/prompts';
import type { Logger } from '../types/logger.js';

export const logger: Logger = {
  log: (message: string | number) => {
    prompts.log.message(String(message));
  },
  error: (message: string | Error, ...args: unknown[]) => {
    if (message instanceof Error) {
      prompts.log.error(message.message);
    } else {
      prompts.log.error(message);
    }
  },
  success: (message: string) => {
    prompts.log.success(message);
  },
  warn: (message: string) => {
    prompts.log.warn(message);
  },
  info: (message: string) => {
    prompts.log.info(message);
  },
  debug: (message: string, ...args: unknown[]) => {
    prompts.log.message(`[DEBUG] ${message}`);
  },
  trace: (message: string) => {
    prompts.log.message(`[TRACE] ${message}`);
  }
};
