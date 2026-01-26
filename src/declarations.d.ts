
interface JsPDFInstance {
  internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
  };
  addImage(imageData: string, format: string, x: number, y: number, w: number, h: number): void;
  save(filename: string): void;
}

interface JsPDFConstructor {
  new (orientation?: string, unit?: string, format?: string): JsPDFInstance;
}

interface Window {
  jspdf?: {
    jsPDF: JsPDFConstructor;
  };
  initGoogleMaps?: () => void;
  google?: any;
}

declare module 'qrcode' {
  export function toDataURL(text: string, options?: any): Promise<string>;
}
