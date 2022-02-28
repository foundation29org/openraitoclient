import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ngx-custom-validators';
import { LandPageRoutingModule } from "./land-page-routing.module";
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from "ng-apexcharts";
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComboChartComponent2, ComboSeriesVerticalComponent2 } from './land/combo-chart';


import { LandPageComponent } from "./land/land-page.component";
import { AboutUsPageComponent } from "./about-us/about-us-page.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    exports: [
        TranslateModule,
        MatDatepickerModule,
        MatNativeDateModule 
    ],
    imports: [
        CommonModule,
        LandPageRoutingModule,
        FormsModule,
        TranslateModule,
        CustomFormsModule,
        NgbModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatSelectModule,
        MatRadioModule,
        Ng2SmartTableModule,
        NgApexchartsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NgxChartsModule
    ],
    declarations: [
        LandPageComponent,
        AboutUsPageComponent,
        ComboChartComponent2,
        ComboSeriesVerticalComponent2
    ]
})
export class LandPageModule { }
