import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartInputComponent } from './chart-input.component';

describe('ChartInputComponent', () => {
  let component: ChartInputComponent;
  let fixture: ComponentFixture<ChartInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
