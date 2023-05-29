import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletRevoteComponent } from './wallet-revote.component';

describe('WalletRevoteComponent', () => {
  let component: WalletRevoteComponent;
  let fixture: ComponentFixture<WalletRevoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletRevoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletRevoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
