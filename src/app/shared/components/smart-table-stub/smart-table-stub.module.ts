import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartTableStubComponent } from './smart-table-stub.component';

@NgModule({
  declarations: [SmartTableStubComponent],
  exports: [SmartTableStubComponent],
  imports: [CommonModule]
})
export class SmartTableStubModule {}
