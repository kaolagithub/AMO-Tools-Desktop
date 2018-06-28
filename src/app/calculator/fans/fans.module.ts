import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fsat203Module } from './fsat-203/fsat-203.module';
import { FansComponent } from './fans.component';
import { SystemCurveModule } from '../pumps/system-curve/system-curve.module';
import { PumpCurveModule } from '../pumps/pump-curve/pump-curve.module';

@NgModule({
  imports: [
    CommonModule,
    Fsat203Module,
    SystemCurveModule,
    PumpCurveModule
  ],
  declarations: [FansComponent],
  exports: [FansComponent]
})
export class FansModule { }
