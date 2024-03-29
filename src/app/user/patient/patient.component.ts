import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { RaitoService } from 'app/shared/services/raito.service';
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
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TextTransform } from 'app/shared/services/transform-text.service';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';
import * as chartsData from 'app/shared/configs/general-charts.config';
import { DateAdapter } from '@angular/material/core';
import { IBlobAccessToken } from 'app/shared/services/blob-storage.service';
import { ColorHelper } from '@swimlane/ngx-charts';
import { OpenAiService } from 'app/shared/services/openAi.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss'],
  providers: [PatientService, Apif29BioService, ApiDx29ServerService, RaitoService, OpenAiService]
})

export class PatientComponent implements OnInit, OnDestroy {
 //Variable Declaration
 patient: any;
 selectedHeight: any;
 actualHeight: any;
 settingHeight: boolean = false;
 footHeight: any;

 //Chart Data
 lineChartSeizures = [];
 lineChartHeight = [];
 lineChartDrugs = [];
 lineChartDrugsCopy = [];
 lineDrugsVsSeizures = [];
 //Line Charts

 lineChartView: any[] = chartsData.lineChartView;

 // options
 lineChartShowXAxis = chartsData.lineChartShowXAxis;
 lineChartShowYAxis = chartsData.lineChartShowYAxis;
 lineChartGradient = chartsData.lineChartGradient;
 lineChartShowLegend = chartsData.lineChartShowLegend;
 lineChartShowXAxisLabel = chartsData.lineChartShowXAxisLabel;
 lineChartShowYAxisLabel = chartsData.lineChartShowYAxisLabel;

 lineChartColorScheme = chartsData.lineChartColorScheme;
 lineChartOneColorScheme = chartsData.lineChartOneColorScheme;
 lineChartOneColorScheme2 = chartsData.lineChartOneColorScheme2;

 // line, area
 lineChartAutoScale = chartsData.lineChartAutoScale;
 lineChartLineInterpolation = chartsData.lineChartLineInterpolation;


 //Bar Charts
  barChartView: any[] = chartsData.barChartView;

  // options
  barChartShowYAxis = chartsData.barChartShowYAxis;
  barChartShowXAxis = chartsData.barChartShowXAxis;
  barChartGradient = chartsData.barChartGradient;
  barChartShowLegend = chartsData.barChartShowLegend;
  barChartShowXAxisLabel = chartsData.barChartShowXAxisLabel;
  barChartXAxisLabel = chartsData.barChartXAxisLabel;
  barChartShowYAxisLabel = chartsData.barChartShowYAxisLabel;
  barChartYAxisLabel = chartsData.barChartYAxisLabel;
  barChartColorScheme = chartsData.barChartColorScheme;

   private msgDataSavedOk: string;
   private msgDataSavedFail: string;
   private transWeight: string;
   private transHeight: string;
   private msgDate: string;
   private titleSeizures: string;
   private titleDose: string;
   private titleDrugsVsNormalized: string;
   titleDrugsVsDrugs: string;
   private titleDrugsVsNoNormalized: string;
   private group: string;
   actualMedications: any;
   loadedFeels: boolean = false;
   loadedEvents: boolean = false;
   loadedDrugs: boolean = false;
   loadingDataGroup: boolean = false;
   dataGroup: any;
   drugsLang: any;
   feels: any = [];
   events: any = [];
   medications: any = [];

   loadedDocs: boolean = false;
  docs: any = [];
   timeformat = "";
  lang = 'en';
  formatDate: any = [];
  today = new Date();
  
  userId: string = '';
  loadedPatientId: boolean = false;
  selectedPatient: any = {};
  userInfo: any = {};
  loadedInfoPatient: boolean = false;
  patientDataInfo: any = {};
  basicInfoPatient: any;
  basicInfoPatientCopy: any;
  age: number = null;
  infoAge: string = '';
  height: string = null;
  weight: string;
  groups: Array<any> = [];
  private subscription: Subscription = new Subscription();
  rangeDate: string = 'month';
  groupBy: string = 'Months';
  normalized: boolean = true;
  normalized2: boolean = true;
  maxValue: number = 0;
  maxValueDrugsVsSeizu: number = 0;
  minDate = new Date();
  minDateRange = new Date();
  drugsBefore: boolean = false;
  yAxisTicksSeizures = [];
  yAxisTicksDrugs = [];


  //lastchart
  showXAxis = false;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  legendTitle = 'Legend';
  legendPosition = 'right';
  showXAxisLabel = false;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Seizures';
  showGridLines = true;
  animations: boolean = true;
  barChart: any[] = barChart;
  lineChartSeries: any[] = lineChartSeries;
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: this.lineChartColorScheme.domain // ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: this.lineChartOneColorScheme2.domain
  };

  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string;
  checks: any = {};
  consentgroup: boolean = false;
  showNotiSeizu: boolean = false;
  showNotiFeel: boolean = false;
  showNotiDrugs: boolean = false;

  public chartNames: string[];
  public colors: ColorHelper;
  public colors2: ColorHelper;
  public colorsLineToll: ColorHelper;
  titleSeizuresLegend = [];

  patientPermissions: any = {
    data:{patientInfo:false, medicalInfo:false,devicesInfo:false, genomicsInfo:false},
    notes:''
  };

  individualPermissions: any = {
    data:{patientInfo:false, medicalInfo:false,devicesInfo:false, genomicsInfo:false},
    notes:''
  };

  loadedSymptoms: boolean = false;
  phenotype: any = {};
  phenotypeCopy: any = {};
  selectedInfoSymptomIndex: number = -1;
  modalReference: NgbModalRef;

  accessToken: IBlobAccessToken = {
    // tslint:disable-next-line:max-line-length
    sasToken: environment.blobAccessToken.sasToken,
    blobAccountUrl: environment.blobAccessToken.blobAccountUrl,
    containerName: '',
    patientId: ''
  };
  nameTitle: string = '';
  resultTextNcr: string = '';

  infoOneDisease: any = {};
  
  newPermission:any;
  @ViewChild('f') sendForm: NgForm;
  sending: boolean = false;
  xAxisTicks = [];
  meses: any = 
  [
    {id: 1, es: 'Enero', en: 'January'},
    {id: 2, es: 'Febrero', en: 'February'},
    {id: 3, es: 'Marzo', en: 'March'},
    {id: 4, es: 'Abril', en: 'April'},
    {id: 5, es: 'Mayo', en: 'May'},
    {id: 6, es: 'Junio', en: 'June'},
    {id: 7, es: 'Julio', en: 'July'},
    {id: 8, es: 'Agosto', en: 'August'},
    {id: 9, es: 'Septiembre', en: 'September'},
    {id: 10, es: 'Octubre', en: 'October'},
    {id: 11, es: 'Noviembre', en: 'November'},
    {id: 12, es: 'Diciembre', en: 'December'}
  ];
  notes: string = '';
  showSeizuresModules: boolean = false;
  savedRecommendations: any = [];
  finishloadData: boolean = false;
  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService, private adapter: DateAdapter<any>, private searchService: SearchService, private router: Router, private apif29BioService: Apif29BioService, private modalService: NgbModal, private textTransform: TextTransform, private raitoService: RaitoService, private openAiService: OpenAiService) {
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

  
  loadGroups() {
    this.subscription.add(this.raitoService.loadGroups()
      .subscribe((res: any) => {
        this.groups = res;
        this.groups.sort(this.sortService.GetSortOrder("name"));
      }, (err) => {
        console.log(err);
      }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnInit() {
    this.initEnvironment();
  }


  loadEnvironment() {
    this.medications = [];
    this.actualMedications = [];

    this.selectedHeight = {
      value: null,
      dateTime: null,
      technique: null,
      _id: null
    };

    this.footHeight = {
      feet: null,
      inches: null
    };

    this.actualHeight = {
      value: null,
      dateTime: null,
      technique: null,
      _id: null
    };

    this.loadTranslations();
    this.adapter.setLocale(this.lang);
    switch (this.lang) {
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

    this.getInfoPatient();
  }


  yAxisTickFormatting(value) {
    return this.percentTickFormatting(value);
  }

  percentTickFormatting(val: any) {
    return Math.round(val);
  }

  axisFormat(val) {
    if (Number.isInteger(val)) {
      return Math.round(val);
    } else {
      return '';
    }

  }

  //traducir cosas
  loadTranslations() {
    this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
      this.msgDataSavedOk = res;
    });
    this.translate.get('generics.Data saved fail').subscribe((res: string) => {
      this.msgDataSavedFail = res;
    });

    this.translate.get('anthropometry.Weight').subscribe((res: string) => {
      this.transWeight = res;
    });
    this.translate.get('menu.Feel').subscribe((res: string) => {
      this.transHeight = res;
    });
    this.translate.get('generics.Date').subscribe((res: string) => {
      this.msgDate = res;
    });

    this.translate.get('menu.Seizures').subscribe((res: string) => {
      this.titleSeizures = res;
      var tempTitle = this.titleSeizures+' ('+this.translate.instant("charts.Vertical bars")+')';
      this.titleSeizuresLegend = [tempTitle]
    });
    this.translate.get('medication.Dose mg').subscribe((res: string) => {
      this.yAxisLabelRight = res;
    });
    this.translate.get('homeraito.Normalized').subscribe((res: string) => {
      this.titleDrugsVsNormalized= res;
      this.titleDose = res;
      this.titleDrugsVsDrugs = this.titleDrugsVsNormalized;
    });
    this.translate.get('homeraito.Not normalized').subscribe((res: string) => {
      this.titleDrugsVsNoNormalized= res;
    });
  }

  loadTranslationsElements() {
    this.loadingDataGroup = true;
    this.subscription.add( this.raitoService.loadDrugsGroup(this.authService.getGroup())
      .subscribe((res: any) => {
        if (res.medications.data.length == 0) {
          //no tiene datos sobre el grupo
        } else {
          this.dataGroup = res.medications.data;
          this.drugsLang = [];
          if (this.dataGroup.drugs.length > 0) {
            for (var i = 0; i < this.dataGroup.drugs.length; i++) {
              var found = false;
              for (var j = 0; j < this.dataGroup.drugs[i].translations.length && !found; j++) {
                if (this.dataGroup.drugs[i].translations[j].code == this.authService.getLang()) {
                  if (this.dataGroup.drugs[i].drugsSideEffects != undefined) {
                    this.drugsLang.push({ name: this.dataGroup.drugs[i].name, translation: this.dataGroup.drugs[i].translations[j].name, drugsSideEffects: this.dataGroup.drugs[i].drugsSideEffects });
                  } else {
                    this.drugsLang.push({ name: this.dataGroup.drugs[i].name, translation: this.dataGroup.drugs[i].translations[j].name });
                  }
                  found = true;
                }
              }
            }
            this.drugsLang.sort(this.sortService.GetSortOrder("translation"));
          }
        }
        this.loadingDataGroup = false;
        this.calculateMinDate();
        this.loadData();
      }, (err) => {
        console.log(err);
        this.loadingDataGroup = false;
        this.calculateMinDate();
        this.loadData();
      }));

  }

  initEnvironment(){
    //this.userId = this.authService.getIdUser();
    if(this.authService.getCurrentPatient()==null){
      this.router.navigate(['/home']);
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.loadEnvironment();
    }
  }

  getSavedRecommendations() {
    this.subscription.add( this.http.get(environment.urlRaito+'/api/dose/'+ this.authService.getCurrentPatient().sub)
        .subscribe( (resDoses : any) => {
          console.log(resDoses)
            this.savedRecommendations = resDoses;
            for (let i = 0; i < this.savedRecommendations.length; i++) {
              if(this.savedRecommendations[i].units == 'mg/day'){
                this.savedRecommendations[i].recommendedDose = Math.round(parseFloat(this.savedRecommendations[i].recommendedDose));
              }else{
                this.savedRecommendations[i].recommendedDose = Math.round(parseFloat(this.savedRecommendations[i].recommendedDose)*parseFloat(this.weight));
              }
            }
          }, (err) => {
            console.log(err);
            this.toastr.error('', this.translate.instant("generics.error try again"));
          }));
  }

  getInfoPatient(){
    this.loadedInfoPatient = false;
    this.subscription.add( this.patientService.getPatientData(this.authService.getCurrentPatient().sub)
    .subscribe( (res : any) => {
      if(!res.message){
        this.patientDataInfo = res.patient;
        this.patientDataInfo.birthDate = this.dateService.transformDate(res.patient.birthDate);
        this.patientDataInfo = JSON.parse(JSON.stringify(res.patient));
        if(this.patientDataInfo.previousDiagnosis!=null){
          this.loadDiseaseInfo();
        }
        if (this.patientDataInfo.birthDate != null && this.patientDataInfo.birthDate != '') {
          this.ageFromDateOfBirthday(res.patient.birthDate);
        } else if (this.patientDataInfo.birthDate == null || this.patientDataInfo.birthDate == '') {
        }

        this.patientPermissions = res.patient.generalShare;
      }else{
        this.patientPermissions = res.generalShare;
      }
      if(this.patientPermissions.data.medicalInfo){
        this.loadTranslationsElements();
      }
      this.getIndividualShare();
      this.loadedInfoPatient = true;
    }, (err) => {
      console.log(err);
    }));
  }

  loadDiseaseInfo(){
    var param = [this.patientDataInfo.previousDiagnosis];
    this.subscription.add(this.apif29BioService.getInfoOfDiseasesLang(param, this.lang)
      .subscribe((res1: any) => {
          this.infoOneDisease = res1[this.patientDataInfo.previousDiagnosis];
          this.cleanxrefs();
      }, (err) => {
          console.log(err);
      }));
  }

  cleanxrefs() {
    if (this.infoOneDisease.xrefs != undefined) {
        if (this.infoOneDisease.xrefs.length == 0) {
            this.infoOneDisease.xrefs.push(this.infoOneDisease.id);
        }
        this.infoOneDisease.xrefs.sort((one, two) => (one > two ? -1 : 1));
        var xrefs = this.cleanOrphas(this.infoOneDisease.xrefs)
        this.infoOneDisease.xrefs = xrefs;
    }
    this.infoOneDisease.name = this.textTransform.transform(this.infoOneDisease.name);
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


ageFromDateOfBirthday(dateOfBirth: any) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  this.age = age;
}

  getAge(dateOfBirth: any) {
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
    var res2 = months <= 0 ? 0 : months;
    var m = res2 % 12;
    res = { years: age, months: m };
    return res;
  }


  calculateMinDate() {
    var period = 31;
    if (this.rangeDate == 'quarter') {
      period = 90;
    } else if (this.rangeDate == 'year') {
      period = 365;
    }
    var actualDate = new Date();
    var pastDate = new Date(actualDate);
    pastDate.setDate(pastDate.getDate() - period);
    this.minDateRange = pastDate;

    var actualDate1=new Date();
    var pastDate1=new Date(actualDate1);
    pastDate1.setDate(pastDate1.getDate() - Math.round((period+1)/2));
    var mediumDate = pastDate1;
    this.xAxisTicks = [this.minDateRange.toISOString(),mediumDate.toISOString(),actualDate.toISOString()];
  }

  loadData() {
    //cargar los datos del usuario
    this.loadedFeels = false;
    if (this.patientPermissions.data.medicalInfo) {
      this.loadPartData();
      this.getDocs();
      this.loadSymptoms();
      this.getWeightAndAge();
      this.getHeight();
    }
  }

  loadPartData() {
    //cargar los datos del usuario
    this.loadedFeels = false;
    if (this.patientPermissions.data.medicalInfo) {
      this.getModules();
    }
  }

  getModules(){
    this.subscription.add(this.patientService.getModules(this.authService.getCurrentPatient().sub)
    .subscribe((res: any) => {
      this.showSeizuresModules = res.modules.includes("seizures");
      if(this.showSeizuresModules){
        this.getFeels();
        this.getSeizures();
        this.calculateMinDate();
      }else{
        this.getFeels();
        this.getDrugs();
        this.calculateMinDate();
      }
    }, (err) => {
      console.log(err);
      this.showSeizuresModules = false;
      this.getFeels();
      this.getDrugs();
      this.calculateMinDate();
    }));
  }

  getWeightAndAge() {
    if (this.patientDataInfo.birthDate == null) {
      this.age = null;
    } else {
      this.ageFromDateOfBirthday(this.patientDataInfo.birthDate);
      var temp = this.getAge(this.patientDataInfo.birthDate);
      if (temp != null) {
        if (temp.years > 0) {
          if (temp.years > 1) {
            this.infoAge = temp.years + " " + this.translate.instant("topnavbar.year") + "s";
          } else {
            this.infoAge = temp.years + " " + this.translate.instant("topnavbar.year");
          }

        }
        if (temp.months > 0) {
          if (temp.months > 1) {
            this.infoAge = this.infoAge + " " + temp.months + " " + this.translate.instant("topnavbar.months")
          } else {
            this.infoAge = this.infoAge + " " + temp.months + " " + this.translate.instant("topnavbar.month")
          }
        }
        if (temp.years == 0 && temp.months == 0) {
          this.infoAge = "0 " + this.translate.instant("topnavbar.months")
        }
      }
    }
    this.subscription.add(this.raitoService.getPatientWeight(this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        if (res.message == 'There are no weight') {
          this.weight = null;
        } else if (res.message == 'old weight') {
          this.weight = res.weight.value
          this.getSavedRecommendations();
        } else {
          this.weight = res.weight.value
          this.getSavedRecommendations();
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  getHeight() {
    this.subscription.add(this.raitoService.getPatientHeight(this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        if (res.message == 'There are no height') {
          this.height = null;
        } else if (res.message == 'old height') {
          this.height = res.height.value
        } else {
          this.height = res.height.value
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  getFeels() {
    this.loadedFeels = false;
    this.feels = [];
    var info = { rangeDate: this.rangeDate,  userId: this.authService.getIdUser() }
    this.subscription.add( this.raitoService.getFeelsPatientV2(this.authService.getCurrentPatient().sub, info)
      .subscribe((resFeels: any) => {
        if (resFeels.message) {
          //no tiene historico de peso
        } else {
          resFeels.feels.sort(this.sortService.DateSortInver("date"));
        this.feels = resFeels.feels;
        
        var datagraphheight = [];
          for (var i = 0; i < this.feels.length; i++) {
            var splitDate = new Date(this.feels[i].date);
            var numAnswers = 0;
            var value = 0;
            if(this.feels[i].a1!=""){
              numAnswers++;
              value = value+parseInt(this.feels[i].a1);
            }
            if(this.feels[i].a2!=""){
              numAnswers++;
              value = value+parseInt(this.feels[i].a2);
            }
            if(this.feels[i].a3!=""){
              numAnswers++;
              value = value+parseInt(this.feels[i].a3);
            }
            var value = value/numAnswers;
            var splitDate = new Date(this.feels[i].date);
            var stringDate = splitDate.toDateString();
            var foundDateIndex = this.searchService.searchIndex(datagraphheight, 'name', splitDate.toDateString());
            if(foundDateIndex != -1){
              //There cannot be two on the same day
              datagraphheight[foundDateIndex].name = splitDate.toDateString();
              datagraphheight[foundDateIndex].value = value;
              datagraphheight[foundDateIndex].splitDate = splitDate;
            }else{
              datagraphheight.push({ value: value, name: splitDate.toDateString(), stringDate: stringDate });
            }
          }
          var result = this.add0Feels(datagraphheight);
          var prevValue = 0;
          for (var i = 0; i < result.length; i++) {
            if(resFeels.old.date){
              if(result[i].value==0 && resFeels.old.date<result[i].stringDate && prevValue==0){
                result[i].value = (parseInt(resFeels.old.a1)+parseInt(resFeels.old.a2)+parseInt(resFeels.old.a3))/3;
              }else if(result[i].value==0 && prevValue!=0){
                result[i].value = prevValue;
              }
              else if(result[i].value!=0){
                prevValue = result[i].value;
              }
            }else{
              if(result[i].value==0 && prevValue!=0){
                result[i].value =prevValue;
              }else if(result[i].value!=0){
                prevValue = result[i].value;
              }
            }
          }
          this.lineChartHeight = [
            {
              "name": 'Feel',
              "series": result
            }
          ];

        }

        this.loadedFeels = true;
      }, (err) => {
        console.log(err);
        this.loadedFeels = true;
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  add0Feels(datagraphheight){
    var maxDateTemp = new Date();
    var maxDate = maxDateTemp.toDateString();
    
    var minDate = this.minDateRange.toDateString();
    if(datagraphheight[datagraphheight.length-1]!=undefined){
      var splitLastDate = datagraphheight[datagraphheight.length-1].stringDate;
      var splitFirstDate = datagraphheight[0].stringDate;
      if(new Date(splitLastDate)<new Date(maxDate)){
        datagraphheight.push({value: 0,name:maxDate,stringDate:maxDate, types: []})
      }
      if(new Date(minDate)<new Date(splitFirstDate)){
        datagraphheight.push({value: 0,name:minDate,stringDate:minDate, types: []})
      }
    }
    
      var copydatagraphheight = JSON.parse(JSON.stringify(datagraphheight));
      datagraphheight.sort(this.sortService.DateSortInver("stringDate"));
    for (var j = 0; j < datagraphheight.length; j=j+1) {
      var foundDate = false;
      var actualDate = datagraphheight[j].stringDate;
      if(datagraphheight[j+1]!=undefined){
        var nextDate = datagraphheight[j+1].stringDate;
        //stringDate
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copydatagraphheight.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
          }else{
            foundDate = true;
          }
          
        }
        if(datagraphheight[j+2]!=undefined){
        var actualDate = datagraphheight[j+1].stringDate;
        var nextDate = datagraphheight[j+2].stringDate;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copydatagraphheight.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
          }
          
        }
  
        }
      }
    }
    copydatagraphheight.sort(this.sortService.DateSortInver("stringDate"));
    for (var j = 0; j < copydatagraphheight.length; j++) {
      copydatagraphheight[j].name = copydatagraphheight[j].stringDate
      var theDate = new Date(copydatagraphheight[j].name);
      //copydatagraphheight[j].name = this.tickFormattingDay(theDate)
    }
    return copydatagraphheight;
}

  getSeizures() {
    this.loadedEvents = false;
    this.events = [];
    this.lineChartSeizures = [];
    this.drugsBefore = false;
    var info = { rangeDate: this.rangeDate,  userId: this.authService.getIdUser()}
    this.subscription.add( this.raitoService.getSeizuresPatientV2(this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        if (res.message) {
          //no tiene información
          this.events = [];
        } else {
          if (res.length > 0) {
            res.sort(this.sortService.DateSortInver("date"));
            res.sort(this.sortService.DateSortInver("start"));
            this.events = res;
            var datagraphseizures = [];

            datagraphseizures = this.getStructure2(res);
            var respseizures = this.add0Seizures(datagraphseizures);
            if (this.rangeDate == 'quarter' || this.rangeDate == 'year') {
              respseizures = this.groupPerWeek(respseizures);
            }
            var maxValue = this.getMaxValue(respseizures);
            if (maxValue > 1) {
              this.yAxisTicksSeizures = [0, Math.round(maxValue / 2), maxValue];
            } else {
              this.yAxisTicksSeizures = [0, maxValue];
            }

            this.lineChartSeizures = [
              {
                "name": this.titleSeizures,
                "series": respseizures
              }
            ];
            this.getDrugs();
          } else {
            this.events = [];
            this.getDrugs();
          }

        }
        this.loadedEvents = true;
      }, (err) => {
        console.log(err);
        this.loadedEvents = true;
      }));
  }

  getStructure2(res){
    var datagraphseizures = [];
    for (var i = 0; i < res.length; i++) {
      var splitDate = new Date(res[i].start);
      var type = res[i].type;
      var stringDate = splitDate.toDateString();
      var foundElementIndex = this.searchService.searchIndex(datagraphseizures, 'stringDate', stringDate);
      if (foundElementIndex != -1) {
        datagraphseizures[foundElementIndex].value++;
        var foundElementIndexType = this.searchService.searchIndex(datagraphseizures[foundElementIndex].types, 'types', type);
        if (foundElementIndexType != -1) {
          datagraphseizures[foundElementIndex].types[foundElementIndexType].count++;
        } else {
          datagraphseizures[foundElementIndex].types.push({ type: type, count: 1 });
        }
      } else {
        datagraphseizures.push({ value: 1, name: splitDate, stringDate: stringDate, types: [{ type: type, count: 1 }] });
      }

    }
    return datagraphseizures;
  }

  add0Seizures(datagraphseizures){
    //var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
    var maxDateTemp = new Date();
    var maxDate = maxDateTemp.toDateString();
    
    var minDate = this.minDateRange.toDateString();
    
    var splitLastDate = datagraphseizures[datagraphseizures.length-1].stringDate;
    var splitFirstDate = datagraphseizures[0].stringDate;
      if(new Date(splitLastDate)<new Date(maxDate)){
        datagraphseizures.push({value: 0,name:maxDate,stringDate:maxDate, types: []})
      }
      if(new Date(minDate)<new Date(splitFirstDate)){
        datagraphseizures.push({value: 0,name:minDate,stringDate:minDate, types: []})
      }
      var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
      datagraphseizures.sort(this.sortService.DateSortInver("stringDate"));
    for (var j = 0; j < datagraphseizures.length; j=j+1) {
      var foundDate = false;
      var actualDate = datagraphseizures[j].stringDate;
      if(datagraphseizures[j+1]!=undefined){
        var nextDate = datagraphseizures[j+1].stringDate;
        //stringDate
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copydatagraphseizures.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
          }else{
            foundDate = true;
          }
          
        }
        if(datagraphseizures[j+2]!=undefined){
        var actualDate = datagraphseizures[j+1].stringDate;
        var nextDate = datagraphseizures[j+2].stringDate;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copydatagraphseizures.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
          }
          
        }
  
        }
      }
    }
    copydatagraphseizures.sort(this.sortService.DateSortInver("stringDate"));
    for (var j = 0; j < copydatagraphseizures.length; j++) {
      copydatagraphseizures[j].name = copydatagraphseizures[j].stringDate
      var theDate = new Date(copydatagraphseizures[j].name);
      copydatagraphseizures[j].name = this.tickFormattingDay(theDate)
    }
    return copydatagraphseizures;
  }

  tickFormattingDay(d: any) {
    if (sessionStorage.getItem('lang') == 'es') {
      this.formatDate = 'es-ES'
    } else {
      this.formatDate = 'en-EN'
    }
    //var options = { year: 'numeric', month: 'short' };
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    var res = d.toLocaleString(this.formatDate, options)
    return res;
  }

  groupPerWeek(seizures){
    
    var respseizures = [];
    for (var i=0; i < seizures.length; i++)
    {
      var varweek = new Date(seizures[i].stringDate)
      if(this.groupBy=='Weeks'){
        seizures[i].name = this.getWeek(varweek, 1);
      }else{
        seizures[i].name = this.getMonthLetter(varweek, 1);
      }
    }
    var copyseizures = JSON.parse(JSON.stringify(seizures));
    for (var i=0; i < copyseizures.length; i++){
      var foundElementIndex = this.searchService.searchIndex(respseizures, 'name', copyseizures[i].name);
      
      if(foundElementIndex!=-1){
        respseizures[foundElementIndex].value = respseizures[foundElementIndex].value+copyseizures[i].value;
        for (var j=0; j < copyseizures[i].types.length; j++){
          var foundElementIndexType = this.searchService.searchIndex(respseizures[foundElementIndex].types, 'types', copyseizures[i].types[j].type);
          if (foundElementIndexType != -1) {
            respseizures[foundElementIndex].types[foundElementIndexType].count++;
          } else {
            respseizures[foundElementIndex].types.push({ type: copyseizures[i].types[j].type, count: 1 });
          }
        }
        
      }else{
        respseizures.push(copyseizures[i]);
      }
    }
    return respseizures;
}

getMonthLetter(newdate, dowOffset?){
  if (this.lang != 'es') {
    return this.meses[newdate.getMonth()].en
  } else {
      return this.meses[newdate.getMonth()].es
  }
}

getWeek(newdate, dowOffset?) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
  
      dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
      var newYear = new Date(newdate.getFullYear(),0,1);
      var day = newYear.getDay() - dowOffset; //the day of week the year begins on
      day = (day >= 0 ? day : day + 7);
      var daynum = Math.floor((newdate.getTime() - newYear.getTime() - 
      (newdate.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
      var weeknum;
      //if the year starts before the middle of a week
      if(day < 4) {
          weeknum = Math.floor((daynum+day-1)/7) + 1;
          if(weeknum > 52) {
              var nYear = new Date(newdate.getFullYear() + 1,0,1);
              var nday = nYear.getDay() - dowOffset;
              nday = nday >= 0 ? nday : nday + 7;
              /*if the next year starts before the middle of
                the week, it is week #1 of that year*/
              weeknum = nday < 4 ? 1 : 53;
          }
      }
      else {
          weeknum = Math.floor((daynum+day-1)/7);
      }
      var formatDate = this.getDateOfISOWeek(weeknum, newYear.getFullYear())
      var pastDate=new Date(formatDate);
      pastDate.setDate(pastDate.getDate() +7);
      var res = this.tickFormattingDay(formatDate)+ ' - ' +this.tickFormattingDay(pastDate);
      return res;
  };

  getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  getMaxValue(array) {
    var max = 0;
    for (var i = 0; i < array.length; i++) {
      if (max < array[i].value) {
        max = array[i].value;
      }
    }
    return max;
  }

  getDrugs() {
    this.loadedDrugs = false;
    this.lineChartDrugs = [];
    this.lineChartDrugsCopy = [];
    this.maxValue = 0;
    this.medications = [];
    var info = { rangeDate: this.rangeDate,  userId: this.authService.getIdUser() }
    this.subscription.add( this.raitoService.getMedicationsPatientV2(this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        //add oldy current drugs
        for (var i = 0; i < res.length; i++) {
          if(res[i].endDate==null){
            this.medications.push(res[i])
          }
        }
        //this.medications = res;
        if (this.medications.length > 0) {
          res.sort(this.sortService.DateSortInver("date"));
          this.searchTranslationDrugs();
          this.groupMedications();
          this.getRecommendedDose(res);
        } else {
          this.finishloadData = true;
        }
        this.loadedDrugs = true;
      }, (err) => {
        console.log(err);
        this.loadedDrugs = true;
      }));


  }

  getRecommendedDose(res2){
    if (this.actualMedications.length > 0) {
    var actualDrugs = '';
    var prevDrugs = '';
    
      for (var i = 0; i < this.actualMedications.length; i++) {
        var found = false;
        if(this.savedRecommendations.length > 0){
          for(var j = 0; j < this.savedRecommendations.length && !found; j++){
            if(this.actualMedications[i].drug.indexOf(this.savedRecommendations[j].name)!=-1){
              this.actualMedications[i].recommendedDose = null;
              this.actualMedications[i].recommendedDose = this.savedRecommendations[j].recommendedDose;
              this.actualMedications[i].units = this.savedRecommendations[j].units;
              found = true;
            }
          }
        }
        if(!found){
          if(actualDrugs == ''){
            actualDrugs = this.actualMedications[i].drug;
          }else{
            actualDrugs = actualDrugs + ', ' + this.actualMedications[i].drug;
          }
        }
        if(prevDrugs == ''){
          prevDrugs = this.actualMedications[i].drug;
        }else{
          prevDrugs = prevDrugs + ', ' + this.actualMedications[i].drug;
        }
      }
      if(prevDrugs != ''){
        var finish = false;
        for(var j = 0; j < this.savedRecommendations.length && !finish; j++){
          if(prevDrugs!= this.savedRecommendations[j].actualDrugs){
            finish = true;
          }
        }
        if(finish){
          actualDrugs = prevDrugs;
        }
      }
      if(actualDrugs != ''){
        var promDrug = 'Drugs: ['+actualDrugs+ ']' ;
      promDrug+= ".\nKeep in mind that the dose of some drugs is affected if you take other drugs.\nDon't give me ranges, give me the maximum recommended for the drugs I give you.\nIndicates if the dose is (mg/kg/day) or (mg/day)\nThe response has to have this format: \ndrug1:5 (mg/day)\ndrug2:12 (mg/kg/day)";
      var value = { value: promDrug, context: ""};
    
      this.subscription.add(this.openAiService.postOpenAi2(value)
                .subscribe((res: any) => {
                  let parseChoices0 = res.choices[0].message.content;
                  const drugsArray = parseChoices0.split("\n");
                  var drugsToSave = [];
                  drugsArray.forEach((drug) => {
                    if(drug==''){
                      return;
                    }
                    const nameAndCommercialName = drug.split(":"); // Separar el nombre de la droga y el nombre comercial
                    if(nameAndCommercialName[0].charAt(nameAndCommercialName[0].length-1) == ' '){
                      nameAndCommercialName[0] = nameAndCommercialName[0].slice(0, -1);
                    }
                    var separate = nameAndCommercialName[1];
                    const split = separate.split("(");
                    var dose = split[0];
                    dose = dose.replace(/\s/g, '');

                    var units = split[1];
                    if(units.charAt(units.length-1) == ')'){
                      units = units.slice(0, -1);
                    }
                    
                    let recommendedDose = Math.round(parseFloat(dose)*parseFloat(this.weight))
                    if(units=='mg/day'){
                      recommendedDose = parseFloat(dose);
                    }
                    const recommendedDose2 = dose;
                    for (var j = 0; j < this.actualMedications.length; j++) {
                      if(this.actualMedications[j].drug.indexOf(nameAndCommercialName[0])!=-1){
                        this.actualMedications[j].recommendedDose = recommendedDose;
                        this.actualMedications[j].units = units;
                        this.actualMedications[j].porcentajeDosis = Math.round((this.actualMedications[j].dose / recommendedDose) * 100);
                        drugsToSave.push({name: this.actualMedications[j].drug, recommendedDose: recommendedDose2, actualDrugs: actualDrugs, units: units});
                      }
                    }
                    
                  });
                  console.log(drugsToSave)
                  console.log(this.actualMedications)
                  if(drugsToSave.length>0){
                    this.saveRecommendations(drugsToSave);
                  }
                  this.continueGetDrugs(res2);
                }, (err) => {
                  console.log(err);
                  this.continueGetDrugs(res2);
                  
              }));
      }else{
        this.continueGetDrugs(res2);
      }
    
    }else{
      this.continueGetDrugs(res2);
    }
    
    
  }

  saveRecommendations(drugsToSave){
    this.subscription.add(this.patientService.saveRecommendations(drugsToSave, this.authService.getCurrentPatient().sub)
    .subscribe((res: any) => {
      console.log(res);
      this.getSavedRecommendations();
    }, (err) => {
      console.log(err);
    }));
  }

  continueGetDrugs(res){
    this.lineChartDrugs = this.getStructure(res);
    this.lineChartDrugs = this.add0Drugs(this.lineChartDrugs);
    this.lineChartDrugsCopy = JSON.parse(JSON.stringify(this.lineChartDrugs));
    
    // Get chartNames
    var chartNames = this.lineChartDrugs.map((d: any) => d.name);
    this.chartNames = [...new Set(chartNames)];
    //this.chartNames = this.lineChartDrugs.map((d: any) => d.name);
    // Convert hex colors to ColorHelper for consumption by legend
    this.colors = new ColorHelper(this.lineChartColorScheme, 'ordinal', this.chartNames, this.lineChartColorScheme);
    this.colors2 = new ColorHelper(this.lineChartOneColorScheme2, 'ordinal', this.chartNames, this.lineChartOneColorScheme2);
      
    //newColor
    var tempColors = JSON.parse(JSON.stringify(this.lineChartColorScheme))
    var tempColors2 = JSON.parse(JSON.stringify(this.lineChartOneColorScheme2))
    tempColors.domain[this.chartNames.length]=tempColors2.domain[0];
    this.colorsLineToll = new ColorHelper(tempColors, 'ordinal', this.chartNames, tempColors);

    this.normalizedChanged(this.normalized);
    if (this.events.length > 0) {
      this.getDataNormalizedDrugsVsSeizures();
    }else{
      this.finishloadData = true;
    }
  }

  searchTranslationDrugs() {
    for (var i = 0; i < this.medications.length; i++) {
      var foundTranslation = false;
      if(this.drugsLang.length == 0){
        this.medications[i].drugTranslate = this.medications[i].drug;
      }else{
        for (var j = 0; j < this.drugsLang.length && !foundTranslation; j++) {
          if (this.drugsLang[j].name == this.medications[i].drug) {
            for (var k = 0; k < this.drugsLang[j].translation.length && !foundTranslation; k++) {
              this.medications[i].drugTranslate = this.drugsLang[j].translation;
              foundTranslation = true;
            }
          }
        }
      }
      
    }
  }

  groupMedications() {
    this.actualMedications = [];
    for (var i = 0; i < this.medications.length; i++) {
      if (!this.medications[i].endDate) {
        this.actualMedications.push(this.medications[i]);
      } else {
        var medicationFound = false;
        if (this.actualMedications.length > 0) {
          for (var j = 0; j < this.actualMedications.length && !medicationFound; j++) {
            if (this.medications[i].drug == this.actualMedications[j].drug) {
              medicationFound = true;
            }
          }
        }

      }
    }
  }

  getStructure(res) {
    var lineChartDrugs = [];
    for (var i = 0; i < res.length; i++) {
      if(res[i].drugTranslate == undefined ){
        res[i].drugTranslate = res[i].drug;
      }
      var foundElementDrugIndex = this.searchService.searchIndex(lineChartDrugs, 'name', res[i].drugTranslate);
      var splitDate = new Date(res[i].startDate);
      if (splitDate < this.minDateRange) {
        splitDate = this.minDateRange
      }

      var splitDateEnd = null;


      if (foundElementDrugIndex != -1) {
        if (this.maxValue < Number(res[i].dose)) {
          this.maxValue = Number(res[i].dose);
        }
        lineChartDrugs[foundElementDrugIndex].series.push({ value: parseInt(res[i].dose), name: splitDate.toDateString() });
        if (res[i].endDate == null) {
          splitDateEnd = new Date();
          lineChartDrugs[foundElementDrugIndex].series.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
        } else {
          splitDateEnd = new Date(res[i].endDate);
          lineChartDrugs[foundElementDrugIndex].series.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
        }
      } else {
        if (this.maxValue < Number(res[i].dose)) {
          this.maxValue = Number(res[i].dose);
        }
        var seriesfirst = [{ value: parseInt(res[i].dose), name: splitDate.toDateString() }];
        if (res[i].endDate == null) {
          splitDateEnd = new Date();
          seriesfirst.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
        } else {
          splitDateEnd = new Date(res[i].endDate);
          seriesfirst.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
        }
        if (res[i].drugTranslate == undefined) {
          lineChartDrugs.push({ name: res[i].drug, series: seriesfirst });
        } else {
          lineChartDrugs.push({ name: res[i].drugTranslate, series: seriesfirst });
        }
      }
    }

    var copymeds = JSON.parse(JSON.stringify(lineChartDrugs));
    for (var i = 0; i < lineChartDrugs.length; i++) {
      lineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      for (var j = 0; j < lineChartDrugs[i].series.length; j = j + 2) {
        var foundDate = false;
        var actualDate = lineChartDrugs[i].series[j].name;
        var nextDate = lineChartDrugs[i].series[j + 1].name;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate() + 1);
          actualDate = theDate.toDateString();
          if (actualDate != nextDate) {
            copymeds[i].series.push({ value: lineChartDrugs[i].series[j].value, name: actualDate })
          }

        }
        if (lineChartDrugs[i].series[j + 2] != undefined) {
          var actualDate = lineChartDrugs[i].series[j + 1].name;
          var nextDate = lineChartDrugs[i].series[j + 2].name;
          for (var k = 0; actualDate != nextDate && actualDate < nextDate && !foundDate; k++) {
            var theDate = new Date(actualDate);
            theDate.setDate(theDate.getDate() + 1);
            actualDate = theDate.toDateString();
            if (actualDate != nextDate) {
              copymeds[i].series.push({ value: 0, name: actualDate })
            }
          }

        } else {
          actualDate = new Date(lineChartDrugs[i].series[j + 1].name);
          nextDate = new Date();
          for (var k = 0; actualDate != nextDate && actualDate < nextDate; k++) {
            var theDate2 = actualDate;
            theDate2.setDate(theDate2.getDate() + 1);
            actualDate = theDate2.toDateString();
            if (actualDate != nextDate && actualDate< nextDate) {
              copymeds[i].series.push({ value: 0, name: actualDate })
            }

          }
        }

      }
      copymeds[i].series.sort(this.sortService.DateSortInver("name"));
    }
    lineChartDrugs = JSON.parse(JSON.stringify(copymeds));
    return lineChartDrugs;
  }

  normalize2(value, min) {
    var max = 0;
    if (this.maxValue > this.maxValueDrugsVsSeizu) {
      max = this.maxValue;
    } else {
      max = this.maxValueDrugsVsSeizu;
    }
    var normalized = 0;
    if (value != 0) {
      normalized = (value - min) / (max - min);
    }
    return normalized;
  }

  add0Drugs(datagraphdrugs) {
    //var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
    var maxDateTemp = new Date();
    var maxDate = maxDateTemp.toDateString();

    var minDate = this.minDateRange.toDateString();
    var copydatagraphseizures = [];
    for (var i = 0; i < datagraphdrugs.length; i++) {
      copydatagraphseizures.push({ name: datagraphdrugs[i].name, series: [] });
      var splitLastDate = datagraphdrugs[i].series[datagraphdrugs[i].series.length - 1].name;
      var splitFirstDate = datagraphdrugs[i].series[0].name;
      if (splitLastDate < maxDate) {
        datagraphdrugs[i].series.push({ value: 0, name: maxDate })
      }
      if (new Date(minDate) < new Date(splitFirstDate)) {
        datagraphdrugs[i].series.push({ value: 0, name: minDate })
      }
      copydatagraphseizures[i].series = JSON.parse(JSON.stringify(datagraphdrugs[i].series));
      datagraphdrugs[i].series.sort(this.sortService.DateSortInver("name"));
      for (var j = 0; j < datagraphdrugs[i].series.length; j = j + 1) {
        var foundDate = false;
        var actualDate = datagraphdrugs[i].series[j].name;
        if (datagraphdrugs[i].series[j + 1] != undefined) {
          var nextDate = datagraphdrugs[i].series[j + 1].name;
          //stringDate
          for (var k = 0; actualDate != nextDate && !foundDate; k++) {
            var theDate = new Date(actualDate);
            theDate.setDate(theDate.getDate() + 1);
            actualDate = theDate.toDateString();
            if (actualDate != nextDate) {
              copydatagraphseizures[i].series.push({ value: 0, name: actualDate })
            } else {
              foundDate = true;
            }

          }
          if (datagraphdrugs[i].series[j + 2] != undefined) {
            var actualDate = datagraphdrugs[i].series[j + 1].name;
            var nextDate = datagraphdrugs[i].series[j + 2].name;
            for (var k = 0; actualDate != nextDate && !foundDate; k++) {
              var theDate = new Date(actualDate);
              theDate.setDate(theDate.getDate() + 1);
              actualDate = theDate.toDateString();
              if (actualDate != nextDate) {
                copydatagraphseizures[i].series.push({ value: 0, name: actualDate })
              }

            }

          }
        }
      }
      copydatagraphseizures[i].series.sort(this.sortService.DateSortInver("name"));
      for (var j = 0; j < copydatagraphseizures[i].series.length; j++) {
        copydatagraphseizures[i].series[j].name = copydatagraphseizures[i].series[j].name
        var theDate = new Date(copydatagraphseizures[i].series[j].name);
        copydatagraphseizures[i].series[j].name = this.tickFormattingDay(theDate)
      }
    }
    return copydatagraphseizures;
  }

  normalizedChanged(normalized) {
    this.normalized = normalized;
    if (this.normalized) {
      this.titleDose = this.titleDrugsVsNormalized;
    } else {
      this.titleDose = this.titleDrugsVsNoNormalized;
    }
    var templineChartDrugs = JSON.parse(JSON.stringify(this.lineChartDrugsCopy));
    this.lineChartDrugs = [];
    var maxValue = 0;
    for (var i = 0; i < this.lineChartDrugsCopy.length; i++) {
      var maxValueRecommededDrug = this.getMaxValueRecommededDrug(this.lineChartDrugsCopy[i].name);
      if (maxValueRecommededDrug == 0) {
        maxValueRecommededDrug = this.maxValue;
      }
      for (var j = 0; j < this.lineChartDrugsCopy[i].series.length; j++) {
        if (this.normalized) {
          templineChartDrugs[i].series[j].value = this.normalize(this.lineChartDrugsCopy[i].series[j].value, 0, maxValueRecommededDrug);
        }
        templineChartDrugs[i].series[j].name = this.lineChartDrugsCopy[i].series[j].name;
        if (maxValue < this.lineChartDrugsCopy[i].series[j].value) {
          maxValue = this.lineChartDrugsCopy[i].series[j].value;
        }
      }
      templineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
    }
    this.lineChartDrugs = JSON.parse(JSON.stringify(templineChartDrugs));
    if (maxValue > 1 && !this.normalized) {
      this.yAxisTicksDrugs = [0, Math.round(maxValue / 2), maxValue];
    } else {
      this.yAxisTicksDrugs = [0, 1];
    }
  }

  getMaxValueRecommededDrug(name){
    var maxDose = 0;
    if( !this.weight){
      return maxDose;
    }else{
      for(var i=0;i<this.actualMedications.length;i++){
        if(this.actualMedications[i].drug==name){
          maxDose = this.actualMedications[i].recommendedDose;
        }
      }
      return maxDose;
    }
  }

  normalize(value, min, max) {
    var normalized = 0;
    if (value != 0) {
      normalized = (value - min) / (max - min);
    }
    return normalized;
  }

  getDataNormalizedDrugsVsSeizures(){
    var meds = this.getStructure(this.medications);
    var seizu = this.getStructure2(this.events);
    seizu = this.add0Seizures(seizu);
    meds = this.add0Drugs(meds);
    var copymeds = JSON.parse(JSON.stringify(meds));
    
    if(this.rangeDate == 'quarter' || this.rangeDate == 'year'){
      //meds = this.groupPerWeekDrugs(meds)
      
    }
    if(this.rangeDate == 'quarter' || this.rangeDate == 'year'){
      seizu = this.add0Seizures(seizu);
      seizu = this.groupPerWeek(seizu);
    }

    this.maxValueDrugsVsSeizu = 0;
    for (var i = 0; i < this.lineChartSeizures[0].series.length; i++) {
      if(this.maxValueDrugsVsSeizu<Number(this.lineChartSeizures[0].series[i].value)){
        this.maxValueDrugsVsSeizu=Number(this.lineChartSeizures[0].series[i].value);
      }
    }
    
    var percen = 0;
    if(this.maxValue>this.maxValueDrugsVsSeizu){
      percen = this.maxValue/this.maxValueDrugsVsSeizu
    }else{
      percen = this.maxValueDrugsVsSeizu/this.maxValue
    }
    

    this.barChart = seizu;
    this.lineChartSeries = copymeds;
    if(this.normalized2){

      var templineChartDrugs = JSON.parse(JSON.stringify(this.lineChartSeries));
      var maxValue = 0;
      for (var i = 0; i < this.lineChartSeries.length; i++) {
        var maxValueRecommededDrug = this.getMaxValueRecommededDrug(this.lineChartSeries[i].name);
        if(maxValueRecommededDrug==0){
          maxValueRecommededDrug = this.maxValue;
        }
        for (var j = 0; j < this.lineChartSeries[i].series.length; j++) {
          /*if(this.normalized){
            templineChartDrugs[i].series[j].value = this.normalize(this.lineChartSeries[i].series[j].value, 0, maxValueRecommededDrug);
          }*/
          templineChartDrugs[i].series[j].value = this.normalize(this.lineChartSeries[i].series[j].value, 0, maxValueRecommededDrug);
          templineChartDrugs[i].series[j].name = this.lineChartSeries[i].series[j].name;
          if(maxValue<this.lineChartSeries[i].series[j].value){
            maxValue= this.lineChartSeries[i].series[j].value;
          }
        }
        templineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      }
      this.lineChartSeries = JSON.parse(JSON.stringify(templineChartDrugs));
    }
    this.finishloadData = true;
  }

  normalizedChanged2(normalized){
    this.normalized2 = normalized;
    if(this.normalized2){
      this.titleDrugsVsDrugs = this.titleDrugsVsNormalized;
    }else{
      this.titleDrugsVsDrugs = this.titleDrugsVsNoNormalized;
    }
     this.getDataNormalizedDrugsVsSeizures();
    
  }

  loadDataRangeDate(rangeDate) {
    this.finishloadData = false;
    this.rangeDate = rangeDate;
    this.calculateMinDate();
    this.normalized = true;
    this.normalized2 = true;
    this.loadPartData();
  }

  changeGroupBy(groupBy) {
    this.groupBy = groupBy;
    this.loadDataRangeDate(this.rangeDate);
  }

  getDocs() {
    this.docs = [];
    this.loadedDocs = false;
    this.subscription.add(this.http.get(environment.api + '/api/documents/' + this.authService.getCurrentPatient().sub)
      .subscribe((resDocs: any) => {
        if (resDocs.message) {
          //no tiene historico de docs
        } else {
          resDocs.sort(this.sortService.DateSortInver("date"));
          this.docs = resDocs;
          for (var i = 0; i < this.docs.length; i++) {
            var extension = this.docs[i].url.substr(this.docs[i].url.lastIndexOf('.'));
            this.docs[i].extension=extension;
          }
          
          this.getAzureBlobSasToken();
        }

        this.loadedDocs = true;
      }, (err) => {
        console.log(err);
        this.loadedDocs = true;
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  loadSymptoms() {
    this.loadedSymptoms = false;
    //cargar el fenotipo del usuario
    var info = { userId: this.authService.getIdUser() }
    this.subscription.add(this.raitoService.getPatientPhenotypesV2(this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        if (res.message) {
          //no tiene fenotipo
          this.loadedSymptoms = true;
        } else {
          if (res.phenotype.data.length > 0) {
            res.phenotype.data.sort(this.sortService.GetSortOrder("name"));
            this.phenotype = res.phenotype;
            this.phenotypeCopy = JSON.parse(JSON.stringify(res.phenotype));
            var hposStrins = [];
            this.phenotype.data.forEach(function (element) {
              hposStrins.push(element.id);
            });
            //get symtoms
            this.callGetInfoTempSymptomsJSON(hposStrins);

            for (var j = 0; j < this.phenotype.data.length; j++) {
              this.phenotype.data[j].checked = true;
            }
            this.phenotypeCopy = JSON.parse(JSON.stringify(res.phenotype));
          } else {
            //no tiene fenotipo
            this.loadedSymptoms = true;
            this.phenotype = res.phenotype;
            this.phenotypeCopy = JSON.parse(JSON.stringify(res.phenotype));
          }
        }
        this.loadedSymptoms = true;
      }, (err) => {
        console.log(err);
        this.loadedSymptoms = true;
      }));
  }

  callGetInfoTempSymptomsJSON(hposStrins) {
    var lang = this.lang;
    this.subscription.add(this.apif29BioService.getInfoOfSymptoms(lang, hposStrins)
      .subscribe((res: any) => {

        var tamano = Object.keys(res).length;
        if (tamano > 0) {
          for (var i in res) {
            for (var j = 0; j < this.phenotype.data.length; j++) {
              if (res[i].id == this.phenotype.data[j].id) {
                this.phenotype.data[j].name = res[i].name;
                this.phenotype.data[j].def = res[i].desc;
                this.phenotype.data[j].synonyms = res[i].synonyms;
                this.phenotype.data[j].comment = res[i].comment;
                if (this.phenotype.data[j].importance == undefined) {
                  this.phenotype.data[j].importance = 1;
                }
              }
            }
          }
          this.phenotype.data.sort(this.sortService.GetSortOrder("name"));
        }
      }, (err) => {
        console.log(err);
      }));
  }

  showMoreInfoSymptomPopup(symptomIndex, contentInfoSymptomNcr) {
    this.selectedInfoSymptomIndex = symptomIndex;
    let ngbModalOptions: NgbModalOptions = {
      keyboard: false,
      windowClass: 'ModalClass-sm'// xl, lg, sm
    };
    this.modalReference = this.modalService.open(contentInfoSymptomNcr, ngbModalOptions);
  }

  closeModal() {
    if (this.modalReference != undefined) {
      this.modalReference.close();
      this.modalReference = undefined;
    }
  }

  getAzureBlobSasToken() {
    this.accessToken.containerName = this.authService.getCurrentPatient().sub.substr(1);
    this.accessToken.patientId = this.authService.getCurrentPatient().sub;

    this.subscription.add(this.apiDx29ServerService.getAzureBlobSasToken(this.accessToken.containerName)
      .subscribe((res: any) => {
        this.accessToken.sasToken = '?' + res;
      }, (err) => {
        console.log(err);
      }));
  }

  openResults(name, contentviewDoc, nameTitle) {
    this.nameTitle = nameTitle;
    var url = name.substr(0, name.lastIndexOf('/') + 1)
    var fileNameNcr = url + 'textanaresult.json';
    var url2 = this.accessToken.blobAccountUrl + this.accessToken.containerName + '/' + fileNameNcr + this.accessToken.sasToken;
    this.subscription.add(this.http.get(this.accessToken.blobAccountUrl + this.accessToken.containerName + '/' + fileNameNcr + this.accessToken.sasToken)
      .subscribe((res: any) => {
        this.resultTextNcr = res.medicalText;
        let ngbModalOptions: NgbModalOptions = {
          keyboard: false,
          windowClass: 'ModalClass-sm'// xl, lg, sm
        };
        this.modalReference = this.modalService.open(contentviewDoc, ngbModalOptions);
      }, (err) => {
        console.log(err);
      }));

  }

  openNotes(notes, contentNotes){
    this.notes = notes;
    let ngbModalOptions: NgbModalOptions = {
      keyboard: false,
      windowClass: 'ModalClass-sm'// xl, lg, sm
    };
    this.modalReference = this.modalService.open(contentNotes, ngbModalOptions);
  }

  goTo(url){
    document.getElementById(url).scrollIntoView(true);
  }

  requestPermission(shareCustom){
    this.resetPermisions();
    this.openModal(shareCustom);
  }

  openModal(modaltemplate){
    let ngbModalOptions: NgbModalOptions = {
          backdrop : 'static',
          keyboard : false,
          windowClass: 'ModalClass-xl'// xl, lg, sm
    };
    this.modalReference = this.modalService.open(modaltemplate, ngbModalOptions);
  }

  closeModalShare() {
    if (this.modalReference != undefined) {
      this.modalReference.close();
      this.modalReference = undefined;
    }
  }

  resetPermisions(){
    var dateNow = new Date();
    var stringDateNow = this.dateService.transformDate(dateNow);
    this.newPermission={
      data:{patientInfo:false, medicalInfo:false,devicesInfo:false, genomicsInfo:false},
      notes:'',
      date: stringDateNow,
      token: ''
    };
  }

  submitInvalidForm() {
    if (!this.sendForm) { return; }
    const base = this.sendForm;
    for (const field in base.form.controls) {
      if (!base.form.controls[field].valid) {
          base.form.controls[field].markAsTouched()
      }
    }
  }

  sendShare(){
    this.sending = true;
    this.newPermission.idUser = this.authService.getIdUser();
    this.subscription.add( this.patientService.requestIndividualShare(this.newPermission)
    .subscribe( (res : any) => {
      this.resetPermisions();
      this.closeModalShare();
      this.sending = false;
      this.getIndividualShare();
     }, (err) => {
       console.log(err);
       this.sending = false;
     }));
  }

  getIndividualShare(){
    this.sending = true;
    this.subscription.add( this.patientService.getIndividualShare(this.authService.getIdUser())
    .subscribe( (res : any) => {
      if(!res.message){
        this.individualPermissions = res.individualShare;
      }
      
      //this.patientPermissions = res;
      this.sending = false;
     }, (err) => {
       console.log(err);
       this.sending = false;
     }));
  }

  cancelCustom(){
    if (this.modalReference != undefined) {
      this.modalReference.close();
      this.modalReference = undefined;
    }
  }

}

export let lineChartSeries = [
];

export let barChart: any = [
];
