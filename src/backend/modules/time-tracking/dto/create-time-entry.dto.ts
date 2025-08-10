import { IsString, IsDateString, IsNumber, IsBoolean, IsOptional, IsMongoId, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeEntryDto {
  @ApiProperty({ description: 'Project ID' })
  @IsMongoId()
  projectId: string;

  @ApiPropertyOptional({ description: 'Task ID' })
  @IsOptional()
  @IsMongoId()
  taskId?: string;

  @ApiProperty({ description: 'Start time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Duration in hours' })
  @IsNumber()
  @Min(0)
  @Max(24)
  duration: number;

  @ApiProperty({ description: 'Description of work' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Whether time is billable' })
  @IsBoolean()
  billable: boolean;

  @ApiPropertyOptional({ description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}
