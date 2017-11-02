import { Injectable, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { Losses, ShowResultsCategories, PhastResults } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastResultsService } from '../phast-results.service';
@Injectable()
export class SankeyService {

  baseSize: number = 300;

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService) { }

  getFuelTotals(phast: PHAST, settings: Settings): FuelResults {
    let resultCats: ShowResultsCategories = this.phastResultsService.getResultCategories(settings);
    let phastResults: PhastResults = this.phastResultsService.getResults(phast, settings);
    let results: FuelResults = this.initFuelResults();
    let constant = 1;
    if (settings.energySourceType != 'Electricity') {
      constant = 1000000
    }
    if (phastResults.totalWallLoss) {
      results.totalWallLoss = phastResults.totalWallLoss / constant;
    }
    if (phastResults.totalAtmosphereLoss) {
      results.totalAtmosphereLoss = phastResults.totalAtmosphereLoss / constant;
    }
    if (phastResults.totalOtherLoss) {
      results.totalOtherLoss = phastResults.totalOtherLoss / constant;
    }
    if (phastResults.totalCoolingLoss) {
      results.totalCoolingLoss = phastResults.totalCoolingLoss / constant;
    }
    if (phastResults.totalOpeningLoss) {
      results.totalOpeningLoss = phastResults.totalOpeningLoss / constant;
    }
    if (phastResults.totalFixtureLoss) {
      results.totalFixtureLoss = phastResults.totalFixtureLoss / constant;
    }
    if (phastResults.totalLeakageLoss) {
      results.totalLeakageLoss = phastResults.totalLeakageLoss / constant;
    }
    if (phastResults.totalExtSurfaceLoss) {
      results.totalExtSurfaceLoss = phastResults.totalExtSurfaceLoss / constant;
    }
    if (phastResults.totalChargeMaterialLoss) {
      results.totalChargeMaterialLoss = phastResults.totalChargeMaterialLoss / constant;
    }
    if (resultCats.showFlueGas && phastResults.totalFlueGas) {
      results.totalFlueGas = phastResults.totalFlueGas / constant;
    }
    if (resultCats.showAuxPower && phastResults.totalAuxPower) {
      results.totalAuxPower = phastResults.totalAuxPower / constant;
    }
    if (resultCats.showSlag && phastResults.totalSlag) {
      results.totalSlag = phastResults.totalSlag / constant;
    }
    if (resultCats.showExGas && phastResults.totalExhaustGasEAF) {
      results.totalExhaustGas = phastResults.totalExhaustGasEAF / constant;
    }
    if (resultCats.showEnInput2 && phastResults.totalExhaustGas) {
      results.totalExhaustGas = phastResults.totalExhaustGas / constant;
    }
    if (phastResults.totalSystemLosses && resultCats.showSystemEff) {
      results.totalSystemLosses = phastResults.totalSystemLosses / constant;
    }
    results.totalInput = phastResults.grossHeatInput / constant;
    results.nodes = this.getNodes(results, settings);
    return results;
  }

  getNodes(results: FuelResults, settings: Settings) {
    let unit: string = 'MMBtu/hr';
    if (settings.energySourceType == 'Electricity') {
      unit = 'kW'
    } else if (settings.unitsOfMeasure == 'Metric') {
      unit = 'GJ/hr'
    }

    let tmpNode = this.createNode("Input", results.totalInput, this.baseSize, 300, 200, 0, true, false, false, false, unit, false)
    results.nodes.push(tmpNode);
    tmpNode = this.createNode("inter1", 0, 0, 0, 350, 0, false, false, true, true, unit, false)
    results.nodes.push(tmpNode);
    let interIndex = 2;

    let top: boolean = false;
    // FLUE GAS ARROW
    // one of three
    // Flue Gas
    if (results.totalFlueGas) {
      tmpNode = this.createNode("Flue Gas Losses", results.totalFlueGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, unit, false)
      results.nodes.push(tmpNode);
      interIndex++;
    }
    // Exhaust Gas EAF
    if (results.totalExhaustGas) {
      tmpNode = this.createNode("Exhaust Gas Losses", results.totalExhaustGas, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, unit, false)
      results.nodes.push(tmpNode);
      interIndex++;
    }

    if (results.totalSystemLosses) {
      tmpNode = this.createNode("System Losses", results.totalSystemLosses, 0, 0, 100 + (250 * interIndex), 0, false, false, false, true, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, false, unit, false)
      results.nodes.push(tmpNode);
      interIndex++;
    }
    // end flue gas arrow
    // Atmoshpere
    if (results.totalAtmosphereLoss) {
      tmpNode = this.createNode("Atmosphere Losses", results.totalAtmosphereLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Other
    if (results.totalOtherLoss) {
      tmpNode = this.createNode("Other Losses", results.totalOtherLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Cooling
    if (results.totalCoolingLoss) {
      tmpNode = this.createNode("Water Cooling Losses", results.totalCoolingLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Wall
    if (results.totalWallLoss) {
      tmpNode = this.createNode("Wall Losses", results.totalWallLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Opening
    if (results.totalOpeningLoss) {
      tmpNode = this.createNode("Opening Losses", results.totalOpeningLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Fixture
    if (results.totalFixtureLoss) {
      tmpNode = this.createNode("Fixture/Conveyor Losses", results.totalFixtureLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // Leakage
    if (results.totalLeakageLoss) {
      tmpNode = this.createNode("Leakage Losses", results.totalLeakageLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // External Surface
    if (results.totalExtSurfaceLoss) {
      tmpNode = this.createNode("External Surface \n  Losses", results.totalExtSurfaceLoss, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, true)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // auxiliary power losses
    if (results.totalAuxPower) {
      tmpNode = this.createNode("Auxiliary Power Losses", results.totalAuxPower, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    // slag
    if (results.totalSlag) {
      tmpNode = this.createNode("Slag Losses", results.totalSlag, 0, 0, 100 + (250 * interIndex), 0, false, false, false, top, unit, false)
      results.nodes.push(tmpNode);
      tmpNode = this.createNode("inter" + interIndex, 0, 0, 0, 100 + (250 * interIndex), 0, false, false, true, !top, unit, false);
      results.nodes.push(tmpNode);
      interIndex++;
      top = !top;
    }
    tmpNode = this.createNode("Useful Output", results.totalChargeMaterialLoss, 0, 0, 2400, 0, false, true, false, false, unit, false)
    results.nodes.push(tmpNode);
    return results.nodes;
  }


  createNode(name: string, value: number, displaySize: number, width: number, x: number, y: number, input: boolean, usefulOutput: boolean, inter: boolean, top: boolean, units: string, extSurfaceLoss: boolean): SankeyNode {
    let newNode: SankeyNode = {
      name: name,
      value: value,
      displaySize: displaySize,
      width: width,
      x: x,
      y: y,
      input: input,
      usefulOutput: usefulOutput,
      inter: inter,
      top: top,
      units: units,
      extSurfaceLoss: extSurfaceLoss
    }
    return newNode;
  }


  initFuelResults(): FuelResults {
    let results: FuelResults = {
      totalInput: 0,
      totalChargeMaterialLoss: 0,
      totalWallLoss: 0,
      totalOtherLoss: 0,
      totalOpeningLoss: 0,
      totalLeakageLoss: 0,
      totalFixtureLoss: 0,
      totalExtSurfaceLoss: 0,
      totalCoolingLoss: 0,
      totalAtmosphereLoss: 0,
      totalFlueGas: 0,
      totalSlag: 0,
      totalAuxPower: 0,
      totalEnergyInputEAF: 0,
      totalEnergyInput: 0,
      totalExhaustGas: 0,
      totalSystemLosses: 0,
      nodes: new Array<SankeyNode>()
    }
    return results;
  }
}

export interface FuelResults {
  totalInput: number,
  totalChargeMaterialLoss: number,
  totalWallLoss: number,
  totalOtherLoss: number,
  totalOpeningLoss: number,
  totalLeakageLoss: number,
  totalFixtureLoss: number,
  totalExtSurfaceLoss: number,
  totalCoolingLoss: number,
  totalAtmosphereLoss: number,
  totalFlueGas: number,
  totalSlag: number,
  totalAuxPower: number,
  totalEnergyInputEAF: number,
  totalEnergyInput: number,
  totalExhaustGas: number,
  totalSystemLosses: number,
  nodes: Array<SankeyNode>
}

export interface SankeyNode {
  name: string,
  value: number,
  displaySize: number,
  width: number,
  x: number,
  y: number,
  input: boolean,
  usefulOutput: boolean,
  inter: boolean,
  top: boolean,
  units: string,
  extSurfaceLoss: boolean
}
