export interface MorganConfig {
  format: string; // 'dev', 'combined', 'common', 'short', 'tiny'
  skip: boolean; // Skip logging for certain conditions
}

async function morganConfig(): Promise<MorganConfig> {
  const isProduction = process.env.NODE_ENV === 'prod';

  return {
    format: isProduction ? 'combined' : 'dev',
    skip: false,
  };
}

export default morganConfig;
