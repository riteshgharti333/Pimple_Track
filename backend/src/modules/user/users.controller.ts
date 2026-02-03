import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService, UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtGuard } from './guards/auth.guard';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    const user = await this.usersService.createUser(
      body.name,
      body.email,
      body.password,
    );

    return {
      success: true,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const data = await this.authService.login(body.email, body.password);

    return {
      success: true,
      message: 'Login successful',
      data,
    };
  }

  // 🔐 PROFILE
  @UseGuards(JwtGuard)
  @Get('profile')
  async profile(@Req() req: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);

    return {
      success: true,
      message: 'Profile fetched successfully',
      data: user,
    };
  }
}
