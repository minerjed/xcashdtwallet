export interface WindowElectronFs {
    readFileSync(filePath: string, options?: { encoding?: string; flag?: string }): string | Buffer;
    unlinkSync(filePath: string): void;
    renameSync(oldPath: string, newPath: string): void;
    writeFileSync(filePath: string, data: string | Buffer, options?: { encoding?: string | null; mode?: number | string; flag?: string; }): void;
    existsSync(filePath: string) : boolean;
    readdirSync(path: string): string[];
  }