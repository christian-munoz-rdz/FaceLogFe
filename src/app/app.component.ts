import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaceRecognitionCameraComponent } from './components/face-recognition-camera/main/face-recognition-camera.component';
import { ThemeSwitchComponent } from './components/global/theme-switch/theme-switch.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FaceRecognitionCameraComponent, ThemeSwitchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  cameras: any[] = []
  cameraType: string = 'Entrada';
  
  constructor() {}

  addCamera() {
    const newCamara = {
      id: `cam${this.cameras.length + 1}`,
      type: this.cameraType
    }
    this.cameras.push(newCamara);
  }

  deleteCamera(camera: any) {
    const index = this.cameras.indexOf(camera);
    if (index > -1) {
      this.cameras.splice(index, 1);
    }
  }

  async onSelect (event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    this.cameraType = target.value;
  }
}