import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-ssmt-diagram-tab',
  templateUrl: './ssmt-diagram-tab.component.html',
  styleUrls: ['./ssmt-diagram-tab.component.css']
})
export class SsmtDiagramTabComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;

  outputData: SSMTOutput;
  inputData: SSMTInputs;
  tabSelect: string = 'results';
  hoveredEquipment: string = 'default';
  selectedTable: string = 'default';

  selectedSSMT: SSMT;
  dataCalculated: boolean = false;
  displayCalculators: boolean = false;
  constructor(private calculateModelService: CalculateModelService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.ssmt.name = 'Baseline';

    if (this.ssmt.setupDone && !this.ssmt.resultsCalculated) {
      setTimeout(() => {
        this.ssmt.outputData = this.calculateModelService.initDataAndRun(this.ssmt, this.settings, true, false).outputData;
        this.ssmt.resultsCalculated = true;
        this.ssmtService.saveSSMT.next(this.ssmt);
        this.selectedSSMT = this.ssmt;
        this.calculateResults();
      }, 100);
    } else {
      this.selectedSSMT = this.ssmt;
      this.calculateResults();
    }
  }

  calculateResults() {
    let resultsData: { inputData: SSMTInputs, outputData: SSMTOutput };
    if (this.selectedSSMT.resultsCalculated) {
      let inputData: SSMTInputs = this.calculateModelService.getInputDataFromSSMT(this.selectedSSMT);
      resultsData = {
        inputData: inputData,
        outputData: this.selectedSSMT.outputData
      };
    } else {
      if (this.selectedSSMT.name == 'Baseline') {
        resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, true, false);
      } else {
        resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, false, false, this.ssmt.outputData.powerGenerationCost);
      }
    }
    this.inputData = resultsData.inputData;
    this.outputData = resultsData.outputData;
    this.dataCalculated = true;
  }

  calculateResultsWithMarginalCosts() {
    let resultsData: { inputData: SSMTInputs, outputData: SSMTOutput };
    if (this.selectedSSMT.name == 'Baseline') {
      resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, true, true);
    } else {
      resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, false, true, this.ssmt.outputData.powerGenerationCost);
    }
    this.inputData = resultsData.inputData;
    this.outputData = resultsData.outputData;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setHover(str: string) {
    this.hoveredEquipment = str;
  }

  selectTable(str: string) {
    this.selectedTable = str;
  }
}