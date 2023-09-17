import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSubaddressAddComponent } from './wallet-subaddress-add.component';

describe('WalletSubaddressAddComponent', () => {
  let component: WalletSubaddressAddComponent;
  let fixture: ComponentFixture<WalletSubaddressAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletSubaddressAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletSubaddressAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
