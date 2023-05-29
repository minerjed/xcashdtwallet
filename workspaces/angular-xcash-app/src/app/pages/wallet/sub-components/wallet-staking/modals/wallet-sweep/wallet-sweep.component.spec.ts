import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSweepComponent } from './wallet-sweep.component';

describe('WalletSweepComponent', () => {
  let component: WalletSweepComponent;
  let fixture: ComponentFixture<WalletSweepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletSweepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletSweepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
