import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletIntegratedAddressComponent } from './wallet-integrated-address.component';

describe('WalletIntegratedAddressComponent', () => {
  let component: WalletIntegratedAddressComponent;
  let fixture: ComponentFixture<WalletIntegratedAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletIntegratedAddressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletIntegratedAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
