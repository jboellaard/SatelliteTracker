import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    async getHello(): Promise<string> {
        return `Welcome to the satellite tracker API!`;
    }
}
