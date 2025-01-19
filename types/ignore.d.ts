declare module 'ignore' {
  interface Ignore {
    add(pattern: string | string[]): Ignore;
    ignore(file: string): boolean;
  }

  function ignore(): Ignore;
  export default ignore;
}
