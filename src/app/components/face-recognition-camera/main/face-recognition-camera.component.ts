import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceRecognitionService } from '../../../services/face-recognition/face-recognition.service';
import { WaitingComponent } from '../components/waiting/waiting.component';
import { DeleteButtonComponent } from '../components/delete-button/delete-button.component';
import { OnOffSwitchComponent } from '../components/on-off-switch/on-off-switch.component';

@Component({
  selector: 'app-face-recognition-camera',
  standalone: true,
  imports: [CommonModule, WaitingComponent, DeleteButtonComponent, OnOffSwitchComponent],
  templateUrl: './face-recognition-camera.component.html',
  styleUrl: './face-recognition-camera.component.scss',
  providers: [FaceRecognitionService]
})
export class FaceRecognitionCameraComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('videoElement') videoElement!: ElementRef;
  videoDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = ''
  stream: MediaStream | null = null;
  isVideoPlaying: boolean = false;

  rgbaImageData: number[][] = []
  haveDetection: boolean = false;

  @ViewChild('canvasBanner') canvasBanner!: ElementRef;
  showBanner: boolean = false;
  hideBanner: boolean = false;
  hideCamera: boolean = false;
  detectionColor: string = '';
  detectionOk: boolean = true;
  @Input() cameraParams: any = {};
  @Output() deleteCameraEvent = new EventEmitter<any>();

  controles: boolean = false;

  constructor(public faceRecognitionService: FaceRecognitionService) { }

  async ngOnInit(): Promise<void> {
    await this.getMediaDevices();
    navigator.mediaDevices.addEventListener('devicechange', () => this.updateMediaDevices());
  }

  ngOnDestroy(): void {
    this.stopStream();
    this.faceRecognitionService.stopFaceRecognitionService();
    navigator.mediaDevices.removeEventListener('devicechange', () => this.updateMediaDevices());
  }

  ngAfterViewChecked(): void {
    if (this.canvasBanner && this.showBanner) {
      try {
        this.faceRecognitionService.imageDataToCanvas(this.rgbaImageData, this.canvasBanner.nativeElement);
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  loadedMetaData(): void {
    this.videoElement.nativeElement.play();
  }

  playListener() {
    this.isVideoPlaying = true;
    this.faceRecognitionService.startFaceRecognitionService(() => this.detectionListener(), this.videoElement);
  }

  onStartStopService(event: any) {
    if (event.target.checked) {
      this.faceRecognitionService.startFaceRecognitionService(() => this.detectionListener(), this.videoElement);
    }
    else {
      this.faceRecognitionService.stopFaceRecognitionService();
    }
  }

  isWaiting(): boolean {
    return !this.isVideoPlaying || this.faceRecognitionService.isFaceRecognitionServiceStarted() && !this.faceRecognitionService.isRecognitionLoaded || this.haveDetection ? true : false;
  }

  deleteCamera() {
    this.hideCamera = true;
    setTimeout(() => {
      this.hideCamera = false;
      this.deleteCameraEvent.emit(this.cameraParams);
    }, 1000);
  }

  detectionListener(): void {
    if (!this.haveDetection) {
      this.haveDetection = true;

      this.rgbaImageData = this.faceRecognitionService.rgbaImageData;
      console.log(this.rgbaImageData);
      
      this.faceRecognitionService.stopAutoDetectFace();

      //Aqui se envia la imagen a BE y se espera la respuesta
      setTimeout(() => { //Simulacion de espera

        this.showBanner = true;
        this.setDetectionColor(this.detectionOk ? 'ok' : 'fail'); //Se encontro la conicidencia en BE

        console.log('Timeout detection running');
        setTimeout(() => {
          this.showBanner = false;
          this.hideBanner = true;
          setTimeout(() => {
            this.hideBanner = false;
            this.setDetectionColor();
            this.faceRecognitionService.startAutoDetectFace(this.videoElement);
            this.haveDetection = false;
            console.log('Timeout detection finished');
          }, 500);
        }, 7500);

      }, 1500);
    }
  }

  setDetectionColor(status: string = '') {
    this.detectionColor = status ? `color-${status}` : status;
  }

  async getMediaDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter((device) => device.kind === 'videoinput');

      console.log('Camaras: ' + this.videoDevices.length);
      console.log(this.videoDevices);

      if (this.videoDevices.length > 0) {
        if (this.selectedDeviceId === '' || !this.videoDevices.find((device) => device.deviceId === this.selectedDeviceId)) {
          this.selectedDeviceId = this.videoDevices[0].deviceId;
          await this.startStream();
        }
      }
      else {
        this.selectedDeviceId = '';
        this.stream = null;
      }
    } catch (error) {
      console.error('Error getting media devices:', error);
    }
  }

  async updateMediaDevices(): Promise<void> {
    console.log('Change')
    await this.getMediaDevices();
  }

  async onSelect (event: Event): Promise<void> {
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
          deviceId: {ideal: this.selectedDeviceId},
          width: {ideal: 1920},
          height: {ideal: 1440}
        }
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
  async detectarRostro() {
    //await this.faceRecognitionService.detectFace(this.videoElement);
  }

  async identificarManual() {
    this.hideBanner = false;
    this.haveDetection = !this.haveDetection;
  }

  ocultarBanner() {
    this.showBanner = false;
    this.hideBanner = true;
    this.setDetectionColor();
  }

  mostrarBanner() {
    this.showBanner = true;
    this.hideBanner = false;
    this.setDetectionColor(this.detectionOk ? 'ok' : 'fail');
  }

  deteccionOkFail() {
    this.detectionOk = !this.detectionOk;
  }

  mostrarControles() {
    this.controles = !this.controles;
  }
}
