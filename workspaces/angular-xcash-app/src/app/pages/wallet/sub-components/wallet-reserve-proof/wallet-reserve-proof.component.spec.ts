import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletReserveProofComponent } from './wallet-reserve-proof.component';

describe('WalletReserveProofComponent', () => {
  let component: WalletReserveProofComponent;
  let fixture: ComponentFixture<WalletReserveProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletReserveProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletReserveProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
