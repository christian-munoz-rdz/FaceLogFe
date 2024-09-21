import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../../../core/models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class FaceApiService {
  private api_url = 'https://facelog-be.carlos-carvajal.com';

  constructor(private http: HttpClient) {}

  postFindUser(image: any): Observable<UserModel> {
    const url = `${this.api_url}/user/log-time`;
    return this.http.post<UserModel>(url, image);
  }
}
