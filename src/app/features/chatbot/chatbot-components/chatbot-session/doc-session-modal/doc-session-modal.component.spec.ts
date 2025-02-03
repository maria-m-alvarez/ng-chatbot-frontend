import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocSessionModalComponent } from './doc-session-modal.component';

describe('DocSessionModalComponent', () => {
  let component: DocSessionModalComponent;
  let fixture: ComponentFixture<DocSessionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocSessionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocSessionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
