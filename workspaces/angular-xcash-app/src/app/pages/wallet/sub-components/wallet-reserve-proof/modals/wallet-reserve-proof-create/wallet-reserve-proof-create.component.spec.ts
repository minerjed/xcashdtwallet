import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletReserveProofCreateComponent } from './wallet-reserve-proof-create.component';

describe('WalletReserveProofCreateComponent', () => {
  let component: WalletReserveProofCreateComponent;
  let fixture: ComponentFixture<WalletReserveProofCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletReserveProofCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletReserveProofCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
