import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletChangePasswordComponent } from './wallet-change-password.component';

describe('WalletChangePasswordComponent', () => {
  let component: WalletChangePasswordComponent;
  let fixture: ComponentFixture<WalletChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletChangePasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
