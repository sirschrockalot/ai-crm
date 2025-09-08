import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AddActivityDto } from './dto/add-activity.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TransactionStatus } from './schemas/transaction.schema';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  findAll(@Query('status') status?: TransactionStatus) {
    if (status) {
      return this.transactionsService.findByStatus(status);
    }
    return this.transactionsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Transaction statistics' })
  getStats() {
    return this.transactionsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.transactionsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add activity to transaction' })
  @ApiResponse({ status: 201, description: 'Activity added successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  addActivity(@Param('id') id: string, @Body() addActivityDto: AddActivityDto) {
    return this.transactionsService.addActivity(id, addActivityDto);
  }

  @Post(':id/activities/:activityId/like')
  @ApiOperation({ summary: 'Like an activity' })
  @ApiResponse({ status: 200, description: 'Activity liked successfully' })
  @ApiResponse({ status: 404, description: 'Transaction or activity not found' })
  likeActivity(@Param('id') id: string, @Param('activityId') activityId: string) {
    return this.transactionsService.likeActivity(id, activityId);
  }

  @Delete(':id/activities/:activityId')
  @ApiOperation({ summary: 'Remove an activity' })
  @ApiResponse({ status: 200, description: 'Activity removed successfully' })
  @ApiResponse({ status: 404, description: 'Transaction or activity not found' })
  removeActivity(@Param('id') id: string, @Param('activityId') activityId: string) {
    return this.transactionsService.removeActivity(id, activityId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload document to transaction' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadedBy') uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const documentData = {
      name: file.originalname,
      url: `/uploads/${file.filename}`, // In production, this would be a proper file URL
      uploadedBy,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    return this.transactionsService.addDocument(id, documentData);
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Remove document from transaction' })
  @ApiResponse({ status: 200, description: 'Document removed successfully' })
  @ApiResponse({ status: 404, description: 'Transaction or document not found' })
  removeDocument(@Param('id') id: string, @Param('documentId') documentId: string) {
    return this.transactionsService.removeDocument(id, documentId);
  }

  @Get('coordinator/:coordinatorName')
  @ApiOperation({ summary: 'Get transactions by coordinator' })
  @ApiResponse({ status: 200, description: 'List of transactions for coordinator' })
  findByCoordinator(@Param('coordinatorName') coordinatorName: string) {
    return this.transactionsService.findByCoordinator(coordinatorName);
  }
}
