import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatisticViewComponent } from './statistic-view.component';

describe('StatisticViewComponent', () => {
  let component: StatisticViewComponent;
  let fixture: ComponentFixture<StatisticViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
