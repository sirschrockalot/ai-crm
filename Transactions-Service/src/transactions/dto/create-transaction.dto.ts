import { IsString, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus, PropertyType, TransactionType, LoanType } from '../schemas/transaction.schema';

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  uploadedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mimeType?: string;
}

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  user: string;

  @ApiProperty()
  @IsString()
  userEmail: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mentions?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

export class CreateTransactionDto {
  @ApiProperty({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiProperty({ enum: LoanType })
  @IsOptional()
  @IsEnum(LoanType)
  loanType?: LoanType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientAccount?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preliminarySearch?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  jointVenture?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dispoWithEZ?: string;

  // Property Information
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  zip?: string;

  // Seller Information
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sellerName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sellerPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sellerEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seller2Name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seller2Phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seller2Email?: string;

  // Buyer Information
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buyerName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buyerEmail?: string;

  // Agent Details
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  acquisitionsAgent?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  acquisitionsAgentEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  acquisitionsAgentPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dispositionsAgent?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dispositionsAgentEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dispositionsAgentPhone?: string;

  // Title & Lender Details
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titlePhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleOfficeAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lenderName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lenderEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lenderOffice?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lenderPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lenderType?: string;

  @ApiProperty()
  @IsDateString()
  contractDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coordinatorName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [CreateDocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentDto)
  @IsOptional()
  documents?: CreateDocumentDto[];

  @ApiPropertyOptional({ type: [CreateActivityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDto)
  @IsOptional()
  activities?: CreateActivityDto[];
}
