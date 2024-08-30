import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceRecognitionCameraComponent } from './face-recognition-camera.component';

describe('FaceRecognitionCameraComponent', () => {
  let component: FaceRecognitionCameraComponent;
  let fixture: ComponentFixture<FaceRecognitionCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceRecognitionCameraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FaceRecognitionCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
