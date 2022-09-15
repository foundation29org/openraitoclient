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
export class RaitoService {
    constructor(private authService: AuthService, private http: HttpClient) {}

    getPatients(){
      return this.http.get(environment.urlRaito+'/api/eo/patients/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getPatient(idPatient){
      return this.http.get(environment.urlRaito+'/api/eo/patient/'+idPatient)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getOnlyPatients(meta){
      return this.http.post(environment.urlRaito+'/api/eo/onlypatients/'+this.authService.getGroup(), {meta:meta})
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getSeizures(){
      return this.http.get(environment.urlRaito+'/api/eo/seizures/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getDrugs(){
      return this.http.get(environment.urlRaito+'/api/eo/drugs/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getPhenotypes(){
      return this.http.get(environment.urlRaito+'/api/eo/phenotypes/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getFeels(){
      return this.http.get(environment.urlRaito+'/api/eo/feels/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getProms(){
      return this.http.get(environment.urlRaito+'/api/eo/proms/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getWeights(){
      return this.http.get(environment.urlRaito+'/api/eo/weights/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getHeights(){
      return this.http.get(environment.urlRaito+'/api/eo/heights/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }


    getQuestionnairesGroup(){
      return this.http.get(environment.urlRaito+'/api/group/questionnaires/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getGroupFile(){
      return this.http.get(environment.urlRaito+'/api/group/configfile/'+this.authService.getGroup())
        .map( (res : any) => {
          return res;
         }, (err) => {
          console.log(err);
          return err;
         })
    }

    loadPatientId(idPatient){
      return this.http.get(environment.urlRaito+'/api/patients/'+idPatient)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    loadRecommendedDose(){
      return this.http.get(environment.urlRaito+'/assets/jsons/recommendedDose.json')
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    loadGroups(){
      return this.http.get(environment.urlRaito+'/api/groupsnames/')
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    loadDrugsGroup(idGroup){
      return this.http.get(environment.urlRaito+'/api/group/medications/'+idGroup)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getFeelsPatient(idPatient, infoall){
      var info = {rangeDate: infoall.rangeDate}
      if(infoall.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/feels/dates/'+idPatient, infoall)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/feels/dates/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }
      
    }

    getSeizuresPatient(idPatient, infoall){
      var info = {rangeDate: infoall.rangeDate}
      if(infoall.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/seizures/dates/'+idPatient, infoall)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/seizures/dates/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }
      
    }

    getMedicationsPatient(idPatient, infoall){
      var info = {rangeDate: infoall.rangeDate}
      if(infoall.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/medications/dates/'+idPatient, infoall)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/medications/dates/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }
      
    }

    getFeelsPatientV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/feels/dates/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getSeizuresPatientV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/seizures/dates/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getMedicationsPatientV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/medications/dates/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getPatientWeight(idPatient){
      return this.http.get(environment.urlRaito+'/api/weight/'+idPatient)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

    getPatientPhenotypes(idPatient, info){
      if(info.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/phenotypes/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/phenotypes/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
      }
      
    }

    getPatientPhenotypesV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/phenotypes/'+idPatient, info)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
         })
    }

}
