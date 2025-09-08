import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../schemas/transaction.schema';

export class UpdateStatusDto {
  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
