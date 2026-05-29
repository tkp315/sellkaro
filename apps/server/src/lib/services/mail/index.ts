import { Resend } from 'resend';
import type { MailConfig } from '@config/services/mail/index.js';

export interface MailService {
  client: Resend;
  from: string;
}

let mailService: MailService;

export async function init(config: MailConfig): Promise<MailService> {
  mailService = {
    client: new Resend(config.apiKey),
    from: config.from,
  };
  return mailService;
}

export function getMailService(): MailService {
  return mailService;
}

export default { init };
