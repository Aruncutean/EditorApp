import { Component } from '@angular/core';
import { IconInterface } from './icon.terface';

@Component({
    selector: 'foreground-icon',
    template: `<svg
    height="30px"
    width="30px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 59 59"
    xml:space="preserve"
  >
    <g>
      <path
        style="fill: #556080"
        d="M55.19,13H47v30.19c0,2.104-1.706,3.81-3.81,3.81H13v8.19c0,2.104,1.706,3.81,3.81,3.81h38.38
c2.104,0,3.81-1.706,3.81-3.81V16.81C59,14.706,57.294,13,55.19,13z"
      />
      <g>
        <path
          style="fill: #26b99a"
          d="M43.19,47H4.81C2.706,47,1,45.294,1,43.19V4.81C1,2.706,2.706,1,4.81,1h38.38
    C45.294,1,47,2.706,47,4.81v38.38C47,45.294,45.294,47,43.19,47z"
        />
        <path
          style="fill: #26b99a"
          d="M43.19,48H4.81C2.157,48,0,45.842,0,43.19V4.81C0,2.158,2.157,0,4.81,0H43.19
    C45.843,0,48,2.158,48,4.81v38.38C48,45.842,45.843,48,43.19,48z M4.81,2C3.261,2,2,3.261,2,4.81v38.38C2,44.739,3.261,46,4.81,46
    H43.19c1.549,0,2.81-1.261,2.81-2.81V4.81C46,3.261,44.739,2,43.19,2H4.81z"
        />
      </g>
    </g>
  </svg>`

})
export class ForegroundComponent implements IconInterface {

}
