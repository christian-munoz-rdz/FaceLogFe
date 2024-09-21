import { Injectable } from '@angular/core';
import { AreaApiService } from '../api/area/area-api.service';
import { AreaModel } from '../../core/models/area/area.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  constructor(private areaApiService: AreaApiService) { }

  getAllAreas(): Observable<AreaModel[]> {
    return this.areaApiService.getArea();
  }
}
