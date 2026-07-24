import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule,
    
     TypeOrmModule.forFeature([
      NotificationLog,
    ]),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
       
        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port: Number(config.get('SMTP_PORT')),
            secure: true,
            auth: {
              user: config.get<string>('SMTP_USER'),
              pass: config.get<string>('SMTP_PASSWORD'),
            },
          },
        };
      },
    }),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}