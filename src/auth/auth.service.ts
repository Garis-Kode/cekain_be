import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from './dto/register-request.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Validate if the user exists and the password is correct
   *
   * @param email
   * @param password
   */
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (user && isPasswordValid) return user;
    return null;
  }

  async register(registerRequestDto: RegisterRequestDto) {
    const { email, password } = registerRequestDto;
    console.log(email, password);
  }
}
