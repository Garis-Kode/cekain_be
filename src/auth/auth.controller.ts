import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { Serialize } from '../common/interceptor/serialize.interceptor';
import { ResponseUserDto } from '../user/dto/response-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ResponseUserDto)
  @Get('me')
  getMe(@User() user: UserEntity) {
    return user;
  }

  @Post('register')
  create(@Body() registerRequestDto: RegisterRequestDto) {
    return this.authService.register(registerRequestDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto, @Req() req: any) {
    return await this.authService.login(loginRequestDto, req);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('refresh-token'))
  @HttpCode(HttpStatus.OK)
  async refresh(@User() user: UserEntity) {
    return {
      accessToken: await this.authService.refresh(user),
    };
  }
}
