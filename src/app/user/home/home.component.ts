import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { PatientService } from 'app/shared/services/patient.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { ToastrService } from 'ngx-toastr';
import { SearchService } from 'app/shared/services/search.service';
import { SortService } from 'app/shared/services/sort.service';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { Apif29BioService } from 'app/shared/services/api-f29bio.service';
import { DateService } from 'app/shared/services/date.service';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { TextTransform } from 'app/shared/services/transform-text.service';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';
import { LocalDataSource } from 'ng2-smart-table';
import { DateAdapter } from '@angular/material/core';
import { createVeriffFrame } from '@veriff/incontext-sdk';
import CryptoES from 'crypto-es';
import * as decode from 'jwt-decode';
//const Veriff = require('@veriff/js-sdk');
//import * as Veriff from '@veriff/js-sdk';
declare var Veriff: any;

declare global {
  interface Window {
    veriffSDK: any;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [PatientService, Apif29BioService, ApiDx29ServerService]
})

export class HomeComponent implements OnInit, OnDestroy {
  //Variable Declaration
  private subscription: Subscription = new Subscription();
  timeformat = "";
  lang = 'en';
  formatDate: any = [];
  today = new Date();
  infoVerified: any = {};
  loadVerifiedInfo: boolean = false;
  patients: any = [];
  loadedPatients: boolean = false;
  alertsettings: any = {};
  alertSource: LocalDataSource;
  listDiagnosesAllPatients: any = [];
  especialRequest: any = [];
  userInfo: any = {};

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService, private adapter: DateAdapter<any>, private searchService: SearchService, private router: Router, private apif29BioService: Apif29BioService, private textTransform: TextTransform) {
    this.adapter.setLocale(this.authService.getLang());
    this.lang = this.authService.getLang();
    switch (this.authService.getLang()) {
      case 'en':
        this.timeformat = "M/d/yy";
        break;
      case 'es':
        this.timeformat = "d/M/yy";
        break;
      case 'nl':
        this.timeformat = "d-M-yy";
        break;
      default:
        this.timeformat = "M/d/yy";
        break;

    }

  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.subscription.add(this.http.get(environment.api + '/api/users/name/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.userInfo = res;
        this.callIsVerified();
      }, (err) => {
        console.log(err);
      }));

  }

  callIsVerified() {
    this.loadVerifiedInfo = false;
    this.subscription.add(this.http.get(environment.api + '/api/verified/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.loadVerifiedInfo = true;
        this.infoVerified = res.infoVerified;
        if(!this.infoVerified.isVerified){
          this.checkStatusVerified();
          //this.getVerified();
        }else{
          //this.checkStatusVerified();
          this.getPatients();
        }
      }, (err) => {
        console.log(err);
      }));

  }

  checkStatusVerified(){
    if(this.infoVerified.url){
      var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
      var tokenPayload = decode(token[1]);
      var date1 = tokenPayload.iat;
      var date2 = (new Date().getTime())/1000;
      var timeDiff = date2 - date1;
      var Difference_In_Days = timeDiff / (1000 * 3600 * 24);
      if(Difference_In_Days>=6){
        //this.createSesion();
        this.verifyStatus();
      }else{
        this.getVerified();
      }
      //this.saveDataVeriff(tokenPayload.session_id);
    }else{
      this.getVerified();
    }
        
  }

  saveDataVeriff(){
    var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
    var tokenPayload = decode(token[1]);
    var session_id= tokenPayload.session_id
    var hashva = CryptoES.HmacSHA256(session_id, environment.privateVeriff);
    const headers= new HttpHeaders()
    .set('X-HMAC-SIGNATURE', hashva.toString().toLowerCase())
    .set('x-auth-client', environment.tokenVeriff);

    this.subscription.add(this.http.get('https://api.veriff.me/v1/sessions/'+session_id+'/person', { 'headers': headers })
      .subscribe((res: any) => {
        if(res.status=='success'){
          this.infoVerified.info = res.person;
        }
        this.saveDataVerfified();
        
      }, (err) => {
        console.log(err);
      }));
  }
  

  createSesion(){
    var date = new Date();
    date.toISOString();
    var params = {"verification":{"person":{"firstName":this.userInfo.userName,"lastName":this.userInfo.lastName},"vendorData":this.userInfo.idUser,"timestamp":date}};
    this.subscription.add(this.http.post('https://api.veriff.me/v1/sessions', params)
      .subscribe((res: any) => {
        this.infoVerified.url = res.verification.url;
        this.infoVerified.status = res.verification.status;
        this.saveDataVerfified();
        if(res.verification.status=='created'){
          window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
            onEvent: function(msg) {
          } });
        }
      }, (err) => {
        console.log(err);
      }));
  }

  getVerified() {
    if(this.infoVerified.status=='Not started'){
      Swal.fire({
        title: this.translate.instant("identity.t1"),
        html: this.translate.instant("identity.t2"),
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#33658a',
        cancelButtonColor: '#B0B6BB',
        confirmButtonText: 'Ok',
        showLoaderOnConfirm: true,
        allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.createSesion();
      }
    });
    
      
    }else if(this.infoVerified.status=='created'){
      Swal.fire({
        title: this.translate.instant("identity.t1"),
        html: this.translate.instant("identity.t2"),
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#33658a',
        cancelButtonColor: '#B0B6BB',
        confirmButtonText: 'Ok',
        showLoaderOnConfirm: true,
        allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
          window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
            onEvent: async function(msg) {
            if(msg=='FINISHED'){
              this.infoVerified.status = 'submitted';
              this.saveDataVerfified();
              await this.delay(60000);
              this.reloadPage();
            }
          }.bind(this) });
        
      }
    });

      
    }else if(this.infoVerified.status=='submitted'){
      this.verifyStatus();
    }else{
      this.verifyStatus();
    }
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

  verifyStatus(){
    var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
    const headers= new HttpHeaders()
    .set('Authorization', 'Bearer '+token[1]);
    this.subscription.add(this.http.get('https://alchemy.veriff.com/api/v2/sessions', { 'headers': headers })
        .subscribe((res: any) => {
          this.infoVerified.status = res.status;
          if(this.infoVerified.status=='completed'){
            if(res.activeVerificationSession.status=='declined'){
              this.infoVerified.status='declined';
              this.infoVerified.info = res.activeVerificationSession.verificationRejectionCategory;
              this.infoVerified.isVerified = false;
            }else{
              this.infoVerified.isVerified = true;
              this.saveDataVeriff();
              Swal.fire(this.translate.instant("identity.t3"), this.translate.instant("identity.t4"), "success");
              this.getPatients();
            }
            
          }else if(this.infoVerified.status=='submitted' && res.previousVerificationSessions.length>0){
            this.infoVerified.status = 'resubmission_requested';
            this.infoVerified.info = res.previousVerificationSessions[0].verificationRejectionCategory;
            if(res.previousVerificationSessions[0].status=='resubmission_requested'){
              Swal.fire({
                title: this.translate.instant("identity.t5"),
                html: this.translate.instant("identity.t6"),
                icon: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#33658a',
                cancelButtonColor: '#B0B6BB',
                confirmButtonText: 'Ok',
                showLoaderOnConfirm: true,
                allowOutsideClick: false
            }).then((result) => {
              if (result.value) {
              window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
                onEvent: async function(msg) {
                if(msg=='FINISHED'){
                  this.infoVerified.status = 'submitted';
                  this.saveDataVerfified();
                  await this.delay(60000);
                  this.reloadPage();
                }
              }.bind(this) });
              }
            });

              
            }

          }else if(this.infoVerified.status=='submitted'){
            (async () => { 
              await this.delay(60000);
               this.reloadPage();
             })();
          }else if(this.infoVerified.status=='expired' || this.infoVerified.status=='abandoned'){
            //this.infoVerified.status=='Not started';
            this.createSesion();
          }
          this.saveDataVerfified();
          
          //Resubmission
          //Declined
          //Approved
          //Expired
          //Abandoned

        }, (err) => {
          console.log(err);
        }));
  }

  saveDataVerfified(){
      var paramssend = { infoVerified: this.infoVerified };
      this.subscription.add( this.http.post(environment.api+'/api/verified/'+this.authService.getIdUser(), paramssend)
      .subscribe( (res : any) => {
        
       }, (err) => {
         console.log(err.error);
       }));
  }

  getPatients() {
    this.loadedPatients = false;
    this.patients = [];
    this.listDiagnosesAllPatients = [];
    this.especialRequest = [];
    this.subscription.add(this.patientService.getPatientsRequest()
      .subscribe((res: any) => {
        if (res != null) {
          this.patients = res;
          for (var i = 0; i < this.patients.length; i++) {
            if (this.patients[i].birthDate) {
              var dateRequest2 = new Date(this.patients[i].birthDate);
              var resul = ''
              var temp = this.ageFromDateOfBirthday(dateRequest2);
              if (temp != null) {
                if (temp.years > 0) {
                  if (temp.years > 1) {
                    resul = temp.years + " " + this.translate.instant("topnavbar.year") + "s";
                  } else {
                    resul = temp.years + " " + this.translate.instant("topnavbar.year");
                  }

                }
                if (temp.months > 0) {
                  if (temp.months > 1) {
                    resul = resul + " " + temp.months + " " + this.translate.instant("topnavbar.months")
                  } else {
                    resul = resul + " " + temp.months + " " + this.translate.instant("topnavbar.month")
                  }
                }
                if (temp.years == 0 && temp.months == 0) {
                  resul = "0 " + this.translate.instant("topnavbar.months")
                }
              }
              this.patients[i].birthDate2 = resul;
            } else {
              this.patients[i].birthDate2 = '-';
            }

            if (this.patients[i].gender) {
              if (this.patients[i].gender == 'male') {
                this.patients[i].gender2 = this.translate.instant("personalinfo.Male");
              } else {
                this.patients[i].gender2 = this.translate.instant("personalinfo.Female");
              }

            } else {
              this.patients[i].gender2 = '-';
            }
            if(this.patients[i].previousDiagnosis!=null){
              this.listDiagnosesAllPatients.push(this.patients[i].previousDiagnosis);
            }

            if(this.patients[i].hasIndividualShare){
              this.patients[i].hasIndividualShare = '<span class="black">'+this.translate.instant("generics.Yes")+'</span>';
              this.especialRequest.push(this.patients[i]);
           }else{
              this.patients[i].hasIndividualShare = '<span class="black">'+this.translate.instant("generics.No")+'</span>';
           }
          }
          if(this.listDiagnosesAllPatients.length>0){
            this.getInfoDiseases();
          }else{
            this.loadAllPatientsToTable();
          }
          
        }
      }, (err) => {
        console.log(err);
        this.loadedPatients = true;
      }));
  }

  loadAllPatientsToTable(){
    this.alertSource = new LocalDataSource(this.patients);
    this.loadSettingTable();
    this.loadedPatients = true;
  }

  ageFromDateOfBirthday(dateOfBirth: any) {
    var res: any;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    var months;
    months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();
    var age = 0;
    if (months > 0) {
      age = Math.floor(months / 12)
    }
    var res = months <= 0 ? 0 : months;
    var m = res % 12;
    res = { years: age, months: m };
    return res;
  }

  loadSettingTable() {
    this.alertsettings = {
      actions: { columnTitle: this.translate.instant("generics.Options"), add: false, edit: false, delete: false, position: 'right' },
      delete: {
        confirmDelete: true,
        deleteButtonContent: '<i title=' + this.translate.instant("generics.Delete") + ' class="fa fa-trash fa-1_5x danger"></i>'
        //deleteButtonContent: '<span class="danger">'+this.translate.instant("generics.Delete")+'</span>'
      },
      add: {
        confirmCreate: false,
      },
      edit: {
        confirmSave: false,
        editButtonContent: '<i class="ft-edit-2 info font-medium-1 mr-2"></i>'
      },
      columns: {
        id: {
          title: this.translate.instant("diagnosis.Case"),
          placeholder: this.translate.instant("diagnosis.Case"),
          type: "html",
        },
        hasIndividualShare: {
          title: this.translate.instant("open.Shared with me"),
          placeholder: this.translate.instant("generics.Yes")+'/'+this.translate.instant("generics.No"),
          type: "html",
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant("open.Select..."),
              list: [
                { value: this.translate.instant("generics.Yes"), title: this.translate.instant("generics.Yes") },
                { value: this.translate.instant("generics.No"), title: this.translate.instant("generics.No") },
              ],
            },
          },
          filterFunction(cell?: string, search?: string): boolean {
            if (cell.indexOf(search) != -1) {
              return true;
            } else {
              return false;
            }
          },
        },
        diagnosisInfo: {
          title: this.translate.instant("clinicalinfo.Diagnosis"),
          placeholder: this.translate.instant("clinicalinfo.Diagnosis"),
          type: "html",
          valuePrepareFunction: (diagnosis) => {
            if (diagnosis) {
              var dev = '<span class="">'+diagnosis.name+'</span><span class="d-block">'+diagnosis.xrefs[0].name+':'+diagnosis.xrefs[0].id +'</span>'
              return dev;
            }
            else{
                return null;
            }
        },
        filterFunction(cell?: string, search?:string): boolean {
          var infoDisease = JSON.stringify(cell).toLowerCase();
          var searchLowercase = search.toLowerCase();
          if(infoDisease.indexOf(searchLowercase)!=-1){
            return true;
          }else{
            return false;
          }
        },
        },
        patientName: {
          title: this.translate.instant("generics.Name"),
          placeholder: this.translate.instant("generics.Name"),
          type: "html",
        },
        surname: {
          title: this.translate.instant("personalinfo.Last Name"),
          placeholder: this.translate.instant("personalinfo.Last Name"),
          type: "html",
        },
        birthDate2: {
          title: this.translate.instant("topnavbar.age"),
          placeholder: this.translate.instant("topnavbar.age"),
          type: "html",
        },
        gender2: {
          title: this.translate.instant("personalinfo.Gender"),
          placeholder: this.translate.instant("personalinfo.Gender"),
          type: "html",
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant("open.Select..."),
              list: [
                { value: this.translate.instant("personalinfo.Male"), title: this.translate.instant("personalinfo.Male") },
                { value: this.translate.instant("personalinfo.Female"), title: this.translate.instant("personalinfo.Female") },
                { value: '-', title: this.translate.instant("personalinfo.Unassigned") },
              ],
            },
          },
          filterFunction(cell?: string, search?: string): boolean {
            if (cell.indexOf(search) != -1) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      pager: {
        display: true,
        perPage: 10
      },
      attr: {
        class: "table table-responsive"
      },
    };
  }

  selectPatient(data){
    this.authService.setGroup(data.group)
    var info = {
      sub: data.id,
      patientName: null,
      surname: null,
      permissions: null,
      alias: null,
      birthDate: data.birthDate,
      gender: data.gender,
      country: null,
      showSwalIntro: false
    };
    this.authService.setCurrentPatient(info);
    this.router.navigate(['/patient']);
  }

  handleGridSelected(e) {
    this.authService.setGroup(e.data.group)
    var info = {
      sub: e.data.id,
      patientName: null,
      surname: null,
      permissions: null,
      alias: null,
      birthDate: e.data.birthDate,
      gender: e.data.gender,
      country: null,
      showSwalIntro: false
    };
    this.authService.setCurrentPatient(info);
    this.router.navigate(['/patient']);
  }

  getInfoDiseases(){
    this.subscription.add(this.apif29BioService.getInfoOfDiseasesLang(this.listDiagnosesAllPatients, this.lang)
      .subscribe((res1: any) => {
        for (var i = 0; i < this.patients.length; i++) {
          if(this.patients[i].previousDiagnosis!=null){
            var copy = JSON.parse(JSON.stringify(res1[this.patients[i].previousDiagnosis]));
            this.patients[i].diagnosisInfo = this.cleanxrefs(copy);
          }
          else{
            this.patients[i].diagnosisInfo = null;
          }
        }
        this.loadAllPatientsToTable();
        
      }, (err) => {
          this.loadAllPatientsToTable();
          console.log(err);
      }));
  }

  cleanxrefs(disease) {
    if (disease.xrefs != undefined) {
        if (disease.xrefs.length == 0) {
            disease.xrefs.push(disease.id);
        }
        disease.xrefs.sort((one, two) => (one > two ? -1 : 1));
        var xrefs = this.cleanOrphas(disease.xrefs)
        disease.xrefs = xrefs;
    }
    disease.name = this.textTransform.transform(disease.name);
    return disease;
}

cleanOrphas(xrefs) {
  var res = [];
  var count = 0;
  for (var i = 0; i < xrefs.length; i++) {
      if (xrefs[i].indexOf('ORPHA') != -1 || xrefs[i].indexOf('ORPHANET') != -1 || xrefs[i].indexOf('OMIM') != -1 || xrefs[i].indexOf('Orphanet') != -1) {
          if (xrefs[i].indexOf('ORPHA') != -1 || xrefs[i].indexOf('ORPHANET') != -1 || xrefs[i].indexOf('Orphanet') != -1) {
              count++;
          }
          if (count <= 1) {
              var value = xrefs[i].split(':');
              if (xrefs[i].indexOf('ORPHA') != -1 || xrefs[i].indexOf('ORPHANET') != -1 || xrefs[i].indexOf('Orphanet') != -1) {
                  res.push({ name: 'Orphanet', id: value[1] });
              } else if (xrefs[i].indexOf('OMIM') != -1) {
                  res.push({ name: 'OMIM', id: value[1] });
              }
              count++;
          }
      }
  }
  return res;
}

reloadPage(){
  window.location.reload();
}

}
