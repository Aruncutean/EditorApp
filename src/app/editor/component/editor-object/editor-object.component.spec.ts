import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorObjectComponent } from './editor-object.component';

describe('EditorObjectComponent', () => {
  let component: EditorObjectComponent;
  let fixture: ComponentFixture<EditorObjectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditorObjectComponent]
    });
    fixture = TestBed.createComponent(EditorObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
