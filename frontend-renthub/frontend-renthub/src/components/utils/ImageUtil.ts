export class ImageUtil {
    static buildUrl(relativePath: string | null | undefined): string {
      if (!relativePath) return "";
      const base = import.meta.env.VITE_API_URL;
      return `${base}/${relativePath.startsWith("/") ? relativePath.slice(1) : relativePath}`;
    }
  }
  