import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignmentService, AssignmentResult, AssignmentStats } from '../services/assignment.service';
import { CreateAssignmentDto, UpdateAssignmentDto, AssignmentResponseDto } from '../dto/assignment.dto';

@Controller('leads/assign')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  /**
   * Automatically assign a lead to the best available agent
   */
  @Post('auto')
  async autoAssignLead(@Body() createAssignmentDto: CreateAssignmentDto): Promise<AssignmentResponseDto> {
    const result = await this.assignmentService.assignLeadToAgent(
      createAssignmentDto.leadId,
      createAssignmentDto.priority
    );
    
    return {
      success: result.success,
      data: result,
      message: result.success ? 'Lead assigned successfully' : result.reason || 'Assignment failed',
    };
  }

  /**
   * Manually assign a lead to a specific agent
   */
  @Post('manual')
  async manualAssignLead(@Body() createAssignmentDto: CreateAssignmentDto): Promise<AssignmentResponseDto> {
    const result = await this.assignmentService.manualAssignLead(
      createAssignmentDto.leadId,
      createAssignmentDto.agentId!,
      createAssignmentDto.reason
    );
    
    return {
      success: result.success,
      data: result,
      message: result.success ? 'Lead manually assigned successfully' : result.reason || 'Manual assignment failed',
    };
  }

  /**
   * Reassign a lead to a different agent
   */
  @Put(':leadId/reassign')
  async reassignLead(
    @Param('leadId') leadId: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto
  ): Promise<AssignmentResponseDto> {
    const result = await this.assignmentService.reassignLead(
      leadId,
      updateAssignmentDto.agentId!,
      updateAssignmentDto.reason
    );
    
    return {
      success: result.success,
      data: result,
      message: result.success ? 'Lead reassigned successfully' : result.reason || 'Reassignment failed',
    };
  }

  /**
   * Get assignment statistics
   */
  @Get('stats')
  async getAssignmentStats(): Promise<AssignmentResponseDto> {
    const stats = await this.assignmentService.getAssignmentStats();
    
    return {
      success: true,
      data: stats,
      message: 'Assignment statistics retrieved successfully',
    };
  }

  /**
   * Get assignment history for a lead
   */
  @Get('lead/:leadId/history')
  async getLeadAssignmentHistory(@Param('leadId') leadId: string): Promise<AssignmentResponseDto> {
    const history = await this.assignmentService.getLeadAssignmentHistory(leadId);
    
    return {
      success: true,
      data: history,
      message: 'Lead assignment history retrieved successfully',
    };
  }

  /**
   * Get assignment history for an agent
   */
  @Get('agent/:agentId/history')
  async getAgentAssignmentHistory(
    @Param('agentId') agentId: string,
    @Query('limit') limit: string = '50'
  ): Promise<AssignmentResponseDto> {
    const limitNum = parseInt(limit, 10);
    const history = await this.assignmentService.getAgentAssignmentHistory(agentId, limitNum);
    
    return {
      success: true,
      data: history,
      message: 'Agent assignment history retrieved successfully',
    };
  }

  /**
   * Update assignment status
   */
  @Put(':assignmentId/status')
  async updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentService.updateAssignmentStatus(
      assignmentId,
      updateAssignmentDto.status!,
      updateAssignmentDto.notes
    );
    
    return {
      success: true,
      data: assignment,
      message: 'Assignment status updated successfully',
    };
  }

  /**
   * Get available agents for assignment
   */
  @Get('agents/available')
  async getAvailableAgents(): Promise<AssignmentResponseDto> {
    // This would typically call a service method to get available agents
    // For now, returning mock data
    const availableAgents = [
      {
        agentId: 'agent1',
        name: 'John Doe',
        currentWorkload: 3,
        maxCapacity: 10,
        skills: ['sales', 'negotiation', 'real-estate'],
        availability: 'available',
        lastActive: new Date(),
      },
      {
        agentId: 'agent2',
        name: 'Jane Smith',
        currentWorkload: 5,
        maxCapacity: 8,
        skills: ['sales', 'customer-service'],
        availability: 'available',
        lastActive: new Date(),
      },
    ];
    
    return {
      success: true,
      data: availableAgents,
      message: 'Available agents retrieved successfully',
    };
  }

  /**
   * Get agent capacity and workload
   */
  @Get('agents/:agentId/capacity')
  async getAgentCapacity(@Param('agentId') agentId: string): Promise<AssignmentResponseDto> {
    // This would typically call a service method to get agent capacity
    // For now, returning mock data
    const capacity = {
      agentId,
      currentWorkload: 3,
      maxCapacity: 10,
      utilization: 30,
      skills: ['sales', 'negotiation', 'real-estate'],
      availability: 'available',
      lastActive: new Date(),
    };
    
    return {
      success: true,
      data: capacity,
      message: 'Agent capacity retrieved successfully',
    };
  }
} 