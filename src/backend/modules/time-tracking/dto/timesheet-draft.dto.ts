import { IsArray, IsOptional, IsString, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimesheetEntryDto {
  @ApiProperty({ description: 'Date for the time entry' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Hours worked' })
  @IsNumber()
  hours: number;

  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'Task ID' })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Description of work' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class TimesheetDraftDto {
  @ApiProperty({ description: 'Week start date' })
  @IsDateString()
  weekStartDate: string;

  @ApiProperty({ description: 'Week end date' })
  @IsDateString()
  weekEndDate: string;

  @ApiProperty({ description: 'Array of time entries for the week' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetEntryDto)
  entries: TimesheetEntryDto[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
