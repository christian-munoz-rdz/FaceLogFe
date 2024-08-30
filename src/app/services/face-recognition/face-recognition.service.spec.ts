import { TestBed } from '@angular/core/testing';

import { FaceRecognitionService } from './face-recognition.service';

describe('FaceRecognitionService', () => {
  let service: FaceRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaceRecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
