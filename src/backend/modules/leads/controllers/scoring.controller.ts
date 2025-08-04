import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { LeadScoringService } from '../services/lead-scoring.service';
import {
  ScoringConfigurationDto,
  ScoringResultDto,
  LeadScoreResponseDto,
  BatchScoringRequestDto,
  BatchScoringResponseDto,
  ScoringStatsDto,
  UpdateScoringConfigurationDto,
  ScoringPerformanceDto,
} from '../dto/scoring.dto';
import { RequestWithTenant } from '../../../common/middleware/tenant-isolation.middleware';

@ApiTags('Lead Scoring')
@Controller('leads/scoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScoringController {
  constructor(private readonly leadScoringService: LeadScoringService) {}

  @Post(':leadId/score')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Calculate lead score',
    description: 'Calculates a comprehensive score for a specific lead',
  })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead score calculated successfully',
    type: LeadScoreResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async calculateLeadScore(
    @Param('leadId') leadId: string,
    @Body() configuration?: ScoringConfigurationDto,
    @Request() req?: RequestWithTenant,
  ): Promise<LeadScoreResponseDto> {
    const score = await this.leadScoringService.calculateLeadScore(leadId, configuration);
    const category = this.leadScoringService.getLeadScoreCategory(score.percentageScore);

    return {
      leadId,
      score,
      category,
    };
  }

  @Post('batch')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Batch calculate lead scores',
    description: 'Calculates scores for multiple leads in a single operation',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch scoring completed successfully',
    type: BatchScoringResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async batchCalculateScores(
    @Body() batchRequest: BatchScoringRequestDto,
    @Request() req: RequestWithTenant,
  ): Promise<BatchScoringResponseDto> {
    const startTime = Date.now();
    const results = await this.leadScoringService.batchCalculateScores(batchRequest.leadIds);
    
    const leadScoreResponses: LeadScoreResponseDto[] = [];
    let successful = 0;
    let failed = 0;

    for (const [leadId, score] of results) {
      try {
        const category = this.leadScoringService.getLeadScoreCategory(score.percentageScore);
        leadScoreResponses.push({
          leadId,
          score,
          category,
        });
        successful++;
      } catch (error) {
        failed++;
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      results: leadScoreResponses,
      totalProcessed: batchRequest.leadIds.length,
      successful,
      failed,
      processingTimeMs,
    };
  }

  @Get('configuration')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Get scoring configuration',
    description: 'Retrieves the current scoring configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Scoring configuration retrieved successfully',
    type: ScoringConfigurationDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getScoringConfiguration(): Promise<ScoringConfigurationDto> {
    return this.leadScoringService.getScoringConfiguration();
  }

  @Put('configuration')
  @Roles('admin')
  @ApiOperation({
    summary: 'Update scoring configuration',
    description: 'Updates the scoring configuration with new settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Scoring configuration updated successfully',
    type: ScoringConfigurationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateScoringConfiguration(
    @Body() updateDto: UpdateScoringConfigurationDto,
  ): Promise<ScoringConfigurationDto> {
    this.leadScoringService.updateScoringConfiguration(updateDto);
    return this.leadScoringService.getScoringConfiguration();
  }

  @Get('stats')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get scoring statistics',
    description: 'Retrieves comprehensive scoring statistics and analytics',
  })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date for statistics' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date for statistics' })
  @ApiResponse({
    status: 200,
    description: 'Scoring statistics retrieved successfully',
    type: ScoringStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getScoringStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<ScoringStatsDto> {
    // This would typically call a service method to calculate statistics
    // For now, returning mock data structure
    return {
      totalLeads: 0,
      hotLeads: 0,
      warmLeads: 0,
      coldLeads: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      scoreDistribution: {
        hot: 0,
        warm: 0,
        cold: 0,
      },
      topFactors: [],
    };
  }

  @Get('performance')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Get scoring performance metrics',
    description: 'Retrieves performance metrics for the scoring system',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
    type: ScoringPerformanceDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getScoringPerformance(): Promise<ScoringPerformanceDto> {
    // This would typically call a service method to calculate performance metrics
    // For now, returning mock data structure
    return {
      averageScoringTimeMs: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      successRate: 0,
      lastOperationTime: new Date(),
      performanceByPeriod: [],
    };
  }

  @Post('recalculate-all')
  @Roles('admin')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Recalculate all lead scores',
    description: 'Triggers recalculation of scores for all leads in the system',
  })
  @ApiResponse({
    status: 202,
    description: 'Recalculation job started successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async recalculateAllScores(): Promise<{ message: string; jobId: string }> {
    // This would typically trigger a background job
    const jobId = `recalc_${Date.now()}`;
    return {
      message: 'Lead score recalculation job started',
      jobId,
    };
  }

  @Get('factors')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get scoring factors',
    description: 'Retrieves all available scoring factors and their configurations',
  })
  @ApiResponse({
    status: 200,
    description: 'Scoring factors retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getScoringFactors(): Promise<{ factors: any[] }> {
    const config = this.leadScoringService.getScoringConfiguration();
    return {
      factors: config.factors,
    };
  }

  @Get('explain/:leadId')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Explain lead score',
    description: 'Provides detailed explanation of how a lead score was calculated',
  })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Score explanation retrieved successfully',
    type: ScoringResultDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async explainLeadScore(
    @Param('leadId') leadId: string,
  ): Promise<ScoringResultDto> {
    return this.leadScoringService.calculateLeadScore(leadId);
  }

  @Post('validate-configuration')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Validate scoring configuration',
    description: 'Validates a scoring configuration without applying it',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration validation completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Configuration validation failed',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async validateConfiguration(
    @Body() configuration: ScoringConfigurationDto,
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate factor weights sum to 100
    const totalWeight = configuration.factors.reduce((sum, factor) => sum + factor.weight, 0);
    if (totalWeight !== 100) {
      errors.push(`Total factor weights must equal 100, got ${totalWeight}`);
    }

    // Validate thresholds
    if (configuration.thresholds.hot <= configuration.thresholds.warm) {
      errors.push('Hot threshold must be greater than warm threshold');
    }
    if (configuration.thresholds.warm <= configuration.thresholds.cold) {
      errors.push('Warm threshold must be greater than cold threshold');
    }

    // Check for duplicate factor names
    const factorNames = configuration.factors.map(f => f.name);
    const duplicateNames = factorNames.filter((name, index) => factorNames.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      errors.push(`Duplicate factor names: ${duplicateNames.join(', ')}`);
    }

    // Check for factors with zero weight
    const zeroWeightFactors = configuration.factors.filter(f => f.weight === 0);
    if (zeroWeightFactors.length > 0) {
      warnings.push(`Factors with zero weight: ${zeroWeightFactors.map(f => f.name).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
} 