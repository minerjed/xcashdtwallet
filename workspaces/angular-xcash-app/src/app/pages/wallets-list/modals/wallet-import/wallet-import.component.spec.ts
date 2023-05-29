import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletImportComponent } from './wallet-import.component';

describe('WalletImportComponent', () => {
  let component: WalletImportComponent;
  let fixture: ComponentFixture<WalletImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
