import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletRenameComponent } from './wallet-rename.component';

describe('WalletRenameComponent', () => {
  let component: WalletRenameComponent;
  let fixture: ComponentFixture<WalletRenameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletRenameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletRenameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
