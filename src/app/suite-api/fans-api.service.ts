import { Injectable } from '@angular/core';
import { BaseGasDensity, FSAT, FsatInput, FsatOutput, Plane, Fan203Inputs, PlaneResults, Fan203Results, CompressibilityFactor } from '../shared/models/fans';
import { SuiteApiEnumHelperService } from './suite-api-enum-helper.service';
import { FanEfficiencyInputs } from '../calculator/fans/fan-efficiency/fan-efficiency.service';


declare var Module: any;
@Injectable()
export class FansApiService {

  constructor(private suiteApiEnumHelperService: SuiteApiEnumHelperService) { }

  //results
  calculateExisting(input: FsatInput): FsatOutput {
    //enums
    let driveEnum = this.suiteApiEnumHelperService.getDriveEnum(input.drive);
    let lineFrequencyEnum = this.suiteApiEnumHelperService.getLineFrequencyEnum(input.lineFrequency);
    let efficiencyClassEnum = this.suiteApiEnumHelperService.getMotorEfficiencyEnum(input.efficiencyClass);
    let loadEstimationMethodEnum = this.suiteApiEnumHelperService.getLoadEstimationMethod(input.loadEstimationMethod);

    let fanInput = new Module.FanInput(input.fanSpeed, input.airDensity, driveEnum, input.specifiedDriveEfficiency);
    let motor = new Module.Motor(lineFrequencyEnum, input.motorRatedPower, input.motorRpm, efficiencyClassEnum, input.specifiedEfficiency, input.motorRatedVoltage, input.fullLoadAmps, input.sizeMargin);
    let baselineFieldData = new Module.FieldDataBaseline(input.measuredPower, input.measuredVoltage, input.measuredAmps, input.flowRate, input.inletPressure, input.outletPressure, input.compressibilityFactor, loadEstimationMethodEnum);
    let fanResult = new Module.FanResult(fanInput, motor, input.operatingHours, input.unitCost);
    let output: FsatOutput = fanResult.calculateExisting(baselineFieldData);
    output = this.convertOutputPercentages(output);
    fanInput.delete();
    motor.delete();
    baselineFieldData.delete();
    fanResult.delete();
    return output;
  }

  calculateModified(input: FsatInput): FsatOutput {
    //enums
    let driveEnum = this.suiteApiEnumHelperService.getDriveEnum(input.drive);
    let lineFrequencyEnum = this.suiteApiEnumHelperService.getLineFrequencyEnum(input.lineFrequency);
    let efficiencyClassEnum = this.suiteApiEnumHelperService.getMotorEfficiencyEnum(input.efficiencyClass);

    let fanInput = new Module.FanInput(input.fanSpeed, input.airDensity, driveEnum, input.specifiedDriveEfficiency);
    let fanFieldData = new Module.FieldDataModified(input.measuredVoltage, input.measuredAmps, input.flowRate, input.inletPressure, input.outletPressure, input.compressibilityFactor)
    let motor = new Module.Motor(lineFrequencyEnum, input.motorRatedPower, input.motorRpm, efficiencyClassEnum, input.specifiedEfficiency, input.motorRatedVoltage, input.fullLoadAmps, input.sizeMargin);
    let fanResult = new Module.FanResult(fanInput, motor, input.operatingHours, input.unitCost);
    let output: FsatOutput = fanResult.calculateModified(fanFieldData, input.fanEfficiency);
    output = this.convertOutputPercentages(output);
    fanInput.delete();
    fanFieldData.delete();
    motor.delete();
    fanResult.delete();
    return output;
  }


  convertOutputPercentages(output: FsatOutput): FsatOutput {
    //perform conversions for return object
    output.fanEfficiency = output.fanEfficiency * 100;
    output.motorEfficiency = output.motorEfficiency * 100;
    output.motorPowerFactor = output.motorPowerFactor * 100;
    output.driveEfficiency = output.driveEfficiency * 100;
    return output;
  }

  //gas density
  getBaseGasDensityDewPoint(inputs: BaseGasDensity): number {
    let gasType = this.suiteApiEnumHelperService.getGasTypeEnum(inputs.gasType);
    let inputType = this.suiteApiEnumHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: number = 0;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.dewPoint != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined) {
      let dewPointInstance = new Module.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.dewPoint, gasType, inputType, inputs.specificGravity);
      result = dewPointInstance.getGasDensity();
      dewPointInstance.delete();
    }
    return result;
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity): number {
    let gasType = this.suiteApiEnumHelperService.getGasTypeEnum(inputs.gasType);
    let inputType = this.suiteApiEnumHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: number = 0;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.relativeHumidity != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined) {
      let relativeHumidityInstance = new Module.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.relativeHumidity, gasType, inputType, inputs.specificGravity);
      result = relativeHumidityInstance.getGasDensity();
      relativeHumidityInstance.delete();
    }
    return result
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity): number {
    let gasType = this.suiteApiEnumHelperService.getGasTypeEnum(inputs.gasType);
    let inputType = this.suiteApiEnumHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: number = 0;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.wetBulbTemp != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined && inputs.specificHeatGas != undefined) {
      let wetBulbInstance = new Module.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.wetBulbTemp, gasType, inputType, inputs.specificGravity, inputs.specificHeatGas);
      result = wetBulbInstance.getGasDensity();
      wetBulbInstance.delete();
    }
    return result
  }

  getVelocityPressureData(inputs: Plane): { pv3: number, percent75Rule: number } {
    let traversePlaneTraverseData = new Module.DoubleVector2D();
    let doubleVector;
    inputs.traverseData.forEach(dataRow => {
      doubleVector = this.returnDoubleVector(dataRow);
      traversePlaneTraverseData.push_back(doubleVector);
    });
    let traversePlaneInstance = new Module.TraversePlane(inputs.area, inputs.dryBulbTemp, inputs.barometricPressure, inputs.staticPressure, inputs.pitotTubeCoefficient, traversePlaneTraverseData);

    let pv3 = traversePlaneInstance.getPv3Value();
    let percent75Rule = traversePlaneInstance.get75percentRule() * 100; // Convert to percentage
    traversePlaneInstance.delete();
    doubleVector.delete();
    traversePlaneTraverseData.delete();
    return { pv3: pv3, percent75Rule: percent75Rule };
  }


  getPlaneResults(input: Fan203Inputs): PlaneResults {
    //plane data
    let planeDataInstance = this.getPlaneDataInstance(input);
    //BaseGasDensity
    let gasType = this.suiteApiEnumHelperService.getGasTypeEnum(input.BaseGasDensity.gasType);
    let baseGasDensityInstance = new Module.BaseGasDensity(input.BaseGasDensity.dryBulbTemp, input.BaseGasDensity.staticPressure, input.BaseGasDensity.barometricPressure, input.BaseGasDensity.gasDensity, gasType);
    let output: PlaneResults = Module.PlaneDataNodeBindingCalculate(planeDataInstance, baseGasDensityInstance);
    //release memory
    baseGasDensityInstance.delete();
    planeDataInstance.delete();
    return output;
  }

  fan203(input: Fan203Inputs): Fan203Results {
    //FanRatedInfo
    let fanRatedInfoInstance = new Module.FanRatedInfo(input.FanRatedInfo.fanSpeed, input.FanRatedInfo.motorSpeed, input.FanRatedInfo.fanSpeedCorrected, input.FanRatedInfo.densityCorrected, input.FanRatedInfo.pressureBarometricCorrected);
    //BaseGasDensity
    let gasType = this.suiteApiEnumHelperService.getGasTypeEnum(input.BaseGasDensity.gasType);
    let baseGasDensityInstance = new Module.BaseGasDensity(input.BaseGasDensity.dryBulbTemp, input.BaseGasDensity.staticPressure, input.BaseGasDensity.barometricPressure, input.BaseGasDensity.gasDensity, gasType);
    //FanShaftPower
    let fanShaftPowerInstance = new Module.FanShaftPower(input.FanShaftPower.motorShaftPower, input.FanShaftPower.efficiencyMotor, input.FanShaftPower.efficiencyVFD, input.FanShaftPower.efficiencyBelt, input.FanShaftPower.sumSEF);
    //plane data instance
    let planeDataInstance = this.getPlaneDataInstance(input);
    //Calculation procedure
    let fan203Instance = new Module.Fan203(fanRatedInfoInstance, planeDataInstance, baseGasDensityInstance, fanShaftPowerInstance);
    let fan203Output: Fan203Results = fan203Instance.calculate();
    //release memory
    fanShaftPowerInstance.delete();
    baseGasDensityInstance.delete();
    fan203Instance.delete();
    return fan203Output;
  }


  getPlaneDataInstance(input: Fan203Inputs) {
    //FlangePlane
    //FanInletFlange
    let flangePlaneInstance = new Module.FlangePlane(input.PlaneData.FanInletFlange.area, input.PlaneData.FanInletFlange.dryBulbTemp, input.PlaneData.FanInletFlange.barometricPressure);
    //FanEvaseOrOutletFlange
    let flangePlaneInstance2 = new Module.FlangePlane(input.PlaneData.FanEvaseOrOutletFlange.area, input.PlaneData.FanEvaseOrOutletFlange.dryBulbTemp, input.PlaneData.FanEvaseOrOutletFlange.barometricPressure);

    //TraversePlane
    //FlowTraverse
    let traversePlaneTraverseData = new Module.DoubleVector2D();
    let doubleVector;
    input.PlaneData.FlowTraverse.traverseData.forEach(dataRow => {
      doubleVector = this.returnDoubleVector(dataRow);
      traversePlaneTraverseData.push_back(doubleVector);
    });
    let traversePlaneInstance = new Module.TraversePlane(input.PlaneData.FlowTraverse.area, input.PlaneData.FlowTraverse.dryBulbTemp, input.PlaneData.FlowTraverse.barometricPressure, input.PlaneData.FlowTraverse.staticPressure, input.PlaneData.FlowTraverse.pitotTubeCoefficient, traversePlaneTraverseData);
    // Release memory
    doubleVector.delete();
    traversePlaneTraverseData.delete();

    //AddlTraversePlanes
    //traverse_plane_vector
    let addlTraversePlanes = new Module.TraversePlaneVector();
    if (input.FanRatedInfo.traversePlanes > 1) {
      traversePlaneTraverseData = new Module.DoubleVector2D();
      let traversePlane: Plane = input.PlaneData.AddlTraversePlanes[0];

      let doubleVector;
      traversePlane.traverseData.forEach(dataRow => {
        doubleVector = this.returnDoubleVector(dataRow);
        traversePlaneTraverseData.push_back(doubleVector);
      });
      let traversePlaneInstance2 = new Module.TraversePlane(traversePlane.area, traversePlane.dryBulbTemp, traversePlane.barometricPressure, traversePlane.staticPressure, traversePlane.pitotTubeCoefficient, traversePlaneTraverseData);
      addlTraversePlanes.push_back(traversePlaneInstance2);
      traversePlaneInstance2.delete();
      traversePlaneTraverseData.delete();
    }

    //addlTraversePlane2
    if (input.FanRatedInfo.traversePlanes == 3) {
      traversePlaneTraverseData = new Module.DoubleVector2D();
      let traversePlane: Plane = input.PlaneData.AddlTraversePlanes[1];
      let doubleVector;
      traversePlane.traverseData.forEach(dataRow => {
        doubleVector = this.returnDoubleVector(dataRow);
        traversePlaneTraverseData.push_back(doubleVector);
      });
      let traversePlaneInstance3 = new Module.TraversePlane(traversePlane.area, traversePlane.dryBulbTemp, traversePlane.barometricPressure, traversePlane.staticPressure, traversePlane.pitotTubeCoefficient, traversePlaneTraverseData);
      addlTraversePlanes.push_back(traversePlaneInstance3);
      traversePlaneInstance3.delete();
      // Release memory
      doubleVector.delete();
      traversePlaneTraverseData.delete();
    }

    //MstPlane
    //InletMstPlane
    let mstPlaneInstance = new Module.MstPlane(input.PlaneData.InletMstPlane.area, input.PlaneData.InletMstPlane.dryBulbTemp, input.PlaneData.InletMstPlane.barometricPressure, input.PlaneData.InletMstPlane.staticPressure);

    //OutletMstPlane
    let mstPlaneInstance2 = new Module.MstPlane(input.PlaneData.OutletMstPlane.area, input.PlaneData.OutletMstPlane.dryBulbTemp, input.PlaneData.OutletMstPlane.barometricPressure, input.PlaneData.OutletMstPlane.staticPressure);

    //getPlaneData()
    let totalPressureLossBtwnPlanes1and4 = input.PlaneData.totalPressureLossBtwnPlanes1and4;
    let totalPressureLossBtwnPlanes2and5 = input.PlaneData.totalPressureLossBtwnPlanes2and5;
    let plane5upstreamOfPlane2 = input.PlaneData.plane5upstreamOfPlane2;
    let planeDataInstance = new Module.PlaneData(flangePlaneInstance, flangePlaneInstance2, traversePlaneInstance, addlTraversePlanes, mstPlaneInstance, mstPlaneInstance2, totalPressureLossBtwnPlanes1and4, totalPressureLossBtwnPlanes2and5, plane5upstreamOfPlane2);

    // Release memory
    flangePlaneInstance.delete();
    flangePlaneInstance2.delete();
    traversePlaneInstance.delete()
    addlTraversePlanes.delete();
    mstPlaneInstance.delete();
    mstPlaneInstance2.delete();
    return planeDataInstance;
  }

  optimalFanEfficiency(inputs: FanEfficiencyInputs): number {
    let fanType = this.suiteApiEnumHelperService.getFanTypeEnum(inputs.fanType);
    let optimalEfficiencyFactor = new Module.OptimalFanEfficiency(fanType, inputs.fanSpeed, inputs.flowRate, inputs.inletPressure, inputs.outletPressure, inputs.compressibility);
    let optimalEfficiencyFactorResult = optimalEfficiencyFactor.calculate();
    optimalEfficiencyFactorResult = optimalEfficiencyFactorResult * 100;
    optimalEfficiencyFactor.delete();
    return optimalEfficiencyFactorResult;
  }

  compressibilityFactor(inputs: CompressibilityFactor): number {
    let compressibilityFactor = new Module.CompressibilityFactor(inputs.moverShaftPower, inputs.inletPressure, inputs.outletPressure, inputs.barometricPressure, inputs.flowRate, inputs.specificHeatRatio);
    let compressibilityFactorResult = compressibilityFactor.calculate();
    return compressibilityFactorResult;
  }
  //helpers
  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new Module.DoubleVector();
    doublesArray.forEach(x => {
      doubleVector.push_back(x);
    });
    return doubleVector;
  }
}
