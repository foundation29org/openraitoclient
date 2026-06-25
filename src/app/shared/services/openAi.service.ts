import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { SortService } from 'app/shared/services/sort.service';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class OpenAiService {
    constructor(private http: HttpClient, private sortService: SortService) {}

    postOpenAi2(info){
      return this.http.post(environment.urlRaito + '/api/callopenai2', info).pipe(
        map((res: any) => {
        return res;
      }),
        catchError((err) => { console.log(err);
        return err; })
      )
    }


}
