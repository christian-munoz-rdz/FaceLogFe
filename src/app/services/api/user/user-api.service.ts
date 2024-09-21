import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLogTimePayloadModel, UserModel, UserWithPhotoModel } from '../../../core/models/user/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private api_url = environment.API_URL;

  constructor(private http: HttpClient) {}

  getUser(): Observable<UserModel[]> {
    const url = `${this.api_url}/user/`;
    return this.http.get<UserModel[]>(url);
  }

  getUserById(userId: number): Observable<UserWithPhotoModel> {
    const url = `${this.api_url}/user/${userId}`;
    return this.http.get<UserWithPhotoModel>(url);
  }

  postLogTime(userLogTimePayload: UserLogTimePayloadModel): Observable<HttpResponse<UserWithPhotoModel>> {
    const url = `${this.api_url}/user/log-time`;
    return this.http.post<UserWithPhotoModel>(url, userLogTimePayload, { observe: 'response' });
  }
}
