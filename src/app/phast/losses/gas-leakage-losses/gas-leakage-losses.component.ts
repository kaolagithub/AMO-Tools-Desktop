import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { GasLeakageLossesService } from './gas-leakage-losses.service';
import { GasLeakageCompareService } from './gas-leakage-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms/src/model';

@Component({
  selector: 'app-gas-leakage-losses',
  templateUrl: './gas-leakage-losses.component.html',
  styleUrls: ['./gas-leakage-losses.component.css']
})
export class GasLeakageLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  addLossToggle: boolean;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;
  @Input()
  isLossesSetup: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modExists: boolean;

  _leakageLosses: Array<GasLeakageObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  resultsUnit: string;
  showError: boolean = false;
  constructor(private gasLeakageLossesService: GasLeakageLossesService, private phastService: PhastService, private gasLeakageCompareService: GasLeakageCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      }
    }
    else {
      this.firstChange = false;
    }
  }
  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this._leakageLosses) {
      this._leakageLosses = new Array<any>();
    }
    if (this.losses.leakageLosses) {
      this.setCompareVals();
      this.gasLeakageCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.leakageLosses.forEach(loss => {
        let tmpLoss = {
          form: this.gasLeakageLossesService.initFormFromLoss(loss),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
        if(!tmpLoss.form.controls.name.value){
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._leakageLosses.push(tmpLoss);
      })
    }
    if(this.inSetup && this.modExists){
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      this.gasLeakageCompareService.baselineLeakageLoss = null;
    } else {
      this.gasLeakageCompareService.modifiedLeakageLoss = null;
    }
  }

  disableForms(){
    this._leakageLosses.forEach(loss => {
      loss.form.disable();
    })
  }
  
  addLoss() {
    this._leakageLosses.push({
      form: this.gasLeakageLossesService.initForm(this._leakageLosses.length+1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }
  
  collapseLoss(loss: GasLeakageObj){
    loss.collapse = !loss.collapse;
  }

  setError(bool: boolean){
    this.showError = bool;
  }

  removeLoss(lossIndex: number) {
    this._leakageLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  calculate(loss: GasLeakageObj) {
    if (loss.form.status == 'VALID') {
      let tmpLeakageLoss = this.gasLeakageLossesService.initLossFromForm(loss.form);
      loss.heatLoss = this.phastService.leakageLosses(tmpLeakageLoss, this.settings);
    }
    else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpLeakageLosses = new Array<LeakageLoss>();
    let lossIndex = 1;
    this._leakageLosses.forEach(loss => {
      if(!loss.form.controls.name.value){
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpLeakageLoss = this.gasLeakageLossesService.initLossFromForm(loss.form);
      tmpLeakageLoss.heatLoss = loss.heatLoss;
      tmpLeakageLosses.push(tmpLeakageLoss);
    })
    this.losses.leakageLosses = tmpLeakageLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }
  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.gasLeakageCompareService.baselineLeakageLoss = this.losses.leakageLosses;
    } else {
      this.gasLeakageCompareService.modifiedLeakageLoss = this.losses.leakageLosses;
    }
    if (this.gasLeakageCompareService.differentArray && !this.isBaseline) {
      if (this.gasLeakageCompareService.differentArray.length != 0) {
        this.gasLeakageCompareService.checkLeakageLosses();
      }
    }
  }
}

export interface GasLeakageObj {
  form: FormGroup,
  heatLoss: number,
  collapse: boolean
}