import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAngularSchematicLibComponent } from './custom-angular-schematic-lib.component';

describe('CustomAngularSchematicLibComponent', () => {
  let component: CustomAngularSchematicLibComponent;
  let fixture: ComponentFixture<CustomAngularSchematicLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAngularSchematicLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomAngularSchematicLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
