export interface WindowElectronAPIs {
    homeDir: string;
    userProfile: string;
    platform: string;
    exec(command: string): void;
  }