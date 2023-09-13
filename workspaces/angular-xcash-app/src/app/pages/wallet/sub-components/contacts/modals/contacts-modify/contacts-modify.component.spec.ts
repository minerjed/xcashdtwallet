import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsModifyComponent } from './contacts-modify.component';

describe('ContactsModifyComponent', () => {
  let component: ContactsModifyComponent;
  let fixture: ComponentFixture<ContactsModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactsModifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
