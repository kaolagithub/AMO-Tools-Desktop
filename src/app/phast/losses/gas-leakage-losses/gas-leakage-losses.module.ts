import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GasLeakageLossesComponent } from './gas-leakage-losses.component';
import { GasLeakageLossesFormComponent } from './gas-leakage-losses-form/gas-leakage-losses-form.component';
import { GasLeakageLossesService } from './gas-leakage-losses.service';
import { GasLeakageCompareService } from "./gas-leakage-compare.service";
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [
    GasLeakageLossesComponent,
    GasLeakageLossesFormComponent
  ],
  exports: [
    GasLeakageLossesComponent
  ],
  providers: [
    GasLeakageCompareService,
    GasLeakageLossesService
  ]
})
export class GasLeakageLossesModule { }
