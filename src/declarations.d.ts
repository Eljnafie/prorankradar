
declare module 'qrcode' {
  export interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    version?: number;
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  export function toDataURL(text: string, callback: (error: Error | null | undefined, url: string) => void): void;
  export function toDataURL(text: string, options: QRCodeOptions, callback: (error: Error | null | undefined, url: string) => void): void;
}
