import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export interface PlanHistoryItem {
  id: string;
  createdAt: string;
  title: string;
  plot: {
    width: number;
    length: number;
    area: number;
    facing: string;
    city: string;
  };
  floorsCount: number;
  estimatedCost: number;
  customWishlist?: string;
  plan: HousePlan;
  formData: WizardFormData;
}

const STORAGE_KEY = 'architect_plan_history';
const MAX_HISTORY_ITEMS = 25;

let memoryStore: PlanHistoryItem[] = [];

function getRawStorage(): string | null {
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage && typeof window.localStorage.getItem === 'function') {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item) return item;
      }
    } catch (_) {}
    try {
      if (window.sessionStorage && typeof window.sessionStorage.getItem === 'function') {
        const item = window.sessionStorage.getItem(STORAGE_KEY);
        if (item) return item;
      }
    } catch (_) {}
  }
  return null;
}

function setRawStorage(value: string): void {
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    } catch (_) {}
    try {
      if (window.sessionStorage && typeof window.sessionStorage.setItem === 'function') {
        window.sessionStorage.setItem(STORAGE_KEY, value);
      }
    } catch (_) {}
  }
}

function clearRawStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage && typeof window.localStorage.removeItem === 'function') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
    try {
      if (window.sessionStorage && typeof window.sessionStorage.removeItem === 'function') {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }
}

export function getPlanHistory(): PlanHistoryItem[] {
  const raw = getRawStorage();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse plan history from localStorage:', e);
    }
  }
  return [...memoryStore];
}

export function getPlanHistoryItem(id: string): PlanHistoryItem | null {
  const history = getPlanHistory();
  return history.find((item) => item.id === id) || null;
}

export function savePlanToHistory(
  projectId: string,
  plan: HousePlan,
  formData: WizardFormData
): void {
  // Always sync to sessionStorage for immediate single-page routing
  if (typeof window !== 'undefined') {
    try {
      if (window.sessionStorage && typeof window.sessionStorage.setItem === 'function') {
        window.sessionStorage.setItem(`plan_${projectId}`, JSON.stringify(plan));
        window.sessionStorage.setItem(`form_${projectId}`, JSON.stringify(formData));
      }
    } catch (e) {
      console.warn('Failed to sync plan to sessionStorage:', e);
    }
  }

  try {
    const history = getPlanHistory();
    const existingIndex = history.findIndex((h) => h.id === projectId);

    const floorsCount = plan?.floors?.length || 1;
    const plotWidth = plan?.plot?.width || formData?.plot?.width || 30;
    const plotLength = plan?.plot?.length || formData?.plot?.length || 50;
    const plotArea = plan?.plot?.area || plotWidth * plotLength;
    const plotFacing = plan?.plot?.facing || formData?.plot?.facing || 'East';
    const city = formData?.plot?.city || 'Ghaziabad';

    const title = `${plotWidth}' × ${plotLength}' ${
      floorsCount === 1 ? 'Ground Floor' : `G+${floorsCount - 1}`
    } ${plan?.facade?.style || 'Architectural'} Plan`;

    const item: PlanHistoryItem = {
      id: projectId,
      createdAt: existingIndex >= 0 ? history[existingIndex].createdAt : new Date().toISOString(),
      title,
      plot: {
        width: plotWidth,
        length: plotLength,
        area: plotArea,
        facing: plotFacing,
        city,
      },
      floorsCount,
      estimatedCost: (plan?.budget as any)?.total ?? (plan?.budget as any)?.totalEstimatedCost ?? 0,
      customWishlist: plan?.customWishlist || formData?.customWishlist || undefined,
      plan,
      formData,
    };

    if (existingIndex >= 0) {
      history[existingIndex] = item;
    } else {
      history.unshift(item); // Most recent first
    }

    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    memoryStore = trimmed;
    setRawStorage(JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save plan history to localStorage:', e);
  }
}

export function deletePlanFromHistory(id: string): void {
  try {
    const history = getPlanHistory().filter((h) => h.id !== id);
    memoryStore = history;
    setRawStorage(JSON.stringify(history));
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(`plan_${id}`);
      window.sessionStorage.removeItem(`form_${id}`);
    }
  } catch (e) {
    console.warn('Failed to delete plan from history:', e);
  }
}

export function clearPlanHistory(): void {
  try {
    memoryStore = [];
    clearRawStorage();
  } catch (e) {
    console.warn('Failed to clear plan history:', e);
  }
}
