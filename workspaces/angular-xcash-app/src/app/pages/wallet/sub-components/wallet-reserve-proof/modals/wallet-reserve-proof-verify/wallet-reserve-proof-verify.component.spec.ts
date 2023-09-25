import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletReserveProofVerifyComponent } from './wallet-reserve-proof-verify.component';

describe('WalletReserveProofVerifyComponent', () => {
  let component: WalletReserveProofVerifyComponent;
  let fixture: ComponentFixture<WalletReserveProofVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletReserveProofVerifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletReserveProofVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
