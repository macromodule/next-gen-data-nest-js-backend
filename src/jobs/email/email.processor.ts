import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE_NAME, SendWelcomeEmailJob } from './email.queue';
import { JOBS } from '../constants';

@Processor(EMAIL_QUEUE_NAME)
export class EmailProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<SendWelcomeEmailJob, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    switch (job.name) {
      case JOBS.SEND_WELCOME_EMAIL:
      case 'send_welcome_email':
        return this.handleWelcomeEmail(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        return null;
    }
  }

  private async handleWelcomeEmail(data: SendWelcomeEmailJob) {
    this.logger.log(
      `📧 [Email Worker] Delivering welcome email to ${data.name} <${data.email}>...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.log(`✅ Welcome email successfully delivered to ${data.email}`);
    return { delivered: true, recipient: data.email, timestamp: new Date().toISOString() };
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully closing EmailProcessor worker queue...');
    if (this.worker) {
      await this.worker.close();
      this.logger.log('EmailProcessor worker closed successfully.');
    }
  }
}
