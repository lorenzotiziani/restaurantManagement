import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import z from 'zod';
import { RegisterUserDto } from 'src/user/dto/create-user.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginSchema } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const registerResult = await this.authService.register(dto);

    return {
      success: true,
      data: registerResult,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: z.infer<typeof LoginSchema>,
  ) {
    const loginResult = await this.authService.login(body.email, body.password);

    return {
      success: true,
      data: loginResult,
    };
  }

  @Post('logout')
  logout(@Body() refreshToken: string) {
    if (refreshToken) {
      return this.authService.logout(refreshToken);
    }

    return {
      success: true,
      message: 'Logout effettuato con successo',
    };
  }
}
