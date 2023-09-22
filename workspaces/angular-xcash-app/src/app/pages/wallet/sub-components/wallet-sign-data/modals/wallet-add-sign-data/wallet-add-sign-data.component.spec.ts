import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAddSignDataComponent } from './wallet-add-sign-data.component';

describe('WalletAddSignDataComponent', () => {
  let component: WalletAddSignDataComponent;
  let fixture: ComponentFixture<WalletAddSignDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletAddSignDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletAddSignDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
