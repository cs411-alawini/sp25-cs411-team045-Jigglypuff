import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityMovieBrowserComponent } from './city-movie-browser.component';

describe('CityMovieBrowserComponent', () => {
  let component: CityMovieBrowserComponent;
  let fixture: ComponentFixture<CityMovieBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityMovieBrowserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityMovieBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
