import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import * as faceApi from 'face-api.js';

@Injectable()
export class FaceApiService {
  public eventEmitterFaceDetection: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    faceApi.nets.ssdMobilenetv1.loadFromUri('/assets/models');
    faceApi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    faceApi.nets.faceRecognitionNet.loadFromUri('/assets/models');
    faceApi.nets.faceExpressionNet.loadFromUri('/assets/models');
  }

  public async getDetection(videoElement: ElementRef): Promise<void> {
    if (videoElement) {
      const options = new faceApi.SsdMobilenetv1Options({minConfidence: 0.9});

      const faceDetections = await faceApi.detectAllFaces(videoElement.nativeElement, options);
      this.eventEmitterFaceDetection.emit({
        faceDetections,
        isRecognitionLoaded: true 
      });
    }
  }
}
