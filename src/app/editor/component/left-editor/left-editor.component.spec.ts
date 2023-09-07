import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftEditorComponent } from './left-editor.component';

describe('LeftEditorComponent', () => {
  let component: LeftEditorComponent;
  let fixture: ComponentFixture<LeftEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeftEditorComponent]
    });
    fixture = TestBed.createComponent(LeftEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
