import z from 'zod';
import { UserBaseSchema } from '../../user/dto/create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RegisterUserSchema = UserBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  },
);

export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterUserDto extends createZodDto(RegisterUserSchema) {}
