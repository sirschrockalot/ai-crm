import { IsOptional, IsBoolean, IsString, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FieldMappingDto {
  @ApiProperty({ description: 'CSV column name' })
  @IsString()
  csvColumn: string;

  @ApiProperty({ description: 'Database field name' })
  @IsString()
  dbField: string;
}

export class ImportOptionsDto {
  @ApiProperty({ 
    description: 'Whether to update existing leads',
    required: false,
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;

  @ApiProperty({ 
    description: 'Whether to skip duplicate leads',
    required: false,
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @ApiProperty({ 
    description: 'Custom field mapping',
    required: false,
    type: [FieldMappingDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  fieldMapping?: FieldMappingDto[];

  @ApiProperty({ 
    description: 'Batch size for processing',
    required: false,
    default: 100 
  })
  @IsOptional()
  batchSize?: number;

  @ApiProperty({ 
    description: 'Default source for imported leads',
    required: false,
    default: 'import' 
  })
  @IsOptional()
  @IsString()
  defaultSource?: string;

  @ApiProperty({ 
    description: 'Default status for imported leads',
    required: false,
    default: 'new' 
  })
  @IsOptional()
  @IsString()
  defaultStatus?: string;

  @ApiProperty({ 
    description: 'Default priority for imported leads',
    required: false,
    default: 'medium' 
  })
  @IsOptional()
  @IsString()
  defaultPriority?: string;

  @ApiProperty({ 
    description: 'Default tags for imported leads',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultTags?: string[];
}

export class ImportResultDto {
  @ApiProperty({ description: 'Import ID for tracking' })
  importId: string;

  @ApiProperty({ description: 'Total records processed' })
  totalRecords: number;

  @ApiProperty({ description: 'Successfully imported records' })
  successfulRows: number;

  @ApiProperty({ description: 'Failed records' })
  failedRows: number;

  @ApiProperty({ description: 'Import status' })
  status: 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Error details for failed records' })
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;

  @ApiProperty({ description: 'Import start time' })
  startedAt: Date;

  @ApiProperty({ description: 'Import completion time' })
  completedAt?: Date;

  @ApiProperty({ description: 'Processing duration in milliseconds' })
  duration?: number;
}
