import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTimesheetDto {
  @ApiPropertyOptional({ description: 'Week start date' })
  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

  @ApiPropertyOptional({ description: 'Week end date' })
  @IsOptional()
  @IsDateString()
  weekEndDate?: string;

  @ApiPropertyOptional({ description: 'Total hours for the week' })
  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @ApiPropertyOptional({ description: 'Billable hours for the week' })
  @IsOptional()
  @IsNumber()
  billableHours?: number;

  @ApiPropertyOptional({ description: 'Timesheet status' })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';

  @ApiPropertyOptional({ description: 'Array of time entry IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entries?: string[];

  @ApiPropertyOptional({ description: 'Additional comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}
