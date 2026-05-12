export interface HelmetConfig {
  contentSecurityPolicy?: boolean | object;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  dnsPrefetchControl?: boolean;
  frameguard?: boolean | { action: string };
  hidePoweredBy?: boolean;
  hsts: boolean | { maxAge: number; includeSubDomains: boolean };
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: boolean | { policy: string };
  xssFilter?: boolean;
}

async function helmetConfig(): Promise<HelmetConfig> {
  const isProduction = process.env.NODE_ENV === 'prod';

  return {
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: false, // Disable for API
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' } as any,
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  };
}

export default helmetConfig;
