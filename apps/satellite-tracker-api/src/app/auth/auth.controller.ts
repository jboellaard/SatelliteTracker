import {
    Controller,
    Post,
    Body,
    Request,
    HttpStatus,
    UseGuards,
    Get,
    Delete,
    Param,
    Patch,
    Logger,
    Res,
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
    async register(@Res() res: any, @Body() credentials: UserRegistration): Promise<ResourceId> {
        this.logger.log('POST register called');
        const user = await this.authService.registerUser(credentials);
        return res.status(HttpStatus.CREATED).json(user);
    }

    @Post('login')
    async login(@Res() res: any, @Body() credentials: UserCredentials): Promise<Token> {
        this.logger.log('POST login called');
        const token = await this.authService.generateToken(credentials.username, credentials.password);
        return res.status(HttpStatus.OK).json({ token: token });
    }

    @UseGuards(JwtAuthGuard)
    @Get('self')
    async getSelf(@Res() res: any, @Request() req: any): Promise<IIdentity | null> {
        this.logger.log('GET self called');
        const identity = await this.authService.getIdentity(req.user.username);
        return res.status(HttpStatus.OK).json(identity);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self')
    async patchSelf(@Res() res: any, @Request() req: any, @Body() updatedCredentials: IIdentity) {
        this.logger.log('PATCH self called');
        const identity = await this.authService.updateIdentity(req.user.username, updatedCredentials);
        return res.status(HttpStatus.OK).json(identity);
    }

    @UseGuards(JwtAuthGuard)
    @Get('self/info')
    async getProfileInfo(@Res() res: any, @Request() req: any) {
        this.logger.log('GET self/info called');
        const user = await this.userService.findOne(req.user.userId);
        return res.status(HttpStatus.OK).json(user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('self/info')
    async patchInfo(@Res() res: any, @Request() req: any, @Body() updatedUser: UpdateUserDto) {
        this.logger.log('PATCH self/info called');
        const user = await this.userService.update(req.user.userId, updatedUser);
        return res.status(HttpStatus.OK).json(user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('self')
    async deleteSelf(@Res() res: any, @Request() req: any) {
        this.logger.log('DELETE self called');
        const user = await this.authService.delete(req.user.username);
        return res.status(HttpStatus.OK).json(user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('users')
    async getAll(@Res() res: any) {
        this.logger.log('GET users called');
        const users = await this.userService.findAll();
        return res.status(HttpStatus.OK).json(users);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:username')
    async patchByUsername(@Res() res: any, @Param('username') username: string, @Body() updatedUser: UpdateUserDto) {
        this.logger.log(`PATCH users/${username} called`);
        const user = await this.userService.update(username, updatedUser);
        return res.status(HttpStatus.OK).json(user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:username/identity')
    async patchIdentityByUsername(
        @Res() res: any,
        @Param('username') username: string,
        @Body() updatedIdentity: IIdentity
    ) {
        this.logger.log(`PATCH users/${username}/identity called`);
        const identity = await this.authService.updateIdentity(username, updatedIdentity);
        return res.status(HttpStatus.OK).json(identity);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete('users/:username')
    async deleteByUsername(@Res() res: any, @Param('username') username: string) {
        this.logger.log(`DELETE users/${username} called`);
        const user = await this.authService.delete(username);
        return res.status(HttpStatus.OK).json(user);
    }
}
