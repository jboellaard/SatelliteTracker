import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe.skip('AppController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();
    });

    describe('getData', () => {
        it('should return "Welcome to satellite-tracker-api!"', () => {
            const appController = app.get<AppController>(AppController);
            expect(appController.getData()).toEqual({
                message: 'Welcome to satellite-tracker-api!',
                status: 200,
            });
            expect(appController.getData()).toHaveProperty('message');
        });
    });
});
