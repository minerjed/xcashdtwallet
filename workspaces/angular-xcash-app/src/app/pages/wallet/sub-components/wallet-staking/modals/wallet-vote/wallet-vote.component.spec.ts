import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletVoteComponent } from './wallet-vote.component';

describe('WalletVoteComponent', () => {
  let component: WalletVoteComponent;
  let fixture: ComponentFixture<WalletVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletVoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
