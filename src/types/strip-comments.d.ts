declare module 'strip-comments' {
  interface StripOptions {
    line?: boolean;
    block?: boolean;
    safe?: boolean;
    keepProtected?: boolean;
    preserveNewlines?: boolean;
    language?: string;
  }

  function strip(input: string, options?: StripOptions): string;
  
  export = strip;
} 