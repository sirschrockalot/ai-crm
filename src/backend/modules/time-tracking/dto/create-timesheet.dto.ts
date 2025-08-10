import { IsString, IsDateString, IsNumber, IsOptional, IsMongoId, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimesheetDto {
  @ApiProperty({ description: 'Week start date' })
  @IsDateString()
  weekStartDate: string;

  @ApiProperty({ description: 'Week end date' })
  @IsDateString()
  weekEndDate: string;

  @ApiProperty({ description: 'Total hours for the week' })
  @IsNumber()
  @Min(0)
  @Max(168)
  totalHours: number;

  @ApiProperty({ description: 'Billable hours for the week' })
  @IsNumber()
  @Min(0)
  @Max(168)
  billableHours: number;

  @ApiPropertyOptional({ description: 'Array of time entry IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  entries?: string[];

  @ApiPropertyOptional({ description: 'Comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}
