import nodemailer from 'nodemailer';
import { INotificationProvider, SendEmailRequest, SendEmailResponse, SendSmsRequest, SendSmsResponse, SendPushRequest, SendPushResponse } from '../../domain/repositories/INotificationProvider';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';

const logger = createLogger();
const config = getConfig();

export class NodemailerEmailProvider implements INotificationProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!config.notification?.smtpHost || !config.notification?.smtpPort || !config.notification?.smtpUser || !config.notification?.smtpPassword) {
      throw new Error('SMTP configuration is required for Nodemailer provider');
    }

    this.transporter = nodemailer.createTransport({
      host: config.notification.smtpHost,
      port: config.notification.smtpPort,
      secure: config.notification.smtpPort === 465,
      auth: {
        user: config.notification.smtpUser,
        pass: config.notification.smtpPassword,
      },
    });
  }

  getName(): string {
    return 'nodemailer';
  }

  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const info = await this.transporter.sendMail({
        from: `${request.fromName || config.notification?.smtpFromName || 'E-Commerce Platform'} <${request.fromEmail || config.notification?.smtpFromEmail || 'noreply@ecommerce.com'}>`,
        to: request.to,
        subject: request.subject,
        text: request.bodyText || this.stripHtml(request.bodyHtml),
        html: request.bodyHtml,
      });

      logger.info('Nodemailer email sent successfully', {
        to: request.to,
        subject: request.subject,
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
        providerResponse: {
          messageId: info.messageId,
          response: info.response,
        },
      };
    } catch (error: any) {
      logger.error('Nodemailer email send failed', {
        to: request.to,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
        providerResponse: {
          error: error.message,
        },
      };
    }
  }

  async sendSms(_request: SendSmsRequest): Promise<SendSmsResponse> {
    return {
      success: false,
      error: 'Nodemailer does not support SMS. Use Twilio provider for SMS.',
    };
  }

  async sendPush(_request: SendPushRequest): Promise<SendPushResponse> {
    return {
      success: false,
      error: 'Nodemailer does not support push notifications.',
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n').trim();
  }
}

