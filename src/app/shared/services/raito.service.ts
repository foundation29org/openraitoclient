import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../app/shared/auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class RaitoService {
    constructor(private authService: AuthService, private http: HttpClient) {}

    getPatients(){
      return this.http.get(environment.urlRaito+'/api/eo/patients/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPatient(idPatient){
      return this.http.get(environment.urlRaito+'/api/eo/patient/'+idPatient).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getOnlyPatients(meta){
      return this.http.post(environment.urlRaito+'/api/eo/onlypatients/'+this.authService.getGroup(), {meta:meta}).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getSeizures(){
      return this.http.get(environment.urlRaito+'/api/eo/seizures/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getDrugs(){
      return this.http.get(environment.urlRaito+'/api/eo/drugs/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPhenotypes(){
      return this.http.get(environment.urlRaito+'/api/eo/phenotypes/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getFeels(){
      return this.http.get(environment.urlRaito+'/api/eo/feels/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getProms(){
      return this.http.get(environment.urlRaito+'/api/eo/proms/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getWeights(){
      return this.http.get(environment.urlRaito+'/api/eo/weights/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getHeights(){
      return this.http.get(environment.urlRaito+'/api/eo/heights/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }


    getQuestionnairesGroup(){
      return this.http.get(environment.urlRaito+'/api/group/questionnaires/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getGroupFile(){
      return this.http.get(environment.urlRaito+'/api/group/configfile/'+this.authService.getGroup()).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
          return err; })
        )
    }

    loadPatientId(idPatient){
      return this.http.get(environment.urlRaito+'/api/patients/'+idPatient).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    loadRecommendedDose(){
      return this.http.get(environment.urlRaito+'/assets/jsons/recommendedDose.json').pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    loadGroups(){
      return this.http.get(environment.urlRaito+'/api/groupsnames/').pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    loadDrugsGroup(idGroup){
      return this.http.get(environment.urlRaito+'/api/group/medications/'+idGroup).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getFeelsPatient(idPatient, infoall){
      var info = {rangeDate: infoall.rangeDate}
      if(infoall.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/feels/dates/'+idPatient, infoall).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/feels/dates/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }
      
    }

    getSeizuresPatient(idPatient, infoall){
      var info = {rangeDate: infoall.rangeDate}
      if(infoall.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/seizures/dates/'+idPatient, infoall).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/seizures/dates/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }
      
    }

    getMedicationsPatient(idPatient, infoall){
      var info = {rangeDate: infoall.rangeDate}
      if(infoall.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/medications/dates/'+idPatient, infoall).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/medications/dates/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }
      
    }

    getFeelsPatientV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/feels/dates/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getSeizuresPatientV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/seizures/dates/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getMedicationsPatientV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/medications/dates/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPatientWeight(idPatient){
      return this.http.get(environment.urlRaito+'/api/weight/'+idPatient).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPatientHeight(idPatient){
      return this.http.get(environment.urlRaito+'/api/height/'+idPatient).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

    getPatientPhenotypes(idPatient, info){
      if(info.token!=''){
        return this.http.post(environment.urlRaito+'/api/openraito/invitation/phenotypes/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }else{
        return this.http.post(environment.urlRaito+'/api/openraito/phenotypes/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
      }
      
    }

    getPatientPhenotypesV2(idPatient, info){
      return this.http.post(environment.urlRaito+'/api/openraito/v2/phenotypes/'+idPatient, info).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
             return of(null); })
        )
    }

}
