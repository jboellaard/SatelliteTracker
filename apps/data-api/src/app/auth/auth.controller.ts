import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UserRegistration, ResourceId } from 'data';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  //   async register(@Body() credentials: UserRegistration): Promise<ResourceId> {
  //       try {
  //           await this.authService.registerUser(credentials.username, credentials.password, credentials.emailAddress);

  //           return {
  //               id: await this.authService.createUser(credentials.username, credentials.emailAddress),
  //           };
  //       } catch (e) {
  //           throw new HttpException('Username invalid', HttpStatus.BAD_REQUEST);
  //       }
  //   }
}
