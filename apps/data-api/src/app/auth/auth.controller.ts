import {
    Controller,
    Post,
    Body,
    Request,
    HttpException,
    HttpStatus,
    UseGuards,
    Get,
    Delete,
    Param,
    Patch,
} from '@nestjs/common';
import { UserRegistration, ResourceId, Token, UserCredentials } from 'shared/domain';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() credentials: UserRegistration): Promise<ResourceId> {
        try {
            await this.authService.registerUser(credentials.username, credentials.password, credentials.emailAddress);

            return {
                id: await this.authService.createUser(credentials.username),
            };
        } catch (e) {
            throw new HttpException('Username invalid', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    async login(@Body() credentials: UserCredentials): Promise<Token> {
        try {
            return {
                token: await this.authService.generateToken(credentials.username, credentials.password),
            };
        } catch (e) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('self')
    getProfile(@Request() req: any) {
        console.log(req.user);
        return this.authService.getIdentity(req.user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self')
    async patchSelf(@Request() req: any, @Body() updatedCredentials: UserRegistration) {
        return this.authService.updateCredentials(req.user.username, updatedCredentials);
    }

    // @UseGuards(JwtAuthGuard)
    // @Get('self/info')
    // getProfileInfo(@Request() req: any) {
    //     return this.userService.findOne(req.user.userId);
    // }

    // @UseGuards(JwtAuthGuard)
    // @Patch('self/info')
    // async patchInfo(@Request() req: any, @Body() updatedUser: UpdateUserDto) {
    //     return this.userService.update(req.user.userId, updatedUser);
    // }

    @UseGuards(JwtAuthGuard)
    @Delete('self')
    delete(@Request() req: any) {
        return this.authService.delete(req.user.userId);
    }

    @Patch('users/:id')
    @Roles('admin')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete('users/:id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.authService.delete(id);
    }
}
