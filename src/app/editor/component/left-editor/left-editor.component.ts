import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-left-editor',
  templateUrl: './left-editor.component.html',
  styleUrls: ['./left-editor.component.scss']
})
export class LeftEditorComponent implements OnInit, AfterViewInit {

  items: any = [{
    name: "cub",
    icon: "cub",
  }, {
    name: "coordinates",
    icon: "coordinates"
  }, {
    name: "foreground",
    icon: "foreground"
  }];

  constructor() {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  itemCallBack(val: any) {
    let t = val;
  }

}
