import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSubaddressModComponent } from './wallet-subaddress-mod.component';

describe('WalletSubaddressModComponent', () => {
  let component: WalletSubaddressModComponent;
  let fixture: ComponentFixture<WalletSubaddressModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletSubaddressModComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletSubaddressModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
