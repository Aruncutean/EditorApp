import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MeshType } from 'src/app/editor/interface/MeshInterface';
import { SceneService } from 'src/app/editor/service/scene.service';

@Component({
  selector: 'app-header-tabs',
  templateUrl: './header-tabs.component.html',
  styleUrls: ['./header-tabs.component.scss']
})
export class HeaderTabsComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() tabSelected: EventEmitter<any> = new EventEmitter();

  @ViewChild('tabsBox', { static: true }) tabsBox!: ElementRef;
  @ViewChild('iconRight', { static: true }) iconRight!: ElementRef;
  @ViewChild('iconLeft', { static: true }) iconLeft!: ElementRef;

  tabs: {
    active: boolean
    name: string
  }[] = [];



  constructor(private dataScene: SceneService) {
  }

  ngOnInit(): void {

    this.dataScene.data$.forEach(_ => {
      // if (_.meshSelected) {
      //   switch (_.meshSelected.type) {
      //     case MeshType.Object:
      //       this.tabs = [{ active: true, name: "Object" },
      //       { active: false, name: "Material" },
      //       { active: false, name: "Modifiers" }
      //       ];

      //       break;
      //     case MeshType.Light:
      //       this.tabs = [{ active: true, name: "Object" },
      //       { active: false, name: "Light" },
      //       { active: false, name: "Material" },
      //       { active: false, name: "Modifiers" }
      //       ];

      //       break;
      //     default:
      //       break
      //   }
      // }
    })
    this.tabs = [{ active: true, name: "Object" },
    { active: false, name: "Light" },
    { active: false, name: "Material" },
    { active: false, name: "Modifiers" },
    { active: false, name: "ShadowMapping" }
    ];

  }

  
  ngAfterViewInit(): void {
  
  }


  onTabClick(tab: any) {
    this.tabs.forEach(t => t.active = false);
    tab.active = true;
    this.tabSelected.emit(tab.name);
  }

  scrollTabs(direction: string) {
    if (!this.tabsBox) return;
    const scrollAmount = direction === 'left' ? -240 : 240;
    this.tabsBox.nativeElement.scrollLeft += scrollAmount;
    this.handleIcons(this.tabsBox.nativeElement.scrollLeft);
  }

  handleIcons(scrollVal: number) {
    if (!this.tabsBox) return;
    const maxScrollableWidth = this.tabsBox.nativeElement.scrollWidth - this.tabsBox.nativeElement.clientWidth;
    this.iconLeft.nativeElement.style.display = scrollVal <= 0 ? 'none' : 'flex';
    this.iconRight.nativeElement.style.display = maxScrollableWidth - scrollVal <= 1 ? 'none' : 'flex';

  }

  ngOnDestroy(): void {
  }

}
