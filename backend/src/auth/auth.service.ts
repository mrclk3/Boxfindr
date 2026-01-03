import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginAsGuest() {
    let guest = await this.prisma.user.findUnique({ where: { email: 'guest@codelab.eu' } });

    if (!guest) {
      const hashedPassword = await bcrypt.hash('guest123', 10);
      guest = await this.prisma.user.create({
        data: {
          email: 'guest@codelab.eu',
          name: 'Guest User',
          password: hashedPassword,
          role: 'USER',
        },
      });
    }

    return this.login(guest);
  }
}
