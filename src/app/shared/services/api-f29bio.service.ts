import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'
import { OVERLAY_KEYBOARD_DISPATCHER_PROVIDER } from '@angular/cdk/overlay/keyboard/overlay-keyboard-dispatcher';

@Injectable()
export class Apif29BioService {

    constructor(private http: HttpClient) {}

    getInfoOfSymptoms(lang,listIds){
        //var startTime = new Date().getTime();
        return this.http.post(environment.urlDxv2+'/api/v1/F29Bio/phenotypes/'+lang, listIds)
        .map( (res : any) => {
            return res;
        }, (err) => {
            console.log(err);
            return err;
        })
    }

    getInfoOfDiseasesLang(listOfDiseases, lang){
        return this.http.post(environment.urlDxv2+'/api/v1/F29Bio/diseases/'+lang, listOfDiseases)
        .map( (res : any) => {
            return res;
        }, (err) => {
            console.log(err);
            return err;
        })
    }

}
