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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.userService.findAll();
  }

  @Get('id/:id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get('email')
  @UseGuards(AuthGuard('jwt'))
  findByEmail(
    @Body('email', new ZodParamPipe(z.string().email())) email: string,
  ) {
    return this.userService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
