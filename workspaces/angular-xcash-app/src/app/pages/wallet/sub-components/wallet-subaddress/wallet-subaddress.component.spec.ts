import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSubaddressComponent } from './wallet-subaddress.component';

describe('WalletSubaddressComponent', () => {
  let component: WalletSubaddressComponent;
  let fixture: ComponentFixture<WalletSubaddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletSubaddressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletSubaddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
