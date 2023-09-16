import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListObjectComponent } from './list-object.component';

describe('ListObjectComponent', () => {
  let component: ListObjectComponent;
  let fixture: ComponentFixture<ListObjectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListObjectComponent]
    });
    fixture = TestBed.createComponent(ListObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
