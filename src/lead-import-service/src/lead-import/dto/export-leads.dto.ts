import { IsOptional, IsString, IsArray, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'xlsx',
  JSON = 'json'
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class ExportFilterDto {
  @ApiProperty({ description: 'Filter by lead status', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiProperty({ description: 'Filter by lead priority', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priority?: string[];

  @ApiProperty({ description: 'Filter by lead source', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  source?: string[];

  @ApiProperty({ description: 'Filter by assigned user ID', required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Filter by tags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Filter by date range - start date', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'Filter by date range - end date', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'Filter by minimum lead score', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minLeadScore?: number;

  @ApiProperty({ description: 'Filter by maximum lead score', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxLeadScore?: number;

  @ApiProperty({ description: 'Search term for text search', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

export class ExportOptionsDto {
  @ApiProperty({ 
    description: 'Export format',
    enum: ExportFormat,
    default: ExportFormat.CSV 
  })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({ 
    description: 'Fields to include in export',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiProperty({ 
    description: 'Whether to include headers',
    required: false,
    default: true 
  })
  @IsOptional()
  includeHeaders?: boolean;

  @ApiProperty({ 
    description: 'CSV delimiter for CSV format',
    required: false,
    default: ',' 
  })
  @IsOptional()
  @IsString()
  csvDelimiter?: string;

  @ApiProperty({ 
    description: 'Whether to include empty fields',
    required: false,
    default: false 
  })
  @IsOptional()
  includeEmptyFields?: boolean;

  @ApiProperty({ 
    description: 'Custom filename for export',
    required: false 
  })
  @IsOptional()
  @IsString()
  filename?: string;
}

export class ExportRequestDto {
  @ApiProperty({ description: 'Export filters' })
  filters: ExportFilterDto;

  @ApiProperty({ description: 'Export options' })
  options: ExportOptionsDto;
}

export class ExportResultDto {
  @ApiProperty({ description: 'Export ID for tracking' })
  exportId: string;

  @ApiProperty({ description: 'Export status' })
  status: ExportStatus;

  @ApiProperty({ description: 'Total records exported' })
  totalRecords: number;

  @ApiProperty({ description: 'Export start time' })
  startedAt: Date;

  @ApiProperty({ description: 'Export completion time' })
  completedAt?: Date;

  @ApiProperty({ description: 'Processing duration in milliseconds' })
  duration?: number;

  @ApiProperty({ description: 'Download URL for completed export' })
  downloadUrl?: string;

  @ApiProperty({ description: 'Error message if export failed' })
  error?: string;
}
