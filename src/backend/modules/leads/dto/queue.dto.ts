import { IsString, IsNumber, IsOptional, Min, Max, IsMongoId } from 'class-validator';

export class CreateQueueItemDto {
  @IsMongoId()
  leadId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number = 1;
}

export class UpdateQueueItemDto {
  @IsOptional()
  @IsMongoId()
  agentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;
}

export class QueueResponseDto {
  success: boolean;
  data: any;
  message: string;
}

export class QueueStatsDto {
  totalItems: number;
  pendingItems: number;
  assignedItems: number;
  averageWaitTime: number;
  priorityDistribution: Record<string, number>;
}

export class QueueItemsResponseDto {
  items: any[];
  total: number;
  page: number;
  totalPages: number;
} 