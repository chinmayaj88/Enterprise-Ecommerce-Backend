import sgMail from '@sendgrid/mail';
import { INotificationProvider, SendEmailRequest, SendEmailResponse, SendSmsRequest, SendSmsResponse, SendPushRequest, SendPushResponse } from '../../domain/repositories/INotificationProvider';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';

const logger = createLogger();
const config = getConfig();

export class SendGridEmailProvider implements INotificationProvider {
  constructor() {
    if (!config.notification?.sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid email provider');
    }

    sgMail.setApiKey(config.notification.sendgridApiKey);
  }

  getName(): string {
    return 'sendgrid';
  }

  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const msg = {
        to: request.to,
        from: {
          email: request.fromEmail || config.notification?.smtpFromEmail || 'noreply@ecommerce.com',
          name: request.fromName || config.notification?.smtpFromName || 'E-Commerce Platform',
        },
        subject: request.subject,
        text: request.bodyText || this.stripHtml(request.bodyHtml),
        html: request.bodyHtml,
      };

      const [response] = await sgMail.send(msg);

      logger.info('SendGrid email sent successfully', {
        to: request.to,
        subject: request.subject,
        messageId: response.headers['x-message-id'],
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        providerResponse: {
          statusCode: response.statusCode,
          headers: response.headers,
        },
      };
    } catch (error: any) {
      logger.error('SendGrid email send failed', {
        to: request.to,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: error.response?.body,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
        providerResponse: error.response?.body,
      };
    }
  }

  async sendSms(_request: SendSmsRequest): Promise<SendSmsResponse> {
    return {
      success: false,
      error: 'SendGrid does not support SMS. Use Twilio provider for SMS.',
    };
  }

  async sendPush(_request: SendPushRequest): Promise<SendPushResponse> {
    return {
      success: false,
      error: 'SendGrid does not support push notifications.',
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n').trim();
  }
}

