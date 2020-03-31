import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeInputsComponent } from './trade-inputs.component';

describe('TradeInputsComponent', () => {
  let component: TradeInputsComponent;
  let fixture: ComponentFixture<TradeInputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
