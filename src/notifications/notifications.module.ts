import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NotificationLog]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST');
        const port = Number(config.get('SMTP_PORT') ?? 25);
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASSWORD');
        const auth = user && pass ? { user, pass } : undefined;
        const from =
          config.get<string>('SMTP_FROM') ||
          (user ? `Almond FinBank <${user}>` : 'Almond FinBank <no-reply@almondsystems.com.ng>');

        return {
          transport: {
            host,
            port,
            secure: port === 465,
            auth,
          },
          defaults: {
            from,
          },
        };
      },
    }),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
