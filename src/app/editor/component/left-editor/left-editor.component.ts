import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-left-editor',
  templateUrl: './left-editor.component.html',
  styleUrls: ['./left-editor.component.scss']
})
export class LeftEditorComponent implements OnInit, AfterViewInit {

  @Output() isOpenEmitter = new EventEmitter<boolean>()
  items: any = [
    {
      name: "cub",
      icon: "cub",
    },
    {
      name: "coordinates",
      icon: "coordinates"
    },
    {
      name: "foreground",
      icon: "foreground"
    }
  ];
  isOpen: boolean = false;
  itemSelected!: string;
  constructor() {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  itemCallBack(val: any) {
    if (val != this.itemSelected) {
      this.itemSelected = val;
      this.isOpen = true;
    } else {
      this.itemSelected = "";
      this.isOpen = false;
    }
    this.isOpenEmitter.emit(this.isOpen);
  }

}
