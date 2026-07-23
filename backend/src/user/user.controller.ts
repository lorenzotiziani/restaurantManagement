import {
  Controller,
  Get,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ZodParamPipe } from 'src/common/pipes/zod-param-pipe';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from 'src/auth/entities/refreshToken.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
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
    const one = await this.userService.findOneView(id);

    return {
      success: true,
      data: one,
    };
  }

  @Get('email')
  async findByEmail(
    @Query('email', new ZodParamPipe(z.string().email())) email: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return { success: true, data: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userSafe } = user;

    return {
      success: true,
      data: userSafe,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateUserDto)) updateUserDto: UpdateUserDto,
    @Req() req: { user: JwtPayload },
  ) {
    const requester = req.user;

    // Un utente può modificare solo sé stesso, salvo che sia 'cassa' (gestore)
    if (requester.userId !== id && requester.ruolo !== 'cassa') {
      throw new ForbiddenException('Non puoi modificare un altro utente');
    }

    // Solo 'cassa' può cambiare il ruolo (blocca l'auto-promozione)
    if (updateUserDto.ruoloId !== undefined && requester.ruolo !== 'cassa') {
      throw new ForbiddenException('Non puoi modificare il ruolo');
    }

    const updated = await this.userService.update(id, updateUserDto);

    return {
      success: true,
      data: updated,
    };
  }

  @Roles('cassa')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.userService.remove(id);

    return {
      success: true,
      data: deleted,
    };
  }
}
