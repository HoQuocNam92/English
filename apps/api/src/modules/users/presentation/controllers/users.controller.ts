import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { UsersService } from '../../users.service'
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../http-dto/user.dto'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from '../../../../shared/presentation/decorators/current-user.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List all users (admin)' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query)
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my own profile' })
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub)
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @RequirePermissions('users:manage')
  @ApiOperation({ summary: 'Create user (admin)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  @RequirePermissions('users:manage')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update my own profile' })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.sub, dto)
  }

  @Patch(':id/suspend')
  @RequirePermissions('users:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Suspend user' })
  suspend(@Param('id') id: string) {
    return this.usersService.suspend(id)
  }

  @Patch(':id/activate')
  @RequirePermissions('users:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activate user' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id)
  }
}
