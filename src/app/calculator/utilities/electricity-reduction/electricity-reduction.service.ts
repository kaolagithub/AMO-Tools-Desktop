import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ElectricityReductionData, MultimeterReadingData, NameplateData, PowerMeterData, OtherMethodData, ElectricityReductionResults, ElectricityReductionInput } from '../../../shared/models/standalone';
import { StandaloneService } from '../../standalone.service';

@Injectable()
export class ElectricityReductionService {

  baselineData: Array<ElectricityReductionData>;
  modificationData: Array<ElectricityReductionData>;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  resetData(settings: Settings) {
    this.baselineData = new Array<ElectricityReductionData>();
    this.modificationData = new Array<ElectricityReductionData>();
    this.baselineData.push(this.initObject(settings));
  }

  initObject(settings?: Settings): ElectricityReductionData {
    let defaultMultimeterObj: MultimeterReadingData = {
      numberOfPhases: 3,
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: 0.85
    };

    let defaultNameplateObj: NameplateData = {
      ratedMotorPower: settings.powerMeasurement === undefined ? 200 : this.convertUnitsService.value(200).from('hp').to(settings.powerMeasurement),
      variableSpeedMotor: true,
      operationalFrequency: 50,
      lineFrequency: 60,
      motorAndDriveEfficiency: 100,
      loadFactor: 10
    };

    let defaultPowerMeterObj: PowerMeterData = {
      power: 50,
    };

    let defaultOtherMethodData: OtherMethodData = {
      energy: 400000
    };

    let obj: ElectricityReductionData = {
      operatingHours: 0,
      electricityCost: settings && settings.electricityCost ? settings.electricityCost : 0.12,
      measurementMethod: 0,
      multimeterData: defaultMultimeterObj,
      nameplateData: defaultNameplateObj,
      powerMeterData: defaultPowerMeterObj,
      otherMethodData: defaultOtherMethodData,
      units: 1
    };

    return obj;
  }

  getFormFromObj(initObj: ElectricityReductionData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      operatingHours: [initObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      electricityCost: [initObj.electricityCost],
      measurementMethod: [initObj.measurementMethod],

      // multimeter data
      numberOfPhases: [initObj.multimeterData.numberOfPhases],
      supplyVoltage: [initObj.multimeterData.supplyVoltage],
      averageCurrent: [initObj.multimeterData.averageCurrent],
      powerFactor: [initObj.multimeterData.powerFactor],

      // nameplate data
      ratedMotorPower: [initObj.nameplateData.ratedMotorPower],
      variableSpeedMotor: [initObj.nameplateData.variableSpeedMotor],
      operationalFrequency: [initObj.nameplateData.operationalFrequency],
      lineFrequency: [initObj.nameplateData.lineFrequency],
      motorAndDriveEfficiency: [initObj.nameplateData.motorAndDriveEfficiency],
      loadFactor: [initObj.nameplateData.loadFactor],

      // power meter data
      power: [initObj.powerMeterData.power],

      // offsheet / other data
      energy: [initObj.otherMethodData.energy],

      units: [initObj.units]
    });
    switch (form.controls.measurementMethod.value) {
      case 0:
        form.controls.electricityCost.setValidators([Validators.required, Validators.min(0)]);
        form.controls.numberOfPhases.setValidators([Validators.required]);
        form.controls.supplyVoltage.setValidators([Validators.required, Validators.min(0)]);
        form.controls.averageCurrent.setValidators([Validators.required, Validators.min(0)]);
        form.controls.powerFactor.setValidators([Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(1)]);
        form.controls.units.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 1:
        form.controls.electricityCost.setValidators([Validators.required, Validators.min(0)]);
        form.controls.ratedMotorPower.setValidators([Validators.required, Validators.min(0)]);
        form.controls.operationalFrequency.setValidators([Validators.required, Validators.min(0)]);
        form.controls.motorAndDriveEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        form.controls.loadFactor.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        form.controls.units.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 2:
        form.controls.power.setValidators([Validators.required, Validators.min(0)]);
        form.controls.units.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 3:
        form.controls.energy.setValidators([Validators.required, Validators.min(0)]);
        break;
    }
    return form;
  }

  getObjFromForm(form: FormGroup): ElectricityReductionData {
    let multimeterObj: MultimeterReadingData = {
      numberOfPhases: form.controls.numberOfPhases.value,
      supplyVoltage: form.controls.supplyVoltage.value,
      averageCurrent: form.controls.averageCurrent.value,
      powerFactor: form.controls.powerFactor.value
    };

    let nameplateObj: NameplateData = {
      ratedMotorPower: form.controls.ratedMotorPower.value,
      variableSpeedMotor: form.controls.variableSpeedMotor.value,
      operationalFrequency: form.controls.operationalFrequency.value,
      lineFrequency: form.controls.lineFrequency.value,
      motorAndDriveEfficiency: form.controls.motorAndDriveEfficiency.value,
      loadFactor: form.controls.loadFactor.value
    };

    let powerMeterObj: PowerMeterData = {
      power: form.controls.power.value,
    };

    let otherMethodData: OtherMethodData = {
      energy: form.controls.energy.value
    };

    let obj: ElectricityReductionData = {
      operatingHours: form.controls.operatingHours.value,
      electricityCost: form.controls.electricityCost.value,
      measurementMethod: form.controls.measurementMethod.value,
      multimeterData: multimeterObj,
      nameplateData: nameplateObj,
      powerMeterData: powerMeterObj,
      otherMethodData: otherMethodData,
      units: form.controls.units.value
    };

    return obj;
  }

  addBaselineEquipment(settings?: Settings) {
    if (this.baselineData === null || this.baselineData === undefined) {
      this.baselineData = new Array<ElectricityReductionData>();
    }
    this.baselineData.push(this.initObject(settings ? settings : null));
  }

  removeBaselineEquipment(index: number) {
    this.baselineData.splice(index, 1);
  }

  createModification() {
    this.modificationData = new Array<ElectricityReductionData>();
    for (let i = 0; i < this.baselineData.length; i++) {
      this.modificationData.push(this.baselineData[i]);
    }
  }

  addModificationEquipment(settings?: Settings) {
    if (this.modificationData === null || this.modificationData === undefined) {
      this.modificationData = new Array<ElectricityReductionData>();
    }
    this.modificationData.push(this.initObject(settings ? settings : null));
  }

  removeModificationEquipment(index: number) {
    this.modificationData.splice(index, 1);
  }

  initModificationData() {
    if (this.modificationData === undefined || this.modificationData === null) {
      this.modificationData = new Array<ElectricityReductionData>();
    }
  }

  updateBaselineDataArray(baselineForms: Array<FormGroup>): void {
    for (let i = 0; i < this.baselineData.length; i++) {
      this.baselineData[i] = this.getObjFromForm(baselineForms[i]);
    }
  }

  updateModificationDataArray(modificationForms: Array<FormGroup>): void {
    for (let i = 0; i < this.modificationData.length; i++) {
      this.modificationData[i] = this.getObjFromForm(modificationForms[i]);
    }
  }

  calculate(isBaseline: boolean, settings: Settings): ElectricityReductionResults {
    let tmpData = isBaseline ? this.baselineData : this.modificationData;
    tmpData = this.convertInputs(tmpData, settings);

    let inputObj: ElectricityReductionInput = {
      electricityReductionInputVec: tmpData
    };
    let results: ElectricityReductionResults = this.standaloneService.electricityReduction(inputObj);
    return results;
  }

  calculateIndividualEquipment(input: ElectricityReductionData, settings: Settings): ElectricityReductionResults {
    let inputArray: Array<ElectricityReductionData> = [input];
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: ElectricityReductionInput = {
      electricityReductionInputVec: inputArray
    };
    let results: ElectricityReductionResults = this.standaloneService.electricityReduction(inputObj);
    return results;
  }

  convertInputs(inputArray: Array<ElectricityReductionData>, settings: Settings): Array<ElectricityReductionData> {
    //need to loop through for conversions prior to calculation
    for (let i = 0; i < inputArray.length; i++) {
      let tmpNameplateData = {
        ratedMotorPower: this.convertUnitsService.value(inputArray[i].nameplateData.ratedMotorPower).from(settings.powerMeasurement).to('kW'),
        variableSpeedMotor: inputArray[i].nameplateData.variableSpeedMotor,
        operationalFrequency: inputArray[i].nameplateData.operationalFrequency,
        lineFrequency: inputArray[i].nameplateData.lineFrequency,
        motorAndDriveEfficiency: inputArray[i].nameplateData.motorAndDriveEfficiency,
        loadFactor: inputArray[i].nameplateData.loadFactor
      };
      inputArray[i] = {
        operatingHours: inputArray[i].operatingHours,
        electricityCost: inputArray[i].electricityCost,
        measurementMethod: inputArray[i].measurementMethod,
        multimeterData: inputArray[i].multimeterData,
        nameplateData: tmpNameplateData,
        powerMeterData: inputArray[i].powerMeterData,
        otherMethodData: inputArray[i].otherMethodData,
        units: inputArray[i].units
      };
    }
    return inputArray;
  }
}