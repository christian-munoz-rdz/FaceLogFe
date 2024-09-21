import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { FaceRecognitionCameraComponent } from './components/face-recognition-camera/main/face-recognition-camera.component';
import { ThemeSwitchComponent } from './components/global/theme-switch/theme-switch.component';
import { UserService } from './services/user/user.service';
import { UserModel } from './core/models/user/user.model';
import { CreateUserComponent } from "./components/create-user/create-user.component";
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FaceRecognitionCameraComponent,
    ThemeSwitchComponent,
    CreateUserComponent,
    ButtonModule,
    DropdownModule,
    FormsModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  cameras: any[] = [];
  cameraType = {type: 'ENTER', name: 'Entrada'};

  users: UserModel[] = [];

  constructor(
    private userService: UserService,
    private destroyRef: DestroyRef
  ) {
    this.getUsers();
  }

  getUsers() {
    this.userService
      .getAllUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.users = response;
          console.log('Users: ', this.users);
        },
        error: (error) => {
          console.error('Error al obtener los usuarios:', error);
        },
      });
  }

  addCamera() {
    const newCamara = {
      id: `cam${this.cameras.length + 1}`,
      type: this.cameraType.type,
    };
    this.cameras.push(newCamara);
  }

  deleteCamera(camera: any) {
    const index = this.cameras.indexOf(camera);
    if (index > -1) {
      this.cameras.splice(index, 1);
    }
  }
}