import { Injectable } from '@angular/core';
import { UserApiService } from '../api/user/user-api.service';
import { Observable } from 'rxjs';
import { UserLogTimePayloadModel, UserModel, UserWithPhotoModel } from '../../core/models/user/user.model';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private userApiService: UserApiService) { }

  getAllUsers(): Observable<UserModel[]> {
    return this.userApiService.getUser();
  }

  getUserById(userId: number): Observable<UserWithPhotoModel> {
    return this.userApiService.getUserById(userId);
  }

  logTime(userLogTimePayload: UserLogTimePayloadModel): Observable<HttpResponse<UserWithPhotoModel>> {
    return this.userApiService.postLogTime(userLogTimePayload);
  }
}
