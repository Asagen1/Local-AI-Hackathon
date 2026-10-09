import { storageService } from './mmkv';
import type { Chart } from '@/types';

const STORAGE_KEY = 'PATIENT_CHARTS';

/**
 * Save a new patient chart
 */
export function saveChart(chart: Chart): void {
  const charts = getAllCharts();
  charts.push(chart);
  storageService.setObject(STORAGE_KEY, charts);
}

/**
 * Get all patient charts sorted by creation date (newest first)
 */
export function getAllCharts(): Chart[] {
  const charts = storageService.getObject<Chart[]>(STORAGE_KEY) || [];
  return charts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get a single chart by ID
 */
export function getChartById(id: string): Chart | undefined {
  const charts = getAllCharts();
  return charts.find((chart) => chart.id === id);
}

/**
 * Delete a chart by ID
 */
export function deleteChart(id: string): void {
  const charts = getAllCharts();
  const filtered = charts.filter((chart) => chart.id !== id);
  storageService.setObject(STORAGE_KEY, filtered);
}

/**
 * Update an existing chart
 */
export function updateChart(id: string, updates: Partial<Chart>): void {
  const charts = getAllCharts();
  const index = charts.findIndex((chart) => chart.id === id);
  if (index !== -1) {
    charts[index] = { ...charts[index], ...updates };
    storageService.setObject(STORAGE_KEY, charts);
  }
}

/**
 * Get the latest N charts
 */
export function getLatestCharts(limit: number): Chart[] {
  const charts = getAllCharts();
  return charts.slice(0, limit);
}

/**
 * Search charts by patient name or notes
 */
export function searchCharts(query: string): Chart[] {
  if (!query.trim()) return getAllCharts();
  
  const charts = getAllCharts();
  const lowerQuery = query.toLowerCase();
  
  return charts.filter(
    (chart) =>
      chart.patientName.toLowerCase().includes(lowerQuery) ||
      chart.notes.toLowerCase().includes(lowerQuery)
  );
}
