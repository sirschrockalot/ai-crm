import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { Role, RoleSchema } from './schemas/role.schema';
import { UserRole, UserRoleSchema } from './schemas/user-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {} 