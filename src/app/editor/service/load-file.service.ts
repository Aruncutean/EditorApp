import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadFileService {

  constructor(private http: HttpClient) { }

  getFile(file: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'text/plain; charset=utf-8')
      .set('Access-Control-Allow-Origin', '*');

    return this.http.get(file, { 'headers': headers, responseType: 'text' });
  }
}
