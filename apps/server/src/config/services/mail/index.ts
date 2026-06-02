export interface MailConfig {
  apiKey: string;
  from: string;
}

async function mailConfig(): Promise<MailConfig> {
  return {
    apiKey: process.env.RESEND_API_KEY ?? '',
    from: process.env.EMAIL_FROM ?? 'withSell App <onboarding@resend.dev>',
  };
}

export default mailConfig;
