import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  @Get('dashboard')
  dashboard() {
    return {
      status: 'OK',
      scope: 'ADMIN_ONLY',
      capabilities: [
        'View operational metrics',
        'Review reconciliation summaries',
        'Review settlement batches',
      ],
    };
  }
}
