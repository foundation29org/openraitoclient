import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../app/shared/auth/auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/toPromise';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class PatientService {
    constructor(private authService: AuthService, private http: HttpClient) {}

    getPatients(){
      //cargar las faqs del knowledgeBaseID
      return this.http.get(environment.api+'/api/openraito/patients/'+this.authService.getIdUser())
        .map( (res : any) => {
          if(res.listpatients.length>0){
            return (res.listpatients);
          }else{
            return null;
          }
         }, (err) => {
           console.log(err);
         })
    }

    getPatientsRequest(){
      //cargar las faqs del knowledgeBaseID
      return this.http.get(environment.api+'/api/openraito/patientsrequest/'+this.authService.getIdUser())
        .map( (res : any) => {
          console.log(res);
          if(res.listpatients.length>0){
            return (res.listpatients);
          }else{
            return null;
          }
         }, (err) => {
           console.log(err);
         })
    }

    getPatientData(patientId){
      //cargar las faqs del knowledgeBaseID
      var info = {idUser: this.authService.getIdUser()}
      return this.http.post(environment.api+'/api/openraito/patient/'+patientId, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getOpenData(patientId, token){
      //cargar las faqs del knowledgeBaseID
      var info = {token: token}
      return this.http.post(environment.api+'/api/openraito/patient/all/'+patientId, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    requestIndividualShare(info){
      //cargar las faqs del knowledgeBaseID
      return this.http.post(environment.api+'/api/openraito/patient/individualshare/'+this.authService.getCurrentPatient().sub, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getIndividualShare(idUser){
      //cargar las faqs del knowledgeBaseID
      var info = {idUser: idUser}
      return this.http.post(environment.api+'/api/openraito/patient/getindividualshare/'+this.authService.getCurrentPatient().sub, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getModules(patientId) {
      return this.http.get(environment.api+'/api/openraito/users/modules/'+ patientId)
      .map( (res : any) => {
        return res;
       }, (err) => {
        console.log(err);
        return err;
       });
    }

    saveRecommendations(drugsToSave){
      return this.http.post(environment.urlRaito+'/api/massiveseizuresdose/'+this.authService.getCurrentPatient().sub, drugsToSave)
        .map( (res : any) => {
          return res;
          }, (err) => {
            console.log(err);
          })
    }



}
