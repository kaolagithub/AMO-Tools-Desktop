import { Component, OnInit } from '@angular/core';
import { BatchAnalysisService } from './batch-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-batch-analysis',
  templateUrl: './batch-analysis.component.html',
  styleUrls: ['./batch-analysis.component.css']
})
export class BatchAnalysisComponent implements OnInit {

  selectedTab: string;
  selectedTabSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
    this.selectedTabSub = this.batchAnalysisService.selectedTab.subscribe(val => {
      this.selectedTab = val;
    })
  }

  ngOnDestroy(){
    this.selectedTabSub.unsubscribe();
  }
}


