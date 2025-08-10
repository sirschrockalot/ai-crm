import { IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTimeEntryDto } from './create-time-entry.dto';

export class BulkUpdateTimeEntryDto {
  @ApiProperty({ description: 'Time entry ID to update' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: 'Updated time entry data' })
  @IsOptional()
  data: Partial<CreateTimeEntryDto>;
}

export class BulkCreateTimeEntriesDto {
  @ApiProperty({ description: 'Array of time entries to create', type: [CreateTimeEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeEntryDto)
  entries: CreateTimeEntryDto[];
}

export class BulkUpdateTimeEntriesDto {
  @ApiProperty({ description: 'Array of time entry updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateTimeEntryDto)
  updates: BulkUpdateTimeEntryDto[];
}
