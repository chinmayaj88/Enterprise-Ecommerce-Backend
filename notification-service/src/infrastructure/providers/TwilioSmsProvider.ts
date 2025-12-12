import twilio from 'twilio';
import { INotificationProvider, SendEmailRequest, SendEmailResponse, SendSmsRequest, SendSmsResponse, SendPushRequest, SendPushResponse } from '../../domain/repositories/INotificationProvider';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';

const logger = createLogger();
const config = getConfig();

export class TwilioSmsProvider implements INotificationProvider {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    if (!config.notification?.twilioAccountSid || !config.notification?.twilioAuthToken || !config.notification?.twilioPhoneNumber) {
      throw new Error('Twilio configuration is required for Twilio SMS provider');
    }

    this.client = twilio(config.notification.twilioAccountSid, config.notification.twilioAuthToken);
    this.fromNumber = config.notification.twilioPhoneNumber;
  }

  getName(): string {
    return 'twilio';
  }

  async sendEmail(_request: SendEmailRequest): Promise<SendEmailResponse> {
    return {
      success: false,
      error: 'Twilio does not support email. Use SendGrid or Nodemailer for email.',
    };
  }

  async sendSms(request: SendSmsRequest): Promise<SendSmsResponse> {
    try {
      const message = await this.client.messages.create({
        body: request.message,
        from: this.fromNumber,
        to: request.to,
      });

      logger.info('Twilio SMS sent successfully', {
        to: request.to,
        messageId: message.sid,
      });

      return {
        success: true,
        messageId: message.sid,
        providerResponse: {
          sid: message.sid,
          status: message.status,
          dateCreated: message.dateCreated,
        },
      };
    } catch (error: any) {
      logger.error('Twilio SMS send failed', {
        to: request.to,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
        providerResponse: {
          error: error.message,
        },
      };
    }
  }

  async sendPush(_request: SendPushRequest): Promise<SendPushResponse> {
    return {
      success: false,
      error: 'Twilio does not support push notifications.',
    };
  }
}

