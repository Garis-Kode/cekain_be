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
import { DateTime } from 'luxon';

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

  /**
   * Register a new user.
   *
   * @param registerRequestDto
   */
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

  /**
   * Log the user in.
   *
   * @param loginRequestDto
   * @param req
   */
  public async login(loginRequestDto: LoginRequestDto, req: any) {
    const user = await this.validateUser(
      loginRequestDto.email,
      loginRequestDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Your password or email is incorrect');
    }

    user.lastLoginIp = req.ip;
    user.lastLoginAt = DateTime.now().toJSDate();
    await this.userRepository.save(user);

    return await this.responseWithToken(user);
  }

  /**
   * Refresh the access token.
   *
   * @param user
   */
  public async refresh(user: UserEntity) {
    return await this.generateAccessToken(user);
  }

  /**
   * Response with access and refresh token.
   *
   * @param user
   * @private
   */
  private async responseWithToken(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  /**
   * Generate a new refresh token.
   *
   * @param user
   * @private
   */
  private async generateRefreshToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * Generate a new access token.
   *
   * @param user
   * @private
   */
  private async generateAccessToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }
}
