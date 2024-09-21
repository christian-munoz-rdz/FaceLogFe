import { ElementRef, Injectable, SimpleChange } from '@angular/core';
import { FaceApiService } from '../face-api/face-api.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FaceRecognitionService {
  private faceApiService: FaceApiService;
  private observerFaceDetection$!: Subscription;
  private autoDetectInterval: any;
  private isAutoDetectRunning: boolean = false;
  public imageDimsDefault: any = { width: 720, height: 720 };
  public intervalTimeDefault: number = 1000;
  public isRecognitionLoaded: boolean = false;
  public rgbaImageData: number[][] = [];

  constructor() {
    this.faceApiService = new FaceApiService();
  }

  private subscribeEventDetection(
    detectionListener: () => void,
    videoElement: ElementRef,
    autoDetect: boolean = true
  ): void {
    this.observerFaceDetection$ =
      this.faceApiService.eventEmitterFaceDetection.subscribe(
        ({ faceDetections, isRecognitionLoaded }) => {
          console.log(
            'DETECCION: ' + (faceDetections.length > 0 ? 'TRUE' : 'FALSE')
          );

          if (!this.isRecognitionLoaded) {
            this.isRecognitionLoaded = isRecognitionLoaded;
          } else {
            if (faceDetections.length > 0) {
              const detection = faceDetections[0]._box;
              console.log('score', faceDetections[0]._score);
              this.generateImageData(detection, videoElement);
              detectionListener();
            }
          }
        }
      );
  }

  public startFaceRecognitionService(
    detectionListener: () => void,
    videoElement: ElementRef,
    autoDetect: boolean = true
  ): void {
    if (this.isFaceRecognitionServiceStopped()) {
      this.subscribeEventDetection(detectionListener, videoElement, autoDetect);
      console.log('Recognition service started');
    } else {
      console.log('Recognition services already running');
    }

    if (autoDetect) {
      this.startAutoDetectFace(videoElement);
    } else {
      this.detectFace(videoElement);
    }
  }

  public stopFaceRecognitionService(): void {
    this.stopAutoDetectFace();

    if (this.isFaceRecognitionServiceStarted()) {
      this.observerFaceDetection$.unsubscribe();
      console.log('Recognition service stopped');
    } else {
      console.log('Recognition service already stopped');
    }
  }

  public startAutoDetectFace(videoElement: ElementRef): void {
    if (this.isFaceRecognitionServiceStarted()) {
      if (this.isAutoDetectFaceStopped()) {
        this.autoDetectInterval = setInterval(async () => {
          await this.detectFace(videoElement);
        }, this.intervalTimeDefault);
        this.isAutoDetectRunning = true;
        console.log('Auto detect started');
      } else {
        console.log('Auto detect already running');
      }
    } else {
      console.log('Recognition service not started');
    }
  }

  public stopAutoDetectFace(): void {
    if (this.isFaceRecognitionServiceStarted()) {
      if (this.isAutoDetectFaceStarted()) {
        clearInterval(this.autoDetectInterval);
        this.isAutoDetectRunning = false;
        console.log('Auto detect stopped');
      } else {
        console.log('Auto detect already stopped');
      }
    } else {
      console.log('Recognition service not started');
    }
  }

  public isFaceRecognitionServiceStarted() {
    if (this.observerFaceDetection$ !== undefined) {
      if (this.observerFaceDetection$.closed) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  public isFaceRecognitionServiceStopped() {
    if (this.observerFaceDetection$ !== undefined) {
      if (this.observerFaceDetection$.closed) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  public isAutoDetectFaceStarted(): boolean {
    return this.isAutoDetectRunning ? true : false;
  }

  public isAutoDetectFaceStopped(): boolean {
    return !this.isAutoDetectRunning ? true : false;
  }

  public async detectFace(videoElement: ElementRef): Promise<void> {
    if (this.isFaceRecognitionServiceStarted()) {
      await this.faceApiService.getDetection(videoElement);
    }
  }

  private generateImageData(detection: any, videoElement: ElementRef): void {
    let canvasTmp: any = document.createElement('canvas');
    canvasTmp.width = this.imageDimsDefault.width;
    canvasTmp.height = this.imageDimsDefault.height;

    const xPercentage = this.getPercentage(detection._height, 20);
    const yPercentage = this.getPercentage(detection._height, 10);
    const imageSize =
      detection._height > detection._width
        ? detection._height + this.getPercentage(detection._height, 20)
        : detection._width + this.getPercentage(detection._width, 20);

    this.clearCanvas(canvasTmp);
    canvasTmp
      .getContext('2d')
      .drawImage(
        videoElement.nativeElement,
        detection._x - xPercentage,
        detection._y - yPercentage,
        imageSize,
        imageSize,
        0,
        0,
        canvasTmp.width,
        canvasTmp.height
      );

    this.rgbaImageData = this.canvasToImageData(canvasTmp);

    canvasTmp = null;
  }

  public canvasToImageData(canvas: any): number[][] {
    let rgbaImageData: number[][] = [];
    const imageData = canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < imageData.length; i += 4) {
      const red = imageData[i];
      const green = imageData[i + 1];
      const blue = imageData[i + 2];
      const alpha = imageData[i + 3];
      rgbaImageData.push([red, green, blue, alpha]);
    }

    return rgbaImageData;
  }

  public imageDataToCanvas(
    imageData: number[][],
    canvas: any,
    imageDims: any = this.imageDimsDefault
  ): void {
    let canvasTmp: any = document.createElement('canvas');
    canvasTmp.width = imageDims.width;
    canvasTmp.height = imageDims.height;

    let x = 0;
    let y = 0;

    for (let pixel of imageData) {
      const [r, g, b, a] = pixel;
      canvasTmp.getContext('2d').fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      canvasTmp.getContext('2d').fillRect(x, y, 1, 1);
      x++;
      if (x === canvasTmp.width) {
        x = 0;
        y++;
      }
    }

    this.clearCanvas(canvas);
    canvas
      .getContext('2d')
      .drawImage(canvasTmp, 0, 0, canvas.width, canvas.height);

    canvasTmp = null;
  }

  private getPercentage(value: number, percentage: number): number {
    return (value / 100) * percentage;
  }

  public clearCanvas(canvas: any): void {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
}
