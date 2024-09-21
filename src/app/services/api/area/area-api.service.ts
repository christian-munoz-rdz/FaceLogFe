import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AreaModel } from '../../../core/models/area/area.model';

@Injectable({
  providedIn: 'root'
})
export class AreaApiService {

  private api_url = 'https://facelog-be.carlos-carvajal.com'

  constructor(
    private http: HttpClient
  ) { }

  getArea(): Observable<AreaModel[]> {
    const url = `${this.api_url}/area/`;
    return this.http.get<AreaModel[]>(url);
  }
}
