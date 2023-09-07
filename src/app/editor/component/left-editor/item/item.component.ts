import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CoordinatesComponent } from 'src/app/icon/coordinates.component';
import { CubComponent } from 'src/app/icon/cub.component';
import { ForegroundComponent } from 'src/app/icon/foreground.component';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, AfterViewInit {

  @Input() config: any;
  @Input() isSelected!: boolean;
  @Output() clickEmitter = new EventEmitter<any>()

  @ViewChild('iconContainer', { read: ViewContainerRef, static: true }) iconContainerRef!: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let factory = this.resolver.resolveComponentFactory(CubComponent);
    switch (this.config.icon) {
      case "cub":
        factory = this.resolver.resolveComponentFactory(CubComponent);
        break;
      case "coordinates":
        factory = this.resolver.resolveComponentFactory(CoordinatesComponent);
        break;
      case "foreground":
        factory = this.resolver.resolveComponentFactory(ForegroundComponent);
        break;
      default:
        break;
    }
    this.iconContainerRef && this.iconContainerRef.clear();
    this.iconContainerRef && this.iconContainerRef.createComponent(factory)
  }

  pushButton() {
    this.clickEmitter?.emit(this.config.name)
  }

}
