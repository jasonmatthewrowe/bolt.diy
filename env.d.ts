declare global {
  interface NodeEnv {
    [key: string]: string | undefined;
  }
}

export {};
