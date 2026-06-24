import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../app/shared/auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class PatientService {
    constructor(private authService: AuthService, private http: HttpClient) {}

    getPatients(){
      //cargar las faqs del knowledgeBaseID
      return this.http.get(environment.api+'/api/openraito/patients/'+this.authService.getIdUser()).pipe(
          map((res: any) => {
          if(res.listpatients.length>0){
            return (res.listpatients);
          }else{
            return null;
          }
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPatientsRequest(){
      //cargar las faqs del knowledgeBaseID
      return this.http.get(environment.api+'/api/openraito/patientsrequest/'+this.authService.getIdUser()).pipe(
          map((res: any) => {
          console.log(res);
          if(res.listpatients.length>0){
            return (res.listpatients);
          }else{
            return null;
          }
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPatientData(patientId){
      //cargar las faqs del knowledgeBaseID
      var info = {idUser: this.authService.getIdUser()}
      return this.http.post(environment.api+'/api/openraito/patient/'+patientId, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getOpenData(patientId, token){
      //cargar las faqs del knowledgeBaseID
      var info = {token: token}
      return this.http.post(environment.api+'/api/openraito/patient/all/'+patientId, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    requestIndividualShare(info){
      //cargar las faqs del knowledgeBaseID
      return this.http.post(environment.api+'/api/openraito/patient/individualshare/'+this.authService.getCurrentPatient().sub, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getIndividualShare(idUser){
      //cargar las faqs del knowledgeBaseID
      var info = {idUser: idUser}
      return this.http.post(environment.api+'/api/openraito/patient/getindividualshare/'+this.authService.getCurrentPatient().sub, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getModules(patientId) {
      return this.http.get(environment.api+'/api/openraito/users/modules/'+ patientId).pipe(
        map((res: any) => {
        return res;
       }),
        catchError((err) => { console.log(err);
        return err; })
      );
    }

    saveRecommendations(drugsToSave, patientId){
      return this.http.post(environment.urlRaito+'/api/massiveseizuresdose/'+patientId, drugsToSave).pipe(
          map((res: any) => {
          return res;
          }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }



}
