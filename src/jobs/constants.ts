export const EMAIL_QUEUE_NAME = 'email_queue';

export const QUEUES = {
  EMAIL: EMAIL_QUEUE_NAME,
} as const;

export const JOBS = {
  SEND_WELCOME_EMAIL: 'send_welcome_email',
} as const;
