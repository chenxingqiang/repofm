declare module 'cli-spinners' {
  interface Spinner {
    interval: number;
    frames: string[];
  }

  const spinners: {
    dots: Spinner;
    [key: string]: Spinner;
  };

  export default spinners;
}

declare module 'istextorbinary' {
  export function isBinary(filepath: string | null, buffer?: Buffer): boolean;
}

declare module 'jschardet' {
  export function detect(buffer: Buffer): { encoding: string | null };
}

declare module 'log-update' {
  function logUpdate(text: string): void;
  namespace logUpdate {
    function done(): void;
  }
  export default logUpdate;
}

declare module 'p-map' {
  function pMap<T, R>(
    input: Iterable<T>,
    mapper: (element: T, index: number) => Promise<R> | R,
    options?: { concurrency?: number }
  ): Promise<R[]>;
  export default pMap;
}

declare module 'tiktoken' {
  export interface Tiktoken {
    encode(text: string): number[];
    decode(tokens: number[]): string;
    free(): void;
  }

  export function get_encoding(encoding_name: string): Tiktoken;
}
