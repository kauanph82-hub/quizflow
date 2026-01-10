import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientAuth } from '@/lib/auth';

// Element Types for the Canvas
export type ElementType = 
  | 'welcome'
  | 'video-ask'
  | 'multiple-choice'
  | 'image-selection'
  | 'range-slider'
  | 'text-input'
  | 'lead-form'
  | 'countdown'
  | 'fake-loading'
  | 'result';

export interface QuizOption {
  id: string;
  text: string;
  imageUrl?: string;
  points: number;
  tags?: string[];
  nextElementId?: string; // For conditional branching
}

export interface ElementStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  buttonColor?: string;
  buttonRoundness?: number;
  glassmorphism?: number;
}

export interface QuizElement {
  id: string;
  type: ElementType;
  title: string;
  description?: string;
  options?: QuizOption[];
  // Range slider specific
  min?: number;
  max?: number;
  step?: number;
  // Video specific
  videoUrl?: string;
  // Lead form specific
  fields?: ('name' | 'email' | 'whatsapp')[];
  // Countdown specific
  duration?: number;
  // Fake loading specific
  loadingText?: string;
  pauseAt?: number;
  // Result specific
  resultTitle?: string;
  resultDescription?: string;
  redirectUrl?: string;
  // Common
  required: boolean;
  nextElementId?: string;
  style?: ElementStyle;
  // Tracking
  pixelEvent?: string;
  scoreWeight?: number;
}

export interface ResultRule {
  id: string;
  condition: {
    type: 'score' | 'tags';
    minScore?: number;
    maxScore?: number;
    requiredTags?: string[];
  };
  title: string;
  description: string;
  redirectUrl?: string;
  profile: string;
}

export interface DesignSystem {
  fontFamily: 'inter' | 'geist' | 'system';
  primaryColor: string;
  buttonRoundness: number;
  glassmorphism: number;
  darkMode: boolean;
}

export interface TrackingConfig {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  gtmId?: string;
  webhookUrl?: string;
  events: {
    elementId: string;
    eventName: string;
    eventType: 'ViewContent' | 'Lead' | 'Purchase' | 'Custom';
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  slug: string;
  elements: QuizElement[];
  resultRules: ResultRule[];
  designSystem: DesignSystem;
  tracking: TrackingConfig;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  isPublished: boolean;
  views: number;
  completions: number;
  leadsCount: number;
}

export interface Lead {
  id: string;
  quizId: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  answers: Record<string, string | number>;
  score: number;
  tags: string[];
  profile: string;
  createdAt: string;
  completed: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  dropOffElement?: string;
}

export interface Analytics {
  quizId: string;
  impressions: number;
  completions: number;
  leads: number;
  dropOffs: Record<string, number>;
  dailyData: {
    date: string;
    impressions: number;
    completions: number;
    leads: number;
  }[];
}

export interface ABTest {
  id: string;
  quizId: string;
  variantName: string;
  config: Quiz;
  views: number;
  completions: number;
  conversionRate: number;
  isActive: boolean;
  createdAt: string;
}

interface QuizState {
  // Server-synced data
  quizzes: Quiz[];
  leads: Lead[];
  analytics: Record<string, Analytics>;
  abTests: ABTest[];
  
  // Local UI state
  selectedQuizId: string | null;
  selectedElementId: string | null;
  isDragging: boolean;
  isLoading: boolean;
  
  // Player State (local only)
  currentQuiz: Quiz | null;
  currentElementIndex: number;
  currentAnswers: Record<string, string | number>;
  currentTags: string[];
  currentScore: number;
  
  // API Actions
  fetchQuizzes: () => Promise<void>;
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'completions' | 'leadsCount'>) => Promise<Quiz>;
  updateQuiz: (id: string, updates: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  duplicateQuiz: (id: string) => Promise<Quiz>;
  publishQuiz: (id: string) => Promise<void>;
  unpublishQuiz: (id: string) => Promise<void>;
  
  // Element Actions
  addElement: (quizId: string, element: Omit<QuizElement, 'id'>, index?: number) => Promise<void>;
  updateElement: (quizId: string, elementId: string, updates: Partial<QuizElement>) => Promise<void>;
  deleteElement: (quizId: string, elementId: string) => Promise<void>;
  reorderElements: (quizId: string, fromIndex: number, toIndex: number) => Promise<void>;
  duplicateElement: (quizId: string, elementId: string) => Promise<void>;
  
  // Result Rules
  addResultRule: (quizId: string, rule: Omit<ResultRule, 'id'>) => Promise<void>;
  updateResultRule: (quizId: string, ruleId: string, updates: Partial<ResultRule>) => Promise<void>;
  deleteResultRule: (quizId: string, ruleId: string) => Promise<void>;
  
  // Design System
  updateDesignSystem: (quizId: string, updates: Partial<DesignSystem>) => Promise<void>;
  
  // Tracking
  updateTracking: (quizId: string, updates: Partial<TrackingConfig>) => Promise<void>;
  
  // A/B Testing
  createABTest: (quizId: string, variantName: string, config: Quiz) => Promise<ABTest>;
  updateABTest: (testId: string, updates: Partial<ABTest>) => Promise<void>;
  deleteABTest: (testId: string) => Promise<void>;
  
  // Builder UI State
  setSelectedQuiz: (quizId: string | null) => void;
  setSelectedElement: (elementId: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  
  // Quiz Taking Actions (local only)
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setAnswer: (elementId: string, answer: string | number, tags?: string[]) => void;
  goToElement: (index: number) => void;
  nextElement: () => void;
  prevElement: () => void;
  resetQuiz: () => void;
  calculateFinalResult: () => { score: number; tags: string[]; profile: string; redirect?: string };
  
  // Lead Actions
  saveLead: (leadData: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  fetchLeads: (quizId?: string) => Promise<void>;
  exportLeads: (quizId: string) => Promise<Lead[]>;
  
  // Analytics Actions
  fetchAnalytics: (quizId: string) => Promise<void>;
  trackImpression: (quizId: string) => Promise<void>;
  trackCompletion: (quizId: string) => Promise<void>;
  trackDropOff: (quizId: string, elementId: string) => Promise<void>;
  
  // Utility
  getQuizBySlug: (slug: string) => Quiz | null;
  
  // Legacy compatibility
  questions: QuizElement[];
  currentQuestionIndex: number;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultDesignSystem: DesignSystem = {
  fontFamily: 'inter',
  primaryColor: 'hsl(174, 72%, 56%)',
  buttonRoundness: 12,
  glassmorphism: 60,
  darkMode: true,
};

const defaultTracking: TrackingConfig = {
  events: [],
};

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = ClientAuth.getToken();
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Initial state
      quizzes: [],
      leads: [],
      analytics: {},
      abTests: [],
      selectedQuizId: null,
      selectedElementId: null,
      isDragging: false,
      isLoading: false,
      currentQuiz: null,
      currentElementIndex: 0,
      currentAnswers: {},
      currentTags: [],
      currentScore: 0,
      questions: [],
      currentQuestionIndex: 0,

      // API Actions
      fetchQuizzes: async () => {
        try {
          set({ isLoading: true });
          const data = await apiCall('/quizzes');
          set({ quizzes: data.quizzes });
        } catch (error) {
          console.error('Failed to fetch quizzes:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createQuiz: async (quizData) => {
        try {
          const data = await apiCall('/quizzes', {
            method: 'POST',
            body: JSON.stringify(quizData),
          });
          
          set((state) => ({ 
            quizzes: [...state.quizzes, data.quiz],
            selectedQuizId: data.quiz.id,
          }));
          
          return data.quiz;
        } catch (error) {
          console.error('Failed to create quiz:', error);
          throw error;
        }
      },

      updateQuiz: async (id, updates) => {
        try {
          const data = await apiCall(`/quizzes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
          
          set((state) => ({
            quizzes: state.quizzes.map((q) =>
              q.id === id ? { ...q, ...data.quiz } : q
            ),
          }));
        } catch (error) {
          console.error('Failed to update quiz:', error);
          throw error;
        }
      },

      deleteQuiz: async (id) => {
        try {
          await apiCall(`/quizzes/${id}`, { method: 'DELETE' });
          
          set((state) => ({
            quizzes: state.quizzes.filter((q) => q.id !== id),
            selectedQuizId: state.selectedQuizId === id ? null : state.selectedQuizId,
          }));
        } catch (error) {
          console.error('Failed to delete quiz:', error);
          throw error;
        }
      },

      duplicateQuiz: async (id) => {
        try {
          const data = await apiCall(`/quizzes/${id}/duplicate`, { method: 'POST' });
          
          set((state) => ({ 
            quizzes: [...state.quizzes, data.quiz] 
          }));
          
          return data.quiz;
        } catch (error) {
          console.error('Failed to duplicate quiz:', error);
          throw error;
        }
      },

      publishQuiz: async (id) => {
        try {
          await apiCall(`/quizzes/${id}/publish`, { method: 'POST' });
          
          set((state) => ({
            quizzes: state.quizzes.map((q) =>
              q.id === id ? { ...q, isPublished: true } : q
            ),
          }));
        } catch (error) {
          console.error('Failed to publish quiz:', error);
          throw error;
        }
      },

      unpublishQuiz: async (id) => {
        try {
          await apiCall(`/quizzes/${id}/unpublish`, { method: 'POST' });
          
          set((state) => ({
            quizzes: state.quizzes.map((q) =>
              q.id === id ? { ...q, isPublished: false } : q
            ),
          }));
        } catch (error) {
          console.error('Failed to unpublish quiz:', error);
          throw error;
        }
      },

      // Element Actions (optimistic updates)
      addElement: async (quizId, element, index) => {
        const newElement: QuizElement = { ...element, id: generateId() };
        
        // Optimistic update
        set((state) => ({
          quizzes: state.quizzes.map((q) => {
            if (q.id !== quizId) return q;
            const elements = [...q.elements];
            if (index !== undefined) {
              elements.splice(index, 0, newElement);
            } else {
              elements.push(newElement);
            }
            return { ...q, elements };
          }),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/elements`, {
            method: 'POST',
            body: JSON.stringify({ element: newElement, index }),
          });
        } catch (error) {
          // Revert optimistic update
          set((state) => ({
            quizzes: state.quizzes.map((q) => {
              if (q.id !== quizId) return q;
              return { ...q, elements: q.elements.filter(el => el.id !== newElement.id) };
            }),
          }));
          throw error;
        }
      },

      updateElement: async (quizId, elementId, updates) => {
        // Optimistic update
        const originalQuiz = get().quizzes.find(q => q.id === quizId);
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? {
                  ...q,
                  elements: q.elements.map((el) =>
                    el.id === elementId ? { ...el, ...updates } : el
                  ),
                }
              : q
          ),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/elements/${elementId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        } catch (error) {
          // Revert optimistic update
          if (originalQuiz) {
            set((state) => ({
              quizzes: state.quizzes.map((q) =>
                q.id === quizId ? originalQuiz : q
              ),
            }));
          }
          throw error;
        }
      },

      deleteElement: async (quizId, elementId) => {
        // Optimistic update
        const originalQuiz = get().quizzes.find(q => q.id === quizId);
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? { ...q, elements: q.elements.filter((el) => el.id !== elementId) }
              : q
          ),
          selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
        }));

        try {
          await apiCall(`/quizzes/${quizId}/elements/${elementId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          // Revert optimistic update
          if (originalQuiz) {
            set((state) => ({
              quizzes: state.quizzes.map((q) =>
                q.id === quizId ? originalQuiz : q
              ),
            }));
          }
          throw error;
        }
      },

      reorderElements: async (quizId, fromIndex, toIndex) => {
        // Optimistic update
        const originalQuiz = get().quizzes.find(q => q.id === quizId);
        set((state) => ({
          quizzes: state.quizzes.map((q) => {
            if (q.id !== quizId) return q;
            const elements = [...q.elements];
            const [removed] = elements.splice(fromIndex, 1);
            elements.splice(toIndex, 0, removed);
            return { ...q, elements };
          }),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/elements/reorder`, {
            method: 'POST',
            body: JSON.stringify({ fromIndex, toIndex }),
          });
        } catch (error) {
          // Revert optimistic update
          if (originalQuiz) {
            set((state) => ({
              quizzes: state.quizzes.map((q) =>
                q.id === quizId ? originalQuiz : q
              ),
            }));
          }
          throw error;
        }
      },

      duplicateElement: async (quizId, elementId) => {
        const quiz = get().quizzes.find(q => q.id === quizId);
        if (!quiz) return;
        
        const index = quiz.elements.findIndex((el) => el.id === elementId);
        if (index === -1) return;
        
        const element = quiz.elements[index];
        const newElement = { ...element, id: generateId(), title: `${element.title} (Cópia)` };
        
        await get().addElement(quizId, newElement, index + 1);
      },

      // Result Rules
      addResultRule: async (quizId, rule) => {
        const newRule: ResultRule = { ...rule, id: generateId() };
        
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? { ...q, resultRules: [...q.resultRules, newRule] }
              : q
          ),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/result-rules`, {
            method: 'POST',
            body: JSON.stringify(newRule),
          });
        } catch (error) {
          // Revert optimistic update
          set((state) => ({
            quizzes: state.quizzes.map((q) =>
              q.id === quizId
                ? { ...q, resultRules: q.resultRules.filter(r => r.id !== newRule.id) }
                : q
            ),
          }));
          throw error;
        }
      },

      updateResultRule: async (quizId, ruleId, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? {
                  ...q,
                  resultRules: q.resultRules.map((r) =>
                    r.id === ruleId ? { ...r, ...updates } : r
                  ),
                }
              : q
          ),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/result-rules/${ruleId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Failed to update result rule:', error);
          throw error;
        }
      },

      deleteResultRule: async (quizId, ruleId) => {
        const originalQuiz = get().quizzes.find(q => q.id === quizId);
        
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? { ...q, resultRules: q.resultRules.filter((r) => r.id !== ruleId) }
              : q
          ),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/result-rules/${ruleId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          // Revert optimistic update
          if (originalQuiz) {
            set((state) => ({
              quizzes: state.quizzes.map((q) =>
                q.id === quizId ? originalQuiz : q
              ),
            }));
          }
          throw error;
        }
      },

      updateDesignSystem: async (quizId, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? { ...q, designSystem: { ...q.designSystem, ...updates } }
              : q
          ),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/design`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Failed to update design system:', error);
          throw error;
        }
      },

      updateTracking: async (quizId, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? { ...q, tracking: { ...q.tracking, ...updates } }
              : q
          ),
        }));

        try {
          await apiCall(`/quizzes/${quizId}/tracking`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Failed to update tracking:', error);
          throw error;
        }
      },

      // A/B Testing
      createABTest: async (quizId, variantName, config) => {
        try {
          const data = await apiCall(`/quizzes/${quizId}/ab-tests`, {
            method: 'POST',
            body: JSON.stringify({ variantName, config }),
          });
          
          set((state) => ({ 
            abTests: [...state.abTests, data.test] 
          }));
          
          return data.test;
        } catch (error) {
          console.error('Failed to create A/B test:', error);
          throw error;
        }
      },

      updateABTest: async (testId, updates) => {
        try {
          await apiCall(`/ab-tests/${testId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
          
          set((state) => ({
            abTests: state.abTests.map((test) =>
              test.id === testId ? { ...test, ...updates } : test
            ),
          }));
        } catch (error) {
          console.error('Failed to update A/B test:', error);
          throw error;
        }
      },

      deleteABTest: async (testId) => {
        try {
          await apiCall(`/ab-tests/${testId}`, { method: 'DELETE' });
          
          set((state) => ({
            abTests: state.abTests.filter((test) => test.id !== testId),
          }));
        } catch (error) {
          console.error('Failed to delete A/B test:', error);
          throw error;
        }
      },

      // UI State
      setSelectedQuiz: (quizId) => set({ selectedQuizId: quizId, selectedElementId: null }),
      setSelectedElement: (elementId) => set({ selectedElementId: elementId }),
      setIsDragging: (isDragging) => set({ isDragging }),

      // Quiz Player (local state)
      setCurrentQuiz: (quiz) => {
        set({ 
          currentQuiz: quiz, 
          currentElementIndex: 0, 
          currentAnswers: {}, 
          currentTags: [], 
          currentScore: 0,
          questions: quiz?.elements || [],
          currentQuestionIndex: 0,
        });
      },

      setAnswer: (elementId, answer, tags = []) => {
        const { currentQuiz, currentAnswers, currentTags, currentScore } = get();
        if (!currentQuiz) return;

        const element = currentQuiz.elements.find((el) => el.id === elementId);
        let addedScore = 0;
        
        if (element?.type === 'multiple-choice' || element?.type === 'image-selection') {
          const option = element.options?.find((opt) => opt.id === answer);
          if (option) {
            addedScore = option.points || 0;
          }
        } else if (element?.type === 'range-slider' && typeof answer === 'number') {
          addedScore = answer * (element.scoreWeight || 1);
        }

        set({
          currentAnswers: { ...currentAnswers, [elementId]: answer },
          currentTags: [...new Set([...currentTags, ...tags])],
          currentScore: currentScore + addedScore,
        });
      },

      goToElement: (index) => {
        set({ currentElementIndex: index, currentQuestionIndex: index });
      },

      nextElement: () => {
        const { currentQuiz, currentElementIndex, currentAnswers } = get();
        if (!currentQuiz) return;

        const currentElement = currentQuiz.elements[currentElementIndex];
        const answer = currentAnswers[currentElement.id];

        // Check for conditional branching
        if ((currentElement.type === 'multiple-choice' || currentElement.type === 'image-selection') && currentElement.options) {
          const selectedOption = currentElement.options.find((opt) => opt.id === answer);
          if (selectedOption?.nextElementId) {
            const nextIndex = currentQuiz.elements.findIndex((el) => el.id === selectedOption.nextElementId);
            if (nextIndex !== -1) {
              set({ currentElementIndex: nextIndex, currentQuestionIndex: nextIndex });
              return;
            }
          }
        }

        // Check element-level branching
        if (currentElement.nextElementId) {
          const nextIndex = currentQuiz.elements.findIndex((el) => el.id === currentElement.nextElementId);
          if (nextIndex !== -1) {
            set({ currentElementIndex: nextIndex, currentQuestionIndex: nextIndex });
            return;
          }
        }

        // Default: go to next element
        if (currentElementIndex < currentQuiz.elements.length - 1) {
          set({ currentElementIndex: currentElementIndex + 1, currentQuestionIndex: currentElementIndex + 1 });
        }
      },

      prevElement: () => {
        set((state) => ({
          currentElementIndex: Math.max(0, state.currentElementIndex - 1),
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        }));
      },

      resetQuiz: () => {
        set({ currentAnswers: {}, currentElementIndex: 0, currentTags: [], currentScore: 0, currentQuestionIndex: 0 });
      },

      calculateFinalResult: () => {
        const { currentQuiz, currentScore, currentTags } = get();
        if (!currentQuiz) return { score: 0, tags: [], profile: 'Unknown', redirect: undefined };

        // Find matching result rule
        for (const rule of currentQuiz.resultRules) {
          if (rule.condition.type === 'score') {
            const min = rule.condition.minScore ?? 0;
            const max = rule.condition.maxScore ?? 100;
            if (currentScore >= min && currentScore <= max) {
              return {
                score: currentScore,
                tags: currentTags,
                profile: rule.profile,
                redirect: rule.redirectUrl,
              };
            }
          } else if (rule.condition.type === 'tags') {
            const required = rule.condition.requiredTags || [];
            if (required.every((tag) => currentTags.includes(tag))) {
              return {
                score: currentScore,
                tags: currentTags,
                profile: rule.profile,
                redirect: rule.redirectUrl,
              };
            }
          }
        }

        // Default profile
        return {
          score: currentScore,
          tags: currentTags,
          profile: currentScore >= 70 ? 'Expert' : currentScore >= 40 ? 'Avançado' : 'Iniciante',
          redirect: undefined,
        };
      },

      // Lead Actions
      saveLead: async (leadData) => {
        try {
          await apiCall('/leads', {
            method: 'POST',
            body: JSON.stringify(leadData),
          });
        } catch (error) {
          console.error('Failed to save lead:', error);
          throw error;
        }
      },

      fetchLeads: async (quizId) => {
        try {
          const endpoint = quizId ? `/leads?quizId=${quizId}` : '/leads';
          const data = await apiCall(endpoint);
          set({ leads: data.leads });
        } catch (error) {
          console.error('Failed to fetch leads:', error);
        }
      },

      exportLeads: async (quizId) => {
        try {
          const data = await apiCall(`/leads/export?quizId=${quizId}`);
          return data.leads;
        } catch (error) {
          console.error('Failed to export leads:', error);
          return [];
        }
      },

      // Analytics
      fetchAnalytics: async (quizId) => {
        try {
          const data = await apiCall(`/analytics/${quizId}`);
          set((state) => ({
            analytics: { ...state.analytics, [quizId]: data.analytics },
          }));
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
        }
      },

      trackImpression: async (quizId) => {
        try {
          await apiCall(`/analytics/${quizId}/impression`, { method: 'POST' });
        } catch (error) {
          console.error('Failed to track impression:', error);
        }
      },

      trackCompletion: async (quizId) => {
        try {
          await apiCall(`/analytics/${quizId}/completion`, { method: 'POST' });
        } catch (error) {
          console.error('Failed to track completion:', error);
        }
      },

      trackDropOff: async (quizId, elementId) => {
        try {
          await apiCall(`/analytics/${quizId}/dropoff`, {
            method: 'POST',
            body: JSON.stringify({ elementId }),
          });
        } catch (error) {
          console.error('Failed to track drop-off:', error);
        }
      },

      // Utility
      getQuizBySlug: (slug) => {
        return get().quizzes.find((q) => q.slug === slug && q.isPublished) || null;
      },
    }),
    {
      name: 'xquiz-storage-v3',
      partialize: (state) => ({
        // Only persist UI state and player state
        selectedQuizId: state.selectedQuizId,
        selectedElementId: state.selectedElementId,
        currentQuiz: state.currentQuiz,
        currentElementIndex: state.currentElementIndex,
        currentAnswers: state.currentAnswers,
        currentTags: state.currentTags,
        currentScore: state.currentScore,
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
      }),
    }
  )
);
