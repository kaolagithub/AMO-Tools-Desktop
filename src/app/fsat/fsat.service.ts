import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Fan203Inputs, BaseGasDensity, PlaneData, Plane, Modification, FSAT, FsatInput, FsatOutput } from '../shared/models/fans';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

declare var fanAddon: any;

@Injectable()
export class FsatService {


  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  openNewModal: BehaviorSubject<boolean>;
  openModificationModal: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.initData();
  }


  initData() {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.openNewModal = new BehaviorSubject<boolean>(false);
    this.openModificationModal = new BehaviorSubject<boolean>(false);
  }

  test() {
    console.log(fanAddon);
  }

  fan203(input: Fan203Inputs) {
    input.FanShaftPower.sumSEF = input.PlaneData.inletSEF + input.PlaneData.outletSEF;
    return fanAddon.fan203(input);
  }

  getBaseGasDensityDewPoint(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityDewPoint(inputs);
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityRelativeHumidity(inputs);
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityWetBulb(inputs);
  }

  getVelocityPressureData(inputs: Plane) {
    return fanAddon.getVelocityPressureData(inputs);
  }

  getPlaneResults(input: Fan203Inputs) {
    return fanAddon.getPlaneResults(input);
  }

  fanCurve() {
    return fanAddon.fanCurve();
  }

  //fsat results

  getResults(fsat: FSAT, resultType: string): FsatOutput {
   let input:FsatInput = {
      fanSpeed: fsat.fanSetup.fanSpeed,
      drive: fsat.fanSetup.drive,
      lineFrequency: fsat.fanMotor.lineFrequency,
      motorRatedPower: fsat.fanMotor.motorRatedPower,
      motorRpm: fsat.fanMotor.motorRpm,
      efficiencyClass: fsat.fanMotor.efficiencyClass,
      specifiedEfficiency: fsat.fanMotor.specifiedEfficiency,
      motorRatedVoltage: fsat.fanMotor.motorRatedVoltage,
      fullLoadAmps: fsat.fanMotor.fullLoadAmps,
      sizeMargin: fsat.fanMotor.sizeMargin,
      measuredVoltage: fsat.fieldData.measuredVoltage,
      //???????
      measuredAmps: fsat.fieldData.motorPower,
      flowRate: fsat.fieldData.flowRate,
      inletPressure: fsat.fieldData.inletPressure,
      outletPressure: fsat.fieldData.outletPressure,
      compressibilityFactor: fsat.fieldData.compressibilityFactor,
      operatingFraction: fsat.fieldData.operatingFraction,
      unitCost: fsat.fieldData.cost,
      airDensity: fsat.baseGasDensity.gasDensity,
    };

    if(resultType == 'existing'){
      input.loadEstimationMethod = fsat.fieldData.loadEstimatedMethod;
      input.measuredPower = fsat.fieldData.motorPower;
      return this.fanResultsExisting(input);
    }else if(resultType == 'optimal'){
      input.fanEfficiency = fsat.fanSetup.fanSpecified;
      return this.fanResultsOptimal(input);
    }else if(resultType == 'modified'){
      input.fanType = fsat.fanSetup.fanType
      return this.fanResultsModified(input);
    }
  }


  fanResultsExisting(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsExisting(input);
  }
  fanResultsModified(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsModified(input);
  }
  fanResultsOptimal(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsOptimal(input);
  }

}

