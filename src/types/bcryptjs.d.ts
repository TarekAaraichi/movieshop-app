/*
 * bcryptjs type declarations
 * Ambient type declarations for the bcryptjs package used in seeding or auth flows.
 */

declare module "bcryptjs" {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function compareSync(data: string, encrypted: string): boolean;
  export function hash(data: string, saltOrRounds: number): Promise<string>;
  export function hashSync(data: string, saltOrRounds: number): string;
}
