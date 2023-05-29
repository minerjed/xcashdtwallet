import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletPrivateKeysComponent } from './wallet-private-keys.component';

describe('WalletPrivateKeysComponent', () => {
  let component: WalletPrivateKeysComponent;
  let fixture: ComponentFixture<WalletPrivateKeysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletPrivateKeysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletPrivateKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
