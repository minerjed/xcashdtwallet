import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDisplayReserveProofComponent } from './wallet-display-reserve-proof.component';

describe('WalletDisplayReserveProofComponent', () => {
  let component: WalletDisplayReserveProofComponent;
  let fixture: ComponentFixture<WalletDisplayReserveProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletDisplayReserveProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletDisplayReserveProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
