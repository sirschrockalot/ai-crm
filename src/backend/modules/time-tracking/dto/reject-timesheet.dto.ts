import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectTimesheetDto {
  @ApiProperty({ description: 'Reason for rejecting the timesheet' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Additional comments for the rejection' })
  @IsString()
  @IsNotEmpty()
  comments: string;
}
