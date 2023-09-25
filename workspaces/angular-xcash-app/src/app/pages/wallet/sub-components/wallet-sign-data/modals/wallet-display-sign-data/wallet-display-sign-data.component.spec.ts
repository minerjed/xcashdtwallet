import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDisplaySignDataComponent } from './wallet-display-sign-data.component';

describe('WalletDisplaySignDataComponent', () => {
  let component: WalletDisplaySignDataComponent;
  let fixture: ComponentFixture<WalletDisplaySignDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletDisplaySignDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletDisplaySignDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
