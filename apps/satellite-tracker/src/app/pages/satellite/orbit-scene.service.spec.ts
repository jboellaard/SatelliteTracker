import { TestBed } from '@angular/core/testing';

import { OrbitService } from './orbit-scene.service';

describe('OrbitService', () => {
    let service: OrbitService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrbitService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
