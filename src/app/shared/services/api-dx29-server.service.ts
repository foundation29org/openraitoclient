import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class ApiDx29ServerService {
    constructor(private http: HttpClient) {}

    getAzureBlobSasToken(containerName){
      return this.http.get(environment.api+'/api/getAzureBlobSasTokenWithContainer/'+containerName).pipe(
        map((res: any) => {
          return res.containerSAS;
      }),
        catchError((err) => { console.log(err);
          return err; })
      )
  }

}
