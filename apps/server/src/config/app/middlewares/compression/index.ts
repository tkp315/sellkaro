export interface CompressionConfig {
  level: number; // 1-9 (6 default)
  threshold: number; // Min size to compress (1kb)
  filter: string[]; // Mime types to compress
}

async function compressionConfig(): Promise<CompressionConfig> {
  return {
    level: 6,
    threshold: 1024, // 1kb se bada ho to compress
    filter: ['text/html', 'text/css', 'application/json', 'application/javascript'],
  };
}

export default compressionConfig;
