import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletStakingComponent } from './wallet-staking.component';

describe('WalletStakingComponent', () => {
  let component: WalletStakingComponent;
  let fixture: ComponentFixture<WalletStakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletStakingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletStakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
