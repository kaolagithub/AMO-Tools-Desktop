import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderOutputObj, SteamPropertiesOutput, FlashTankOutput, DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-return-condensate-header',
  templateUrl: './return-condensate-header.component.html',
  styleUrls: ['./return-condensate-header.component.css']
})
export class ReturnCondensateHeaderComponent implements OnInit {
  @Input()
  makeupWaterAndCondensateHeader: HeaderOutputObj;
  @Input()
  returnCondensate: SteamPropertiesOutput;
  @Input()
  condensateFlashTank: FlashTankOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  settings: Settings;
  
  condensateMassFlow: number;
  condensateClasses: Array<string>;
  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(){
    this.setCondensateMassFlow();
    this.setClasses();
  }

  setCondensateMassFlow(){
    if (this.condensateFlashTank) {
      this.condensateMassFlow = this.condensateFlashTank.outletLiquidMassFlow;
    }else {
      this.condensateMassFlow = this.returnCondensate.massFlow;
    }
  }
  
  setClasses(){
    this.condensateClasses = ['makeup-water'];
    if(this.condensateMassFlow < 1e-3){
      this.condensateClasses =  ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

}
