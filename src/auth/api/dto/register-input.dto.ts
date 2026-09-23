import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterInputDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
