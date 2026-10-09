import { create } from 'zustand';
import type { Chart } from '@/types';
import * as PatientStorage from '@/services/storage/patients';

interface PatientsState {
  charts: Chart[];
  isLoading: boolean;
  
  // Actions
  loadCharts: () => void;
  addChart: (chart: Chart) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, updates: Partial<Chart>) => void;
  getChart: (id: string) => Chart | undefined;
  getLatestCharts: (limit: number) => Chart[];
  searchCharts: (query: string) => Chart[];
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  charts: [],
  isLoading: false,
  
  loadCharts: () => {
    set({ isLoading: true });
    const charts = PatientStorage.getAllCharts();
    set({ charts, isLoading: false });
  },
  
  addChart: (chart: Chart) => {
    PatientStorage.saveChart(chart);
    const charts = PatientStorage.getAllCharts();
    set({ charts });
  },
  
  removeChart: (id: string) => {
    PatientStorage.deleteChart(id);
    const charts = PatientStorage.getAllCharts();
    set({ charts });
  },
  
  updateChart: (id: string, updates: Partial<Chart>) => {
    PatientStorage.updateChart(id, updates);
    const charts = PatientStorage.getAllCharts();
    set({ charts });
  },
  
  getChart: (id: string) => {
    return get().charts.find((chart) => chart.id === id);
  },
  
  getLatestCharts: (limit: number) => {
    return get().charts.slice(0, limit);
  },
  
  searchCharts: (query: string) => {
    return PatientStorage.searchCharts(query);
  },
}));
