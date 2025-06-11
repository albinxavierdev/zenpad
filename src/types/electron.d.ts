interface ElectronAPI {
  saveFile: (content: string) => Promise<void>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {}; 