import { Injectable } from '@angular/core';
import { FaceApiService } from '../api/face/face-api.service';
import { Observable } from 'rxjs';
import { UserModel } from '../../core/models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class FaceService {
  constructor(private faceApiService: FaceApiService) { }

  findUser(image: any): Observable<UserModel> {
    return this.faceApiService.postFindUser(image);
  }
}
