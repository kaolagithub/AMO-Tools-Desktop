import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../../settings/settings.service';

@Component({
  selector: 'app-percent-load-estimation',
  templateUrl: './percent-load-estimation.component.html',
  styleUrls: ['./percent-load-estimation.component.css']
})
export class PercentLoadEstimationComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  loadEstimationResult: number;
  percentLoadEstimationForm: FormGroup;
  tabSelect: string = 'results';
  toggleCalculate = false;

  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService) { }

  ngOnInit() {
    if (!this.percentLoadEstimationForm) {
      this.percentLoadEstimationForm = this.formBuilder.group({
        // 'lineFrequency': [50, ],
        'lineFrequency': [60,],
        'measuredSpeed': ['', Validators.required],
        'nameplateFullLoadSpeed': ['', Validators.required],
        'synchronousSpeed': ['',],
        'loadEstimation': ['',]
      });
    }

    if (!this.settings) {
      this.settings = this.settingsService.globalSettings;
    }
    if (this.settingsService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.loadEstimationResult = ((this.percentLoadEstimationForm.controls.synchronousSpeed.value - this.percentLoadEstimationForm.controls.measuredSpeed.value)
      / (this.percentLoadEstimationForm.controls.synchronousSpeed.value - this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value)) * 100;
  }

}
