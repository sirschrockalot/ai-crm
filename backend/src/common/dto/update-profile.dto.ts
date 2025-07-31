import { IsOptional, IsString, IsPhoneNumber, IsObject, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    @IsOptional()
    @IsIn(['light', 'dark', 'auto'])
    theme?: 'light' | 'dark' | 'auto';

    @IsOptional()
    @IsObject()
    notifications?: {
      @IsOptional()
      email?: boolean;

      @IsOptional()
      sms?: boolean;

      @IsOptional()
      push?: boolean;
    };

    @IsOptional()
    @IsObject()
    dashboard_layout?: object;

    @IsOptional()
    @IsIn(['leads', 'buyers', 'dashboard'])
    default_view?: 'leads' | 'buyers' | 'dashboard';
  };
} 