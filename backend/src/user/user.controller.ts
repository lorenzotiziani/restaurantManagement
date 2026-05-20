import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ZodParamPipe } from 'src/common/pipes/zod-param-pipe';
import z from 'zod';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const all = await this.userService.findAll();

    return {
      success: true,
      data: all,
    };
  }

  @Get('id/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const one = await this.userService.findOne(id);

    return {
      success: true,
      data: one,
    };
  }

  @Get('email')
  async findByEmail(
    @Body('email', new ZodParamPipe(z.string().email())) email: string,
  ) {
    const byEmail = await this.userService.findByEmail(email);

    return {
      success: true,
      data: byEmail,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.userService.update(id, updateUserDto);

    return {
      success: true,
      data: updated,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.userService.remove(+id);

    return {
      success: true,
      data: deleted,
    };
  }
}
