import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(userData: {
    email: string;
    name: string;
    googleId: string;
    avatar: string;
  }): Promise<User> {
    const { email, name, googleId, avatar } = userData;
    
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatar,
        },
      });
    } else {
      // Update existing user with Google data
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar,
        },
      });
    }
    
    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
