
interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

interface QRCodeLib {
  toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
}

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
  QRCode?: QRCodeLib;
  jspdf?: {
    jsPDF: JsPDFConstructor;
  };
  initGoogleMaps?: () => void;
  google?: any;
}
