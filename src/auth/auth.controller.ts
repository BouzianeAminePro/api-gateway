import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //  @Get()
  // // @UseGuards(AuthGuard('jwt'))
  // credentialsAuth(@Req() req) {
  //   return this.authService.login(req.user);
  // }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  // @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req) {
    // Handle the Google OAuth2 callback
    return this.authService.login(req.user);
  }
}
