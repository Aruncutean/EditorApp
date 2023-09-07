import { Component } from '@angular/core';
import { IconInterface } from './icon.terface';

@Component({
    selector: 'cub-icon',
    template: `  <svg
    height="30px"
    width="30px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 58 58"
    xml:space="preserve"
  >
    <g>
      <polygon style="fill: #26b99a" points="29,58 3,45 3,13 29,26 	" />
      <polygon style="fill: #556080" points="29,58 55,45 55,13 29,26 	" />
      <polygon style="fill: #434c6d" points="3,13 28,0 55,13 29,26 	" />
    </g>
  </svg>`

})
export class CubComponent implements IconInterface{

}
