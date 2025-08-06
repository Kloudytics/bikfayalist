// Type declarations for bcryptjs
// Backup type definition in case @types/bcryptjs isn't properly loaded in Netlify

declare module 'bcryptjs' {
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>
  export function hashSync(data: string | Buffer, saltOrRounds: string | number): string
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>
  export function compareSync(data: string | Buffer, encrypted: string): boolean
  export function genSalt(rounds?: number, minor?: 'a' | 'b'): Promise<string>
  export function genSaltSync(rounds?: number, minor?: 'a' | 'b'): string
  export function getRounds(encrypted: string): number
}