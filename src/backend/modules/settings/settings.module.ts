import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { UserSchema } from '../users/schemas/user.schema';
import { UserPreferencesSchema } from './schemas/user-preferences.schema';
import { NotificationSettingsSchema } from './schemas/notification-settings.schema';
import { SecuritySettingsSchema } from './schemas/security-settings.schema';
import { SystemSettingsSchema } from './schemas/system-settings.schema';
import { CompanyBrandingSchema } from './schemas/company-branding.schema';
import { CustomFieldSchema } from './schemas/custom-field.schema';
import { WorkflowSchema } from './schemas/workflow.schema';
import { AuditLogSchema } from './schemas/audit-log.schema';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserPreferences', schema: UserPreferencesSchema },
      { name: 'NotificationSettings', schema: NotificationSettingsSchema },
      { name: 'SecuritySettings', schema: SecuritySettingsSchema },
      { name: 'SystemSettings', schema: SystemSettingsSchema },
      { name: 'CompanyBranding', schema: CompanyBrandingSchema },
      { name: 'CustomField', schema: CustomFieldSchema },
      { name: 'Workflow', schema: WorkflowSchema },
      { name: 'AuditLog', schema: AuditLogSchema },
    ]),
    SharedModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
