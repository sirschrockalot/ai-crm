import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveTimesheetDto {
  @ApiProperty({ description: 'Whether to approve or reject the timesheet' })
  @IsBoolean()
  approved: boolean;

  @ApiPropertyOptional({ description: 'Comments for approval/rejection' })
  @IsOptional()
  @IsString()
  comments?: string;
}
