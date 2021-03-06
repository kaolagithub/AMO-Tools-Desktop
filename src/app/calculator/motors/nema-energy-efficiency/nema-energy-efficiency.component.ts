import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { NemaEnergyEfficiencyService, NemaInputs } from './nema-energy-efficiency.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { PsatService } from '../../../psat/psat.service';
import { FSAT } from '../../../shared/models/fans';

@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string;
  nemaForm: FormGroup;
  tabSelect: string = 'results';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;
  tefcValue: number;

  constructor(private settingsDbService: SettingsDbService, private psatService: PsatService, private nemaEnergyEfficiencyService: NemaEnergyEfficiencyService, private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.inAssessment) {
      this.getCalculator();
    } else {
      this.initForm();
    }

    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.nemaInputs) {
        this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromObj(this.calculator.nemaInputs);
      } else {
        if (this.psat) {
          this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromPsat(this.psat);
        } else if (this.fsat) {
          this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromFsat(this.fsat);
        } else {
          this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
        }
        let tmpNemaInputs: NemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
        this.calculator.nemaInputs = tmpNemaInputs;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    if (this.psat) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromPsat(this.psat);
    } else if (this.fsat) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromFsat(this.fsat);
    } else {
      this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
    }
    let tmpNemaInputs: NemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      nemaInputs: tmpNemaInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.nemaEnergyEfficiencyService.nemaInputs) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromObj(this.nemaEnergyEfficiencyService.nemaInputs);
    } else {
      this.nemaForm = this.nemaEnergyEfficiencyService.resetForm();
      if (this.settings.powerMeasurement !== 'hp') {
        if (this.nemaForm.controls.horsePower.value === 200) {
          this.nemaForm.patchValue({
            horsePower: 150
          });
        }
      }
    }

  }

  saveCalculator() {
    if (!this.saving || this.calcExists) {
      if (this.calcExists) {
        this.indexedDbService.putCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.calculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.calculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.calculator.id = result;
            this.calcExists = true;
            this.saving = false;
          });
        });
      }
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  calculate() {
    if (this.nemaForm.valid) {
      // const efficiency = this.psatService.getEfficiencyFromForm(this.nemaForm);
      this.tefcValue = this.psatService.nema(
        this.nemaForm.controls.frequency.value,
        this.nemaForm.controls.motorRPM.value,
        this.nemaForm.controls.efficiencyClass.value,
        this.nemaForm.controls.efficiency.value,
        this.nemaForm.controls.horsePower.value,
        this.settings
      );
    } else {
      this.tefcValue = 0;
    }

    if (!this.psat && !this.inAssessment) {
      this.nemaEnergyEfficiencyService.nemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.nemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
      this.saveCalculator();
    }
  }

  btnResetData() {
    this.nemaForm = this.nemaEnergyEfficiencyService.resetForm();
    if (this.settings.powerMeasurement === 'hp') {
      this.nemaForm.patchValue({
        horsePower: '200'
      });
    } else if (this.settings.unitsOfMeasure === 'Metric' && this.settings.powerMeasurement !== 'hp') {
      this.nemaForm.patchValue({
        horsePower: '150'
      });
    }
    this.calculate();
  }

  btnGenerateExample() {
    this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
    if (this.settings.powerMeasurement === 'hp') {
      this.nemaForm.patchValue({
        horsePower: '200'
      });
    } else if (this.settings.unitsOfMeasure === 'Metric' && this.settings.powerMeasurement !== 'hp') {
      this.nemaForm.patchValue({
        horsePower: '150'
      });
    }
    this.calculate();
  }
}
