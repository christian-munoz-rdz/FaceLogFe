import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { UserLogTimePayloadModel } from '../../../core/models/user/user.model';
import { FaceRecognitionService } from '../../../services/face-recognition/face-recognition.service';
import { UserService } from '../../../services/user/user.service';
import { DeleteButtonComponent } from '../components/delete-button/delete-button.component';
import { OnOffSwitchComponent } from '../components/on-off-switch/on-off-switch.component';
import { WaitingComponent } from '../components/waiting/waiting.component';

@Component({
  selector: 'app-face-recognition-camera',
  standalone: true,
  imports: [
    CommonModule,
    WaitingComponent,
    DeleteButtonComponent,
    OnOffSwitchComponent,
    ButtonModule,
  ],
  templateUrl: './face-recognition-camera.component.html',
  styleUrl: './face-recognition-camera.component.scss',
  providers: [FaceRecognitionService],
})
export class FaceRecognitionCameraComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @Input() cameraParams: any = {};
  @Output() deleteCameraEvent = new EventEmitter<any>();

  @ViewChild('videoElement') videoElement!: ElementRef;
  videoDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  stream: MediaStream | null = null;
  isVideoPlaying: boolean = false;

  @ViewChild('canvasBanner') canvasBanner!: ElementRef;
  showBanner: boolean = false;
  bannerHideAnim: boolean = false;
  cameraHideAnim: boolean = false;
  detectionColorStyle: string = '';

  haveDetection: boolean = false;
  rgbaImageData: Array<Array<number>> = [];
  bannerText: string = '';

  controles: boolean = false;

  constructor(
    public faceRecognitionService: FaceRecognitionService,
    private userService: UserService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getMediaDevices();
    navigator.mediaDevices.addEventListener('devicechange', () =>
      this.updateMediaDevices()
    );
  }

  ngOnDestroy(): void {
    this.stopStream();
    this.faceRecognitionService.stopFaceRecognitionService();
    navigator.mediaDevices.removeEventListener('devicechange', () =>
      this.updateMediaDevices()
    );
  }

  ngAfterViewChecked(): void {
    if (this.canvasBanner) {
      try {
        this.faceRecognitionService.imageDataToCanvas(
          this.rgbaImageData,
          this.canvasBanner.nativeElement
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  loadedMetaData(): void {
    this.videoElement.nativeElement.play();
  }

  playListener() {
    this.isVideoPlaying = true;
    //this.faceRecognitionService.startFaceRecognitionService(() => this.detectionListener(), this.videoElement);
  }

  onStartStopService(event: any) {
    if (event.target.checked) {
      this.faceRecognitionService.startFaceRecognitionService(
        () => this.detectionListener(),
        this.videoElement
      );
    } else {
      this.faceRecognitionService.stopFaceRecognitionService();
    }
  }

  isWaiting(): boolean {
    return !this.isVideoPlaying ||
      (this.faceRecognitionService.isFaceRecognitionServiceStarted() &&
        !this.faceRecognitionService.isRecognitionLoaded) ||
      this.haveDetection
      ? true
      : false;
  }

  deleteCamera() {
    this.cameraHideAnim = true;
    setTimeout(() => {
      this.cameraHideAnim = false;
      this.deleteCameraEvent.emit(this.cameraParams);
    }, 1000);
  }

  detectionListener(): void {
    if (!this.haveDetection) {
      this.haveDetection = true;
      this.faceRecognitionService.stopAutoDetectFace();

      console.log(
        'Photo detected: ',
        this.faceRecognitionService.rgbaImageData
      );

      const userLogTimePayload = {
        action: this.cameraParams.type,
        area_id: 1,
        photo: this.faceRecognitionService.rgbaImageData,
      } as UserLogTimePayloadModel;

      console.log('PayLoad: ', userLogTimePayload);

      this.userService
        .logTime(userLogTimePayload)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            console.log('Find user: ', response);

            if (response.body?.role_id !== 5) {
              this.bannerText = `${response.body?.name} - ${response.body?.codes[0].code}`;
              this.setDetectionColorStyle('ok');
            } else {
              this.bannerText = `Usuario desconocido`;
              this.setDetectionColorStyle('fail');
            }

            this.rgbaImageData = this.faceRecognitionService.rgbaImageData;
            this.showBanner = true;

            setTimeout(() => {
              this.bannerHideAnim = true;

              setTimeout(() => {
                this.showBanner = false;
                this.bannerHideAnim = false;
                this.rgbaImageData = [];
                this.setDetectionColorStyle();
                this.haveDetection = false;
                this.faceRecognitionService.startAutoDetectFace(
                  this.videoElement
                );
              }, 500); //tiempo para completar la animacion cuando desaparece el banner
            }, 4500); //tiempo que permanece el banner
          },
          error: (error) => {
            console.error('Error en la solicitud POST: ', error);
            this.haveDetection = false;
            this.faceRecognitionService.startAutoDetectFace(this.videoElement);
          },
        });
    }
  }

  setDetectionColorStyle(status: string = '') {
    this.detectionColorStyle = status ? `color-${status}` : status;
  }

  async getMediaDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      );

      console.log('Camaras: ' + this.videoDevices.length);
      console.log(this.videoDevices);

      if (this.videoDevices.length > 0) {
        if (
          this.selectedDeviceId === '' ||
          !this.videoDevices.find(
            (device) => device.deviceId === this.selectedDeviceId
          )
        ) {
          this.selectedDeviceId = this.videoDevices[0].deviceId;
          await this.startStream();
        }
      } else {
        this.selectedDeviceId = '';
        this.stream = null;
      }
    } catch (error) {
      console.error('Error getting media devices:', error);
    }
  }

  async updateMediaDevices(): Promise<void> {
    console.log('Change');
    await this.getMediaDevices();
  }

  async onSelect(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    this.selectedDeviceId = target.value;
    console.log('Selected device ID:', this.selectedDeviceId);
    await this.startStream();
  }

  async startStream(): Promise<void> {
    this.stopStream();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: { ideal: this.selectedDeviceId },
          width: { max: 1920 },
          height: { max: 1440 },
          frameRate: { max: 60 },
        },
      });
      const videoElement = this.videoElement.nativeElement;
      if (videoElement) {
        videoElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Error strting video stream:', error);
    }
  }

  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.isVideoPlaying = false;
  }

  /** Para pruebas */
  mostrarBanner() {
    this.showBanner = true;
    this.bannerHideAnim = false;
    this.setDetectionColorStyle('ok');
  }

  ocultarBanner() {
    this.showBanner = false;
    this.bannerHideAnim = true;
    this.setDetectionColorStyle();
  }

  mostrarControles() {
    this.controles = !this.controles;
  }
}
