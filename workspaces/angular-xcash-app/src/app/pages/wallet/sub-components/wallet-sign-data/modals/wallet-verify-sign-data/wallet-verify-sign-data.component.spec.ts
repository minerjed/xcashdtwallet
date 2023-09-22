import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletVerifySignDataComponent } from './wallet-verify-sign-data.component';

describe('WalletVerifySignDataComponent', () => {
  let component: WalletVerifySignDataComponent;
  let fixture: ComponentFixture<WalletVerifySignDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletVerifySignDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletVerifySignDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
