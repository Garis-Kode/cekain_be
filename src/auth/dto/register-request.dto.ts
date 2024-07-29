import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { Match } from '../../common/validators/match.decorator';

export class RegisterRequestDto {
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsOptional()
  lastName?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword(
    {
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minLength: 8,
      minSymbols: 0,
    },
    { message: 'Password is too weak' },
  )
  password: string;

  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Match('password', { message: 'Password doest not match' })
  passwordConfirmation: string;
}
