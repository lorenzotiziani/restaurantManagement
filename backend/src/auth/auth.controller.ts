import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserDto } from './dto/auth.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterUserDto)) dto: RegisterUserDto,
  ) {
    const registerResult = await this.authService.register(dto);

    return {
      success: true,
      data: registerResult,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginDto)) dto: LoginDto) {
    const loginResult = await this.authService.login(dto);

    return {
      success: true,
      data: loginResult,
    };
  }

  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
