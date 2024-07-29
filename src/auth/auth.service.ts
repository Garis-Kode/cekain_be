import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from './dto/register-request.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate if the user exists and the password is correct
   *
   * @param email
   * @param password
   */
  public async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) return null;

    return user;
  }

  async register(registerRequestDto: RegisterRequestDto) {
    const user = await this.userRepository.findOne({
      where: { email: registerRequestDto.email },
    });

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerRequestDto.password, salt);

    const newUser = this.userRepository.create({
      ...registerRequestDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  public async login(loginRequestDto: LoginRequestDto) {
    const user = await this.validateUser(
      loginRequestDto.email,
      loginRequestDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Your password or email is incorrect');
    }
    return await this.responseWithToken(user);
  }

  public async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });

    const user = await this.userRepository.findOne(payload.sub);

    return this.responseWithToken(user);
  }

  /**
   * Generate a new access token and refresh token
   *
   * @param user
   * @private
   */
  private async responseWithToken(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
    return { accessToken, refreshToken };
  }
}
