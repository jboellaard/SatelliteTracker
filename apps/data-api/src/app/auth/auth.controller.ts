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
    Logger,
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
    private readonly logger = new Logger(AuthController.name);
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() credentials: UserRegistration): Promise<ResourceId> {
        this.logger.log('POST register called');
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
        this.logger.log('POST login called');
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
        this.logger.log('GET self called');
        return this.authService.getIdentity(req.user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self')
    async patchSelf(@Request() req: any, @Body() updatedCredentials: IIdentity) {
        this.logger.log('PATCH self called');
        return this.authService.updateIdentity(req.user.username, updatedCredentials);
    }

    @UseGuards(JwtAuthGuard)
    @Get('self/info')
    getProfileInfo(@Request() req: any) {
        this.logger.log('GET self/info called');
        return this.userService.findOne(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self/info')
    async patchInfo(@Request() req: any, @Body() updatedUser: UpdateUserDto) {
        this.logger.log('PATCH self/info called');
        return this.userService.update(req.user.userId, updatedUser);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('self')
    delete(@Request() req: any) {
        this.logger.log('DELETE self called');
        return this.authService.delete(req.user.username);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:username')
    patchByUsername(@Param('username') username: string, @Body() updatedUser: UpdateUserDto) {
        this.logger.log('PATCH users/:username called');
        return this.userService.update(username, updatedUser);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:username/identity')
    patchIdentityByUsername(@Param('username') username: string, @Body() updatedIdentity: IIdentity) {
        this.logger.log('PATCH users/:username/identity called');
        return this.authService.updateIdentity(username, updatedIdentity);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete('users/:username')
    deleteById(@Param('username') id: string) {
        this.logger.log('DELETE users/:username called');
        return this.authService.delete(id);
    }
}
