import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MousePickingService } from '../../service/mouse-picking.service';

@Component({
  selector: 'app-editor-object',
  templateUrl: './editor-object.component.html',
  styleUrls: ['./editor-object.component.scss']
})
export class EditorObjectComponent implements OnInit, AfterViewInit, OnDestroy {
  panelOpenState = false;
  constructor(private mousePickingService: MousePickingService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

}
