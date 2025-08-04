import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, IsDate, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ScoringAlgorithm {
  WEIGHTED = 'weighted',
  ML = 'ml',
  HYBRID = 'hybrid',
}

export enum UpdateFrequency {
  REALTIME = 'realtime',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export enum ScoringCategory {
  DEMOGRAPHIC = 'demographic',
  BEHAVIORAL = 'behavioral',
  FINANCIAL = 'financial',
  ENGAGEMENT = 'engagement',
  SOURCE = 'source',
}

export class ScoringFactorDto {
  @ApiProperty({ description: 'Factor name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Factor weight', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiProperty({ description: 'Minimum value for the factor' })
  @IsNumber()
  minValue: number;

  @ApiProperty({ description: 'Maximum value for the factor' })
  @IsNumber()
  maxValue: number;

  @ApiProperty({ description: 'Factor description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Factor category', enum: ScoringCategory })
  @IsEnum(ScoringCategory)
  category: ScoringCategory;
}

export class ScoringThresholdsDto {
  @ApiProperty({ description: 'Hot lead threshold', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  hot: number;

  @ApiProperty({ description: 'Warm lead threshold', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  warm: number;

  @ApiProperty({ description: 'Cold lead threshold', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  cold: number;
}

export class ScoringConfigurationDto {
  @ApiProperty({ description: 'Scoring factors', type: [ScoringFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoringFactorDto)
  factors: ScoringFactorDto[];

  @ApiProperty({ description: 'Scoring algorithm', enum: ScoringAlgorithm })
  @IsEnum(ScoringAlgorithm)
  algorithm: ScoringAlgorithm;

  @ApiProperty({ description: 'Update frequency', enum: UpdateFrequency })
  @IsEnum(UpdateFrequency)
  updateFrequency: UpdateFrequency;

  @ApiProperty({ description: 'Minimum score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore: number;

  @ApiProperty({ description: 'Maximum score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore: number;

  @ApiProperty({ description: 'Scoring thresholds', type: ScoringThresholdsDto })
  @ValidateNested()
  @Type(() => ScoringThresholdsDto)
  thresholds: ScoringThresholdsDto;
}

export class FactorScoreDto {
  @ApiProperty({ description: 'Factor name' })
  @IsString()
  factor: string;

  @ApiProperty({ description: 'Raw score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: 'Factor weight', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiProperty({ description: 'Weighted score' })
  @IsNumber()
  weightedScore: number;

  @ApiProperty({ description: 'Score explanation' })
  @IsString()
  explanation: string;

  @ApiProperty({ description: 'Factor category', enum: ScoringCategory })
  @IsEnum(ScoringCategory)
  category: ScoringCategory;
}

export class ScoringResultDto {
  @ApiProperty({ description: 'Total weighted score' })
  @IsNumber()
  totalScore: number;

  @ApiProperty({ description: 'Maximum possible score' })
  @IsNumber()
  maxPossibleScore: number;

  @ApiProperty({ description: 'Percentage score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentageScore: number;

  @ApiProperty({ description: 'Individual factor scores', type: [FactorScoreDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FactorScoreDto)
  factorScores: FactorScoreDto[];

  @ApiProperty({ description: 'Overall explanation' })
  @IsString()
  explanation: string;

  @ApiProperty({ description: 'Confidence level', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;
}

export class LeadScoreResponseDto {
  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Lead score result', type: ScoringResultDto })
  @ValidateNested()
  @Type(() => ScoringResultDto)
  score: ScoringResultDto;

  @ApiProperty({ description: 'Score category' })
  @IsString()
  category: 'hot' | 'warm' | 'cold';
}

export class BatchScoringRequestDto {
  @ApiProperty({ description: 'Lead IDs to score', type: [String] })
  @IsArray()
  @IsString({ each: true })
  leadIds: string[];

  @ApiProperty({ description: 'Scoring configuration', type: ScoringConfigurationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScoringConfigurationDto)
  configuration?: ScoringConfigurationDto;
}

export class BatchScoringResponseDto {
  @ApiProperty({ description: 'Scoring results', type: [LeadScoreResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadScoreResponseDto)
  results: LeadScoreResponseDto[];

  @ApiProperty({ description: 'Total leads processed' })
  @IsNumber()
  totalProcessed: number;

  @ApiProperty({ description: 'Successfully scored leads' })
  @IsNumber()
  successful: number;

  @ApiProperty({ description: 'Failed to score leads' })
  @IsNumber()
  failed: number;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  @IsNumber()
  processingTimeMs: number;
}

export class ScoringStatsDto {
  @ApiProperty({ description: 'Total leads scored' })
  @IsNumber()
  totalLeads: number;

  @ApiProperty({ description: 'Hot leads count' })
  @IsNumber()
  hotLeads: number;

  @ApiProperty({ description: 'Warm leads count' })
  @IsNumber()
  warmLeads: number;

  @ApiProperty({ description: 'Cold leads count' })
  @IsNumber()
  coldLeads: number;

  @ApiProperty({ description: 'Average score' })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Highest score' })
  @IsNumber()
  highestScore: number;

  @ApiProperty({ description: 'Lowest score' })
  @IsNumber()
  lowestScore: number;

  @ApiProperty({ description: 'Score distribution by category' })
  scoreDistribution: {
    hot: number;
    warm: number;
    cold: number;
  };

  @ApiProperty({ description: 'Top scoring factors' })
  topFactors: {
    factor: string;
    averageScore: number;
    impact: number;
  }[];
}

export class UpdateScoringConfigurationDto {
  @ApiProperty({ description: 'Scoring factors', type: [ScoringFactorDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoringFactorDto)
  factors?: ScoringFactorDto[];

  @ApiProperty({ description: 'Scoring algorithm', enum: ScoringAlgorithm, required: false })
  @IsOptional()
  @IsEnum(ScoringAlgorithm)
  algorithm?: ScoringAlgorithm;

  @ApiProperty({ description: 'Update frequency', enum: UpdateFrequency, required: false })
  @IsOptional()
  @IsEnum(UpdateFrequency)
  updateFrequency?: UpdateFrequency;

  @ApiProperty({ description: 'Minimum score', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @ApiProperty({ description: 'Maximum score', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore?: number;

  @ApiProperty({ description: 'Scoring thresholds', type: ScoringThresholdsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScoringThresholdsDto)
  thresholds?: ScoringThresholdsDto;
}

export class ScoringFactorUpdateDto {
  @ApiProperty({ description: 'Factor name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'New weight', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @ApiProperty({ description: 'New description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'New category', enum: ScoringCategory, required: false })
  @IsOptional()
  @IsEnum(ScoringCategory)
  category?: ScoringCategory;

  @ApiProperty({ description: 'Whether factor is enabled', required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ScoringPerformanceDto {
  @ApiProperty({ description: 'Average scoring time in milliseconds' })
  @IsNumber()
  averageScoringTimeMs: number;

  @ApiProperty({ description: 'Total scoring operations' })
  @IsNumber()
  totalOperations: number;

  @ApiProperty({ description: 'Successful scoring operations' })
  @IsNumber()
  successfulOperations: number;

  @ApiProperty({ description: 'Failed scoring operations' })
  @IsNumber()
  failedOperations: number;

  @ApiProperty({ description: 'Success rate percentage' })
  @IsNumber()
  successRate: number;

  @ApiProperty({ description: 'Last scoring operation timestamp' })
  @IsDate()
  @Type(() => Date)
  lastOperationTime: Date;

  @ApiProperty({ description: 'Performance metrics by time period' })
  performanceByPeriod: {
    period: string;
    averageTimeMs: number;
    totalOperations: number;
    successRate: number;
  }[];
} 