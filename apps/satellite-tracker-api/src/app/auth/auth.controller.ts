import { Controller, Post, Body, Request, UseGuards, Get, Delete, Param, Patch, Logger } from '@nestjs/common';
import { UserRegistration, Token, UserCredentials, APIResult, IUser, UserIdentity, AdminUserInfo } from 'shared/domain';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { AccessJwtAuthGuard } from './guards/access-jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { Roles } from './guards/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() credentials: UserRegistration): Promise<APIResult<IUser>> {
        this.logger.verbose('POST register called');
        return await this.authService.registerUser(credentials);
    }

    @Post('login')
    async login(@Body() credentials: UserCredentials): Promise<APIResult<Token>> {
        this.logger.verbose('POST login called');
        return await this.authService.generateToken(credentials.username, credentials.password);
    }

    @UseGuards(RefreshJwtAuthGuard)
    @Get('token')
    async token(@Request() req: any): Promise<APIResult<Token>> {
        this.logger.verbose('POST token called');
        return await this.authService.refreshToken(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Get('self')
    async getSelf(@Request() req: any): Promise<APIResult<UserIdentity>> {
        this.logger.verbose('GET self called');
        return await this.authService.getIdentity(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Patch('self')
    async patchSelf(
        @Request() req: any,
        @Body() updatedCredentials: UserRegistration
    ): Promise<APIResult<{ user: UserIdentity; token: Token }>> {
        this.logger.verbose('PATCH self called');
        return await this.authService.updateIdentity(req.user.username, updatedCredentials);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Get('self/info')
    async getProfileInfo(@Request() req: any): Promise<APIResult<IUser>> {
        this.logger.verbose('GET self/info called');
        return await this.userService.getSelf(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Patch('self/info')
    async patchInfo(@Request() req: any, @Body() updatedUser: UpdateUserDto): Promise<APIResult<IUser>> {
        this.logger.verbose('PATCH self/info called');
        return await this.userService.update(req.user.userId, updatedUser);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete('self')
    async deleteSelf(@Request() req: any): Promise<APIResult<IUser>> {
        this.logger.verbose('DELETE self called');
        return await this.authService.delete(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('users')
    async getAll(): Promise<APIResult<IUser[]>> {
        this.logger.verbose('GET users called');
        return await this.userService.findAll();
    }

    @UseGuards(AccessJwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('identities')
    async getAllIdentities(): Promise<APIResult<AdminUserInfo[]>> {
        this.logger.verbose('GET identities called');
        return await this.authService.getAllIdentities();
    }

    @UseGuards(AccessJwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:username')
    async patchByUsername(
        @Param('username') username: string,
        @Body() updatedUser: UpdateUserDto
    ): Promise<APIResult<IUser>> {
        this.logger.verbose(`PATCH users/${username} called`);
        return await this.userService.update(username, updatedUser);
    }

    @UseGuards(AccessJwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:username/identity')
    async patchIdentityByUsername(
        @Param('username') username: string,
        @Body() updatedIdentity: UserRegistration
    ): Promise<APIResult<{ user: UserIdentity; token: Token }>> {
        this.logger.verbose(`PATCH users/${username}/identity called`);
        return await this.authService.updateIdentity(username, updatedIdentity);
    }

    @UseGuards(AccessJwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete('users/:username')
    async deleteByUsername(@Param('username') username: string): Promise<APIResult<IUser>> {
        this.logger.verbose(`DELETE users/${username} called`);
        return await this.authService.delete(username);
    }
}
