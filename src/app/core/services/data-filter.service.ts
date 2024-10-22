import { Injectable } from '@angular/core';
import { ConcentrationData } from '../models/interface';

@Injectable({
  providedIn: 'root'
})
export class DataFilterService {
  private weekdays: string[] = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
  private months = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ];

  getWeekdays(): string[] {
    return this.weekdays;
  }

  getMonths(): string[] {
    return this.months;
  }

  filterDataByMonthAndWeekday(data: ConcentrationData[]): { [key: string]: { [key: string]: ConcentrationData[] } } {
    const monthlyData: { [key: string]: { [key: string]: ConcentrationData[] } } = {};
    data.forEach(point => {
      const pointDate = new Date(point.date);
      const monthKey = (pointDate.getMonth() + 1).toString().padStart(2, '0');
      const weekday = this.weekdays[pointDate.getDay()];
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      if (!monthlyData[monthKey][weekday]) {
        monthlyData[monthKey][weekday] = [];
      }
      monthlyData[monthKey][weekday].push(point);
    });
    return monthlyData;
  }

  getFilteredData(
    monthlyData: { [key: string]: { [key: string]: ConcentrationData[] } },
    selectedMonth: string,
    selectedWeekday: string,
    allData: ConcentrationData[]
  ): ConcentrationData[] {
    if (selectedMonth && selectedWeekday) {
      return monthlyData[selectedMonth]?.[selectedWeekday] || [];
    } else if (selectedMonth) {
      return Object.values(monthlyData[selectedMonth] || {}).flat();
    } else if (selectedWeekday) {
      return Object.values(monthlyData)
        .flatMap(monthData => monthData[selectedWeekday] || []);
    } else {
      return allData;
    }
  }
}
