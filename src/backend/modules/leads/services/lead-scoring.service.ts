import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument, LeadStatus, LeadSource, LeadPriority } from '../schemas/lead.schema';
import { ScoringCategory, ScoringAlgorithm, UpdateFrequency } from '../dto/scoring.dto';

export interface ScoringFactor {
  name: string;
  weight: number;
  minValue: number;
  maxValue: number;
  description: string;
  category: ScoringCategory;
}

export interface ScoringResult {
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  factorScores: FactorScore[];
  explanation: string;
  confidence: number;
  lastUpdated: Date;
}

export interface FactorScore {
  factor: string;
  score: number;
  weight: number;
  weightedScore: number;
  explanation: string;
  category: ScoringCategory;
}

export interface ScoringConfiguration {
  factors: ScoringFactor[];
  algorithm: ScoringAlgorithm;
  updateFrequency: UpdateFrequency;
  minScore: number;
  maxScore: number;
  thresholds: {
    hot: number;
    warm: number;
    cold: number;
  };
}

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);
  private defaultConfiguration: ScoringConfiguration;

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {
    this.initializeDefaultConfiguration();
  }

  /**
   * Initialize default scoring configuration
   */
  private initializeDefaultConfiguration(): void {
    this.defaultConfiguration = {
      factors: [
        // Demographic factors
        {
          name: 'property_preferences_match',
          weight: 15,
          minValue: 0,
          maxValue: 100,
          description: 'Match between lead preferences and available properties',
          category: ScoringCategory.DEMOGRAPHIC,
        },
        {
          name: 'location_preference',
          weight: 10,
          minValue: 0,
          maxValue: 100,
          description: 'Location preference strength and specificity',
          category: ScoringCategory.DEMOGRAPHIC,
        },
        {
          name: 'budget_alignment',
          weight: 20,
          minValue: 0,
          maxValue: 100,
          description: 'Alignment between budget and property prices',
          category: ScoringCategory.FINANCIAL,
        },
        {
          name: 'financial_qualification',
          weight: 25,
          minValue: 0,
          maxValue: 100,
          description: 'Financial qualification strength',
          category: ScoringCategory.FINANCIAL,
        },
        {
          name: 'engagement_level',
          weight: 15,
          minValue: 0,
          maxValue: 100,
          description: 'Level of engagement with communications',
          category: ScoringCategory.ENGAGEMENT,
        },
        {
          name: 'source_quality',
          weight: 8,
          minValue: 0,
          maxValue: 100,
          description: 'Quality of lead source',
          category: ScoringCategory.SOURCE,
        },
        {
          name: 'urgency_indicator',
          weight: 12,
          minValue: 0,
          maxValue: 100,
          description: 'Indicators of urgency to buy/sell',
          category: ScoringCategory.BEHAVIORAL,
        },
        {
          name: 'communication_responsiveness',
          weight: 10,
          minValue: 0,
          maxValue: 100,
          description: 'Response time and quality to communications',
          category: ScoringCategory.ENGAGEMENT,
        },
        {
          name: 'market_knowledge',
          weight: 5,
          minValue: 0,
          maxValue: 100,
          description: 'Knowledge of real estate market',
          category: ScoringCategory.BEHAVIORAL,
        },
      ],
      algorithm: ScoringAlgorithm.WEIGHTED,
      updateFrequency: UpdateFrequency.REALTIME,
      minScore: 0,
      maxScore: 100,
      thresholds: {
        hot: 80,
        warm: 60,
        cold: 40,
      },
    };
  }

  /**
   * Calculate lead score using weighted algorithm
   */
  async calculateLeadScore(leadId: string, configuration?: ScoringConfiguration): Promise<ScoringResult> {
    const config = configuration || this.defaultConfiguration;
    const lead = await this.leadModel.findOne({ leadId }).exec();
    
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    const factorScores: FactorScore[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate scores for each factor
    for (const factor of config.factors) {
      const factorScore = await this.calculateFactorScore(lead, factor);
      const weightedScore = (factorScore.score / factor.maxValue) * factor.weight;
      
      factorScores.push({
        factor: factor.name,
        score: factorScore.score,
        weight: factor.weight,
        weightedScore,
        explanation: factorScore.explanation,
        category: factor.category,
      });

      totalScore += weightedScore;
      maxPossibleScore += factor.weight;
    }

    const percentageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const confidence = this.calculateConfidence(factorScores, lead);

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      maxPossibleScore,
      percentageScore: Math.round(percentageScore * 100) / 100,
      factorScores,
      explanation: this.generateExplanation(factorScores, percentageScore),
      confidence: Math.round(confidence * 100) / 100,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate score for a specific factor
   */
  private async calculateFactorScore(lead: LeadDocument, factor: ScoringFactor): Promise<{ score: number; explanation: string }> {
    switch (factor.name) {
      case 'property_preferences_match':
        return this.calculatePropertyPreferencesMatch(lead);
      case 'location_preference':
        return this.calculateLocationPreference(lead);
      case 'budget_alignment':
        return this.calculateBudgetAlignment(lead);
      case 'financial_qualification':
        return this.calculateFinancialQualification(lead);
      case 'engagement_level':
        return this.calculateEngagementLevel(lead);
      case 'source_quality':
        return this.calculateSourceQuality(lead);
      case 'urgency_indicator':
        return this.calculateUrgencyIndicator(lead);
      case 'communication_responsiveness':
        return this.calculateCommunicationResponsiveness(lead);
      case 'market_knowledge':
        return this.calculateMarketKnowledge(lead);
      default:
        return { score: 0, explanation: 'Factor not implemented' };
    }
  }

  /**
   * Calculate property preferences match score
   */
  private calculatePropertyPreferencesMatch(lead: LeadDocument): { score: number; explanation: string } {
    if (!lead.propertyPreferences) {
      return { score: 0, explanation: 'No property preferences defined' };
    }

    let score = 50; // Base score
    const prefs = lead.propertyPreferences;

    // Property type specificity
    if (prefs.propertyType && prefs.propertyType.length > 0) {
      score += Math.min(prefs.propertyType.length * 5, 20);
    }

    // Price range specificity
    if (prefs.minPrice && prefs.maxPrice) {
      const priceRange = prefs.maxPrice - prefs.minPrice;
      const priceSpecificity = Math.max(0, 100 - (priceRange / prefs.maxPrice) * 100);
      score += priceSpecificity * 0.2;
    }

    // Location specificity
    if (prefs.preferredLocations && prefs.preferredLocations.length > 0) {
      score += Math.min(prefs.preferredLocations.length * 3, 15);
    }

    // Feature specificity
    if (prefs.mustHaveFeatures && prefs.mustHaveFeatures.length > 0) {
      score += Math.min(prefs.mustHaveFeatures.length * 2, 10);
    }

    return {
      score: Math.min(score, 100),
      explanation: `Property preferences match score based on type specificity, price range, and location preferences`,
    };
  }

  /**
   * Calculate location preference score
   */
  private calculateLocationPreference(lead: LeadDocument): { score: number; explanation: string } {
    if (!lead.propertyPreferences?.preferredLocations) {
      return { score: 0, explanation: 'No location preferences defined' };
    }

    const locations = lead.propertyPreferences.preferredLocations;
    let score = 0;

    // Number of preferred locations (fewer = more specific)
    if (locations.length === 1) {
      score = 90;
    } else if (locations.length <= 3) {
      score = 70;
    } else if (locations.length <= 5) {
      score = 50;
    } else {
      score = 30;
    }

    // Location specificity (city vs state vs region)
    const specificLocations = locations.filter(loc => loc.includes(',') || loc.split(' ').length <= 2);
    if (specificLocations.length > 0) {
      score += 10;
    }

    return {
      score: Math.min(score, 100),
      explanation: `Location preference score based on ${locations.length} locations with ${specificLocations.length} specific areas`,
    };
  }

  /**
   * Calculate budget alignment score
   */
  private calculateBudgetAlignment(lead: LeadDocument): { score: number; explanation: string } {
    if (!lead.propertyPreferences?.minPrice || !lead.propertyPreferences?.maxPrice) {
      return { score: 0, explanation: 'No budget information available' };
    }

    const minPrice = lead.propertyPreferences.minPrice;
    const maxPrice = lead.propertyPreferences.maxPrice;
    let score = 0;

    // Price range rationality
    const priceRange = maxPrice - minPrice;
    const rangePercentage = (priceRange / maxPrice) * 100;

    if (rangePercentage <= 20) {
      score = 90; // Very specific budget
    } else if (rangePercentage <= 40) {
      score = 70; // Reasonable range
    } else if (rangePercentage <= 60) {
      score = 50; // Wide range
    } else {
      score = 30; // Very wide range
    }

    // Budget realism (assuming market data available)
    // This would typically compare against market prices
    score += 10; // Placeholder for market comparison

    return {
      score: Math.min(score, 100),
      explanation: `Budget alignment score based on price range of ${rangePercentage.toFixed(1)}%`,
    };
  }

  /**
   * Calculate financial qualification score
   */
  private calculateFinancialQualification(lead: LeadDocument): { score: number; explanation: string } {
    if (!lead.financialInfo) {
      return { score: 0, explanation: 'No financial information available' };
    }

    const fin = lead.financialInfo;
    let score = 0;

    // Pre-approval status
    if (fin.preApproved) {
      score += 40;
    }

    // Down payment percentage
    if (fin.downPaymentPercentage) {
      if (fin.downPaymentPercentage >= 20) {
        score += 30;
      } else if (fin.downPaymentPercentage >= 10) {
        score += 20;
      } else if (fin.downPaymentPercentage >= 5) {
        score += 10;
      }
    }

    // Credit score
    if (fin.creditScore) {
      if (fin.creditScore >= 750) {
        score += 20;
      } else if (fin.creditScore >= 700) {
        score += 15;
      } else if (fin.creditScore >= 650) {
        score += 10;
      }
    }

    // Employment stability
    if (fin.employmentStatus === 'employed' && fin.employmentLength) {
      if (fin.employmentLength >= 24) {
        score += 10;
      } else if (fin.employmentLength >= 12) {
        score += 5;
      }
    }

    return {
      score: Math.min(score, 100),
      explanation: `Financial qualification based on pre-approval, down payment, credit score, and employment stability`,
    };
  }

  /**
   * Calculate engagement level score
   */
  private calculateEngagementLevel(lead: LeadDocument): { score: number; explanation: string } {
    if (!lead.communicationHistory || lead.communicationHistory.length === 0) {
      return { score: 0, explanation: 'No communication history available' };
    }

    const communications = lead.communicationHistory;
    let score = 0;

    // Number of communications
    if (communications.length >= 10) {
      score += 30;
    } else if (communications.length >= 5) {
      score += 20;
    } else if (communications.length >= 2) {
      score += 10;
    }

    // Recent activity
    const recentCommunications = communications.filter(
      comm => new Date().getTime() - comm.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );
    if (recentCommunications.length > 0) {
      score += 20;
    }

    // Response quality
    const successfulCommunications = communications.filter(
      comm => comm.outcome === 'successful'
    );
    const responseRate = successfulCommunications.length / communications.length;
    score += responseRate * 30;

    // Two-way communication
    const inboundCount = communications.filter(comm => comm.direction === 'inbound').length;
    const outboundCount = communications.filter(comm => comm.direction === 'outbound').length;
    if (inboundCount > 0 && outboundCount > 0) {
      score += 20;
    }

    return {
      score: Math.min(score, 100),
      explanation: `Engagement level based on ${communications.length} communications with ${responseRate.toFixed(1)} response rate`,
    };
  }

  /**
   * Calculate source quality score
   */
  private calculateSourceQuality(lead: LeadDocument): { score: number; explanation: string } {
    const sourceQualityMap: Record<LeadSource, number> = {
      [LeadSource.REFERRAL]: 90,
      [LeadSource.WEBSITE]: 80,
      [LeadSource.OPEN_HOUSE]: 75,
      [LeadSource.EMAIL_CAMPAIGN]: 70,
      [LeadSource.SOCIAL_MEDIA]: 65,
      [LeadSource.SMS_CAMPAIGN]: 60,
      [LeadSource.PARTNER]: 55,
      [LeadSource.FOR_SALE_SIGN]: 50,
      [LeadSource.ONLINE_AD]: 45,
      [LeadSource.PRINT_AD]: 40,
      [LeadSource.RADIO_AD]: 35,
      [LeadSource.TV_AD]: 30,
      [LeadSource.EVENT]: 25,
      [LeadSource.COLD_CALL]: 20,
      [LeadSource.OTHER]: 10,
    };

    const score = sourceQualityMap[lead.source] || 10;

    return {
      score,
      explanation: `Source quality score for ${lead.source} lead source`,
    };
  }

  /**
   * Calculate urgency indicator score
   */
  private calculateUrgencyIndicator(lead: LeadDocument): { score: number; explanation: string } {
    let score = 0;

    // Expected close date
    if (lead.expectedCloseDate) {
      const daysUntilClose = Math.ceil(
        (lead.expectedCloseDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilClose <= 30) {
        score += 40;
      } else if (daysUntilClose <= 60) {
        score += 30;
      } else if (daysUntilClose <= 90) {
        score += 20;
      }
    }

    // Next follow-up date
    if (lead.nextFollowUpDate) {
      const daysUntilFollowUp = Math.ceil(
        (lead.nextFollowUpDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilFollowUp <= 1) {
        score += 30;
      } else if (daysUntilFollowUp <= 3) {
        score += 20;
      } else if (daysUntilFollowUp <= 7) {
        score += 10;
      }
    }

    // Status urgency
    const urgentStatuses = [
      LeadStatus.NEGOTIATING,
      LeadStatus.OFFER_MADE,
      LeadStatus.UNDER_CONTRACT,
      LeadStatus.APPOINTMENT_SCHEDULED,
    ];
    if (urgentStatuses.includes(lead.status)) {
      score += 30;
    }

    return {
      score: Math.min(score, 100),
      explanation: `Urgency indicator based on close date, follow-up timing, and current status`,
    };
  }

  /**
   * Calculate communication responsiveness score
   */
  private calculateCommunicationResponsiveness(lead: LeadDocument): { score: number; explanation: string } {
    if (!lead.communicationHistory || lead.communicationHistory.length === 0) {
      return { score: 0, explanation: 'No communication history available' };
    }

    const communications = lead.communicationHistory;
    let totalResponseTime = 0;
    let responseCount = 0;

    // Calculate average response time
    for (const comm of communications) {
      if (comm.direction === 'inbound' && comm.outcome === 'successful') {
        // Find the previous outbound communication
        const previousOutbound = communications
          .filter(c => c.direction === 'outbound' && c.timestamp < comm.timestamp)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

        if (previousOutbound) {
          const responseTime = comm.timestamp.getTime() - previousOutbound.timestamp.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }

    if (responseCount === 0) {
      return { score: 0, explanation: 'No responsive communications found' };
    }

    const avgResponseTimeHours = totalResponseTime / responseCount / (1000 * 60 * 60);
    let score = 0;

    if (avgResponseTimeHours <= 1) {
      score = 90;
    } else if (avgResponseTimeHours <= 4) {
      score = 80;
    } else if (avgResponseTimeHours <= 24) {
      score = 70;
    } else if (avgResponseTimeHours <= 48) {
      score = 50;
    } else if (avgResponseTimeHours <= 168) {
      score = 30;
    } else {
      score = 10;
    }

    return {
      score,
      explanation: `Communication responsiveness based on average response time of ${avgResponseTimeHours.toFixed(1)} hours`,
    };
  }

  /**
   * Calculate market knowledge score
   */
  private calculateMarketKnowledge(lead: LeadDocument): { score: number; explanation: string } {
    let score = 50; // Base score

    // Property viewing history
    if (lead.propertiesViewed && lead.propertiesViewed.length > 0) {
      score += Math.min(lead.propertiesViewed.length * 5, 30);
    }

    // Offer history
    if (lead.offers && lead.offers.length > 0) {
      score += Math.min(lead.offers.length * 10, 20);
    }

    // Communication sophistication
    if (lead.communicationHistory && lead.communicationHistory.length > 0) {
      const sophisticatedTerms = lead.communicationHistory.some(comm =>
        comm.content.toLowerCase().includes('closing costs') ||
        comm.content.toLowerCase().includes('escrow') ||
        comm.content.toLowerCase().includes('contingency') ||
        comm.content.toLowerCase().includes('inspection')
      );
      if (sophisticatedTerms) {
        score += 20;
      }
    }

    return {
      score: Math.min(score, 100),
      explanation: `Market knowledge based on property viewings, offer history, and communication sophistication`,
    };
  }

  /**
   * Calculate confidence level for scoring result
   */
  private calculateConfidence(factorScores: FactorScore[], lead: LeadDocument): number {
    let confidence = 100;
    let missingFactors = 0;

    // Reduce confidence for missing data
    for (const factorScore of factorScores) {
      if (factorScore.score === 0) {
        missingFactors++;
      }
    }

    const missingPercentage = (missingFactors / factorScores.length) * 100;
    confidence -= missingPercentage * 0.5; // Reduce confidence by 0.5% per missing factor

    // Reduce confidence for new leads
    const leadAge = new Date().getTime() - lead.createdAt.getTime();
    const leadAgeDays = leadAge / (1000 * 60 * 60 * 24);
    if (leadAgeDays < 7) {
      confidence -= 20;
    } else if (leadAgeDays < 30) {
      confidence -= 10;
    }

    return Math.max(confidence, 0);
  }

  /**
   * Generate explanation for scoring result
   */
  private generateExplanation(factorScores: FactorScore[], percentageScore: number): string {
    const topFactors = factorScores
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 3);

    const explanations = topFactors.map(factor => 
      `${factor.factor.replace(/_/g, ' ')} (${factor.weightedScore.toFixed(1)} points)`
    );

    let scoreLevel = 'cold';
    if (percentageScore >= 80) {
      scoreLevel = 'hot';
    } else if (percentageScore >= 60) {
      scoreLevel = 'warm';
    }

    return `Lead scored as ${scoreLevel} (${percentageScore.toFixed(1)}%) based primarily on: ${explanations.join(', ')}`;
  }

  /**
   * Get scoring configuration
   */
  getScoringConfiguration(): ScoringConfiguration {
    return this.defaultConfiguration;
  }

  /**
   * Update scoring configuration
   */
  updateScoringConfiguration(configuration: Partial<ScoringConfiguration>): void {
    this.defaultConfiguration = { ...this.defaultConfiguration, ...configuration };
    this.logger.log('Scoring configuration updated');
  }

  /**
   * Get lead score category
   */
  getLeadScoreCategory(percentageScore: number): 'hot' | 'warm' | 'cold' {
    if (percentageScore >= this.defaultConfiguration.thresholds.hot) {
      return 'hot';
    } else if (percentageScore >= this.defaultConfiguration.thresholds.warm) {
      return 'warm';
    } else {
      return 'cold';
    }
  }

  /**
   * Batch calculate scores for multiple leads
   */
  async batchCalculateScores(leadIds: string[]): Promise<Map<string, ScoringResult>> {
    const results = new Map<string, ScoringResult>();
    
    for (const leadId of leadIds) {
      try {
        const score = await this.calculateLeadScore(leadId);
        results.set(leadId, score);
      } catch (error) {
        this.logger.error(`Failed to calculate score for lead ${leadId}:`, error.message);
      }
    }

    return results;
  }
} 