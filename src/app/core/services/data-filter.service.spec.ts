import { TestBed } from '@angular/core/testing';

import { DataFilterService } from './data-filter.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

describe('DataFilterService', () => {
  let service: DataFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataFilterService]
    });
    service = TestBed.inject(DataFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return weekdays', () => {
    const weekdays = service.getWeekdays();
    expect(weekdays).toEqual(['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte']);
  });

  it('should return months', () => {
    const months = service.getMonths();
    expect(months).toEqual(['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny','Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']);
    
  })
});
