import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionDocument, TransactionStatus } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AddActivityDto } from './dto/add-activity.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transactionId = uuidv4();
    
    const transactionData = {
      id: transactionId,
      status: TransactionStatus.GATHERING_DOCS,
      ...createTransactionDto,
      contractDate: new Date(createTransactionDto.contractDate),
      documents: createTransactionDto.documents?.map(doc => ({
        id: uuidv4(),
        ...doc,
        uploadedAt: new Date(),
      })) || [],
      activities: createTransactionDto.activities?.map(activity => ({
        id: uuidv4(),
        ...activity,
        timestamp: new Date(),
        likes: 0,
      })) || [],
    };

    const transaction = new this.transactionModel(transactionData);
    return transaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const updateData: any = { ...updateTransactionDto };
    
    // Handle date conversion
    if (updateTransactionDto.contractDate) {
      updateData.contractDate = new Date(updateTransactionDto.contractDate);
    }

    // Handle nested array updates - these are typically not updated directly
    // Documents and activities are managed through separate endpoints

    const transaction = await this.transactionModel
      .findOneAndUpdate({ id }, updateData, { new: true, runValidators: true })
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findOneAndUpdate(
        { id },
        { status: updateStatusDto.status },
        { new: true }
      )
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
  }

  async addActivity(id: string, addActivityDto: AddActivityDto): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const newActivity = {
      id: uuidv4(),
      ...addActivityDto,
      timestamp: new Date(),
      likes: 0,
    };

    transaction.activities.unshift(newActivity);
    return transaction.save();
  }

  async addDocument(id: string, documentData: any): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const newDocument = {
      id: uuidv4(),
      ...documentData,
      uploadedAt: new Date(),
    };

    transaction.documents.push(newDocument);
    return transaction.save();
  }

  async removeDocument(id: string, documentId: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const documentIndex = transaction.documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    transaction.documents.splice(documentIndex, 1);
    return transaction.save();
  }

  async likeActivity(id: string, activityId: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const activity = transaction.activities.find(act => act.id === activityId);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    activity.likes += 1;
    return transaction.save();
  }

  async removeActivity(id: string, activityId: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const activityIndex = transaction.activities.findIndex(act => act.id === activityId);
    if (activityIndex === -1) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    transaction.activities.splice(activityIndex, 1);
    return transaction.save();
  }

  async findByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return this.transactionModel.find({ status }).sort({ createdAt: -1 }).exec();
  }

  async findByCoordinator(coordinatorName: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({ coordinatorName })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats(): Promise<any> {
    const stats = await this.transactionModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await this.transactionModel.countDocuments();
    
    return {
      total,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };
  }
}
