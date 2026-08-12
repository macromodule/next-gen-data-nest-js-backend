import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const EMAIL_QUEUE_NAME = 'email_queue';

export interface SendWelcomeEmailJob {
  userId: string;
  email: string;
  name: string;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue(EMAIL_QUEUE_NAME) private readonly emailQueue: Queue) {}

  async queueWelcomeEmail(data: SendWelcomeEmailJob) {
    const job = await this.emailQueue.add('send_welcome_email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(`Queued welcome email job ${job.id} for ${data.email}`);
    return job;
  }
}
