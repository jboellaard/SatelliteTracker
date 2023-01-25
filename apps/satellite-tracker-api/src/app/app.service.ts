import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getData() {
        return { status: HttpStatus.OK, message: 'Welcome to satellite-tracker-api!' };
    }
}
