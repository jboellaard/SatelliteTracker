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
import { UserRegistration, ResourceId, Token, UserCredentials, IIdentity } from 'shared/domain';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './guards/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() credentials: UserRegistration): Promise<ResourceId> {
        try {
            return {
                id: await this.authService.registerUser(credentials),
            };
        } catch (e) {
            throw new HttpException('Username or email invalid', HttpStatus.BAD_REQUEST);
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
    getSelf(@Request() req: any) {
        return this.authService.getIdentity(req.user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self')
    async patchSelf(@Request() req: any, @Body() updatedCredentials: IIdentity) {
        return this.authService.updateIdentity(req.user.username, updatedCredentials);
    }

    @UseGuards(JwtAuthGuard)
    @Get('self/info')
    getProfileInfo(@Request() req: any) {
        return this.userService.findOne(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self/info')
    async patchInfo(@Request() req: any, @Body() updatedUser: UpdateUserDto) {
        return this.userService.update(req.user.userId, updatedUser);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('self')
    delete(@Request() req: any) {
        return this.authService.delete(req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:id')
    patchById(@Param('id') id: string, @Body() updatedUser: UpdateUserDto) {
        return this.userService.update(id, updatedUser);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:id/identity')
    patchIdentityById(@Param('id') id: string, @Body() updatedIdentity: IIdentity) {
        return this.authService.updateIdentity(id, updatedIdentity);
    }

    // @Delete('users/:id')
    // @Roles('admin')
    // deleteById(@Param('id') id: string) {
    //     return this.authService.delete(id);
    // }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete('users/:username')
    deleteById(@Param('username') id: string) {
        return this.authService.delete(id);
    }
}
