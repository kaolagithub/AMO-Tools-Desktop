import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure, BoilerInput } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { HeaderService, HeaderRanges } from './header.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input()
  headerInput: HeaderInput;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderInput>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationExists: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;
  @Input()
  boilerInput: BoilerInput;

  highPressureForm: FormGroup;
  mediumPressureForm: FormGroup;
  lowPressureForm: FormGroup;
  idString: string = 'baseline_';
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = 'modification_';
    }
    if (!this.headerInput) {
      this.headerInput = this.headerService.initHeaderDataObj();
    }
    this.initForms();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected === true) {
        //  this.enableForm();
      } else if (this.selected === false) {
        //  this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.initForms();
    }
  }

  initForms() {
    if (this.headerInput.highPressure) {
      this.highPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressure, this.settings, this.boilerInput);
    }
    else {
      this.highPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.boilerInput);
    }

    if (this.headerInput.mediumPressure) {
      this.mediumPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.mediumPressure, this.settings, this.headerInput.lowPressure.pressure, this.headerInput.highPressure.pressure);
    } else {
      this.mediumPressureForm = this.headerService.initHeaderForm(this.settings);
    }

    if (this.headerInput.lowPressure) {
      let pressureMax: number;
      if (this.headerInput.numberOfHeaders == 3) {
        pressureMax = this.headerInput.mediumPressure.pressure;
      } else {
        pressureMax = this.headerInput.highPressure.pressure;
      }
      this.lowPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.lowPressure, this.settings, undefined, pressureMax);
    } else {
      this.lowPressureForm = this.headerService.initHeaderForm(this.settings);
    }
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  save() {
    this.emitSave.emit(this.headerInput);
    this.updatePressureMaxMins();
  }

  saveHighPressure(header: HeaderWithHighestPressure) {
    this.headerInput.highPressure = header;
    this.save();
  }

  saveMediumPressure(header: HeaderNotHighestPressure) {
    this.headerInput.mediumPressure = header;
    this.save();
  }

  saveLowPressure(header: HeaderNotHighestPressure) {
    this.headerInput.lowPressure = header;
    this.save();
  }


  updatePressureMaxMins() {
    let pressureMax: number;
    if (this.headerInput.numberOfHeaders == 3) {
      pressureMax = this.headerInput.mediumPressure.pressure;
    } else {
      pressureMax = this.headerInput.highPressure.pressure;
    }
    let ranges: HeaderRanges = this.headerService.getRanges(this.settings, undefined, undefined, pressureMax);
    this.lowPressureForm.controls.pressure.setValidators([Validators.required, Validators.max(ranges.pressureMax), Validators.min(ranges.pressureMin)]);
    this.lowPressureForm.controls.pressure.updateValueAndValidity();

    ranges = this.headerService.getRanges(this.settings, undefined, this.headerInput.lowPressure.pressure, this.headerInput.highPressure.pressure);
    this.mediumPressureForm.controls.pressure.setValidators([Validators.required, Validators.max(ranges.pressureMax), Validators.min(ranges.pressureMin)]);
    this.mediumPressureForm.controls.pressure.updateValueAndValidity();
  }
}
