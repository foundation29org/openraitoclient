import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { LandPageRoutingModule } from "./land-page-routing.module";
import { SmartTableStubModule } from 'app/shared/components/smart-table-stub/smart-table-stub.module';
import { TranslateModule } from '@ngx-translate/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComboChartComponent, ComboSeriesVerticalComponent } from './land/combo-chart';


import { LandPageComponent } from "./land/land-page.component";
import { AboutUsPageComponent } from "./about-us/about-us-page.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
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
        SmartTableStubModule,
        NgbModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatSelectModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NgxChartsModule
    ],
    declarations: [
        LandPageComponent,
        AboutUsPageComponent,
        ComboChartComponent,
        ComboSeriesVerticalComponent
    ]
})
export class LandPageModule { }
