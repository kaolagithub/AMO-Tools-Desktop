import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-electricity-reduction-help',
  templateUrl: './electricity-reduction-help.component.html',
  styleUrls: ['./electricity-reduction-help.component.css']
})
export class ElectricityReductionHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
