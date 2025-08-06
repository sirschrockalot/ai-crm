import { IsString, IsNumber, IsOptional, Min, Max, IsMongoId, IsEnum } from 'class-validator';

export class CreateAssignmentDto {
  @IsMongoId()
  leadId: string;

  @IsOptional()
  @IsMongoId()
  agentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number = 1;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsMongoId()
  agentId?: string;

  @IsOptional()
  @IsEnum(['pending', 'accepted', 'rejected', 'reassigned', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignmentResponseDto {
  success: boolean;
  data: any;
  message: string;
}

export class AssignmentStatsDto {
  totalAssignments: number;
  successfulAssignments: number;
  failedAssignments: number;
  averageAssignmentTime: number;
  workloadBalanceScore: number;
  skillMatchScore: number;
  agentUtilization: Record<string, number>;
}

export class AgentCapacityDto {
  agentId: string;
  name: string;
  currentWorkload: number;
  maxCapacity: number;
  utilization: number;
  skills: string[];
  availability: string;
  lastActive: Date;
} 