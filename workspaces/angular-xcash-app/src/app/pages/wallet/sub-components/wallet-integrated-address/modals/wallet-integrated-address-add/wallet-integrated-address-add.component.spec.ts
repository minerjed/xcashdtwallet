import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletIntegratedAddressAddComponent } from './wallet-integrated-address-add.component';

describe('WalletIntegratedAddressAddComponent', () => {
  let component: WalletIntegratedAddressAddComponent;
  let fixture: ComponentFixture<WalletIntegratedAddressAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletIntegratedAddressAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletIntegratedAddressAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
