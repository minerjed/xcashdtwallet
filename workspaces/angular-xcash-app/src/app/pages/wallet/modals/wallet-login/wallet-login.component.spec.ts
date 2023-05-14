import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletLoginComponent } from './wallet-login.component';

describe('WalletLoginComponent', () => {
  let component: WalletLoginComponent;
  let fixture: ComponentFixture<WalletLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
