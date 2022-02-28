import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';
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
import { Apif29NcrService } from 'app/shared/services/api-f29ncr.service';
import { DateService } from 'app/shared/services/date.service';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';
import { LocalDataSource } from 'ng2-smart-table';
import { DateAdapter } from '@angular/material/core';
import { createVeriffFrame } from '@veriff/incontext-sdk';
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
  providers: [PatientService, Apif29BioService, ApiDx29ServerService, Apif29NcrService]
})

export class HomeComponent implements OnInit, OnDestroy {
  //Variable Declaration
  private subscription: Subscription = new Subscription();
  timeformat = "";
  lang = 'en';
  formatDate: any = [];
  today = new Date();
  isVerified: boolean = false;
  loadVerifiedInfo: boolean = false;
  patients: any = [];
  loadedPatients: boolean = false;
  alertsettings: any = {};
  alertSource: LocalDataSource;

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService, private adapter: DateAdapter<any>, private searchService: SearchService, private router: Router) {
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
    this.callIsVerified();
    this.getPatients();
  }

  callIsVerified() {
    this.loadVerifiedInfo = false;
    this.subscription.add(this.http.get(environment.api + '/api/verified/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.loadVerifiedInfo = true;
        this.isVerified = res.verified;
        /*if(!this.isVerified){
          this.getVerified();
        }else{
          
        }*/
      }, (err) => {
        console.log(err);
      }));

  }

  getVerified() {
    console.log(this.isVerified);
    console.log(this.loadVerifiedInfo);
    setTimeout(function () {
      const veriff = Veriff({
        host: 'https://stationapi.veriff.com',
        apiKey: 'afde96eb-05e6-4f38-82ab-2d59fdcdf2a5',
        parentId: 'veriff-root',
        onSession: function (err, response) {
          console.log(response);
          window.veriffSDK.createVeriffFrame({ url: response.verification.url });
          //window.location.replace(response.verification.url);
        }
      });

      veriff.setParams({
        person: {
          givenName: 'Foo',
          lastName: 'Bar'
        },
        vendorData: 'example@mail.com'
      });
      veriff.mount({
        submitBtnText: 'Get verified'
      });

      /*veriff.mount({
        formLabel: {
          vendorData: 'lp2ko.com'
        }
      });*/
    }.bind(this), 2000);
  }

  getPatients() {
    this.loadedPatients = false;
    this.patients = [];
    this.subscription.add(this.patientService.getPatientsRequest()
      .subscribe((res: any) => {
        if (res != null) {
          console.log(res);
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
          }
          this.alertSource = new LocalDataSource(this.patients);
          console.log(this.alertSource);
          this.loadSettingTable();
          this.loadedPatients = true;
        }
      }, (err) => {
        console.log(err);
        this.loadedPatients = true;
      }));
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
              selectText: 'Select...',
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

    //esta llamada creo que sobra
    /*this.subscription.add( this.patientService.getPatientData(e.data.id)
    .subscribe( (res : any) => {
      console.log(res);
      if(!res.message){

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
      console.log(e.data.group);
        this.authService.setGroup(e.data.group)
        this.authService.setCurrentPatient(info);
        console.log(this.authService.getCurrentPatient())
        this.router.navigate(['/patient']);
      }
      
    }, (err) => {
      console.log(err);
    }));*/
  }

}
