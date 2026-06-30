import { create } from 'zustand';

const initialFormData = {
  employeeId: '',
  templateId: '',
  period: '',
  evaluatedAt: new Date().toISOString().slice(0, 10),
  answers: {},
  categoryComments: {},
  finalFeedback: {
    strengths: '',
    improvements: '',
    recommendations: '',
  },
};

export const useEvaluationWizardStore = create((set) => ({
  evaluationId: null,
  currentStep: 0,
  template: null,
  formData: initialFormData,
  setStep: (currentStep) => set({ currentStep }),
  setEvaluationId: (evaluationId) => set({ evaluationId }),
  setTemplate: (template) => set({ template }),
  updateFormData: (updates) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...updates,
      },
    })),
  setAnswer: (questionId, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        answers: {
          ...state.formData.answers,
          [questionId]: {
            ...state.formData.answers[questionId],
            ...data,
          },
        },
      },
    })),
  setCategoryComment: (categoryId, comment) =>
    set((state) => ({
      formData: {
        ...state.formData,
        categoryComments: {
          ...state.formData.categoryComments,
          [categoryId]: comment,
        },
      },
    })),
  setFinalFeedback: (field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        finalFeedback: {
          ...state.formData.finalFeedback,
          [field]: value,
        },
      },
    })),
  loadEvaluation: (evaluation) => {
    const answers = {};
    evaluation.answers.forEach((answer) => {
      answers[answer.questionId] = {
        score: answer.score,
        comment: answer.comment || '',
      };
    });

    const categoryComments = {};
    evaluation.categoryComments.forEach((comment) => {
      categoryComments[comment.categoryId] = comment.comment;
    });

    set({
      evaluationId: evaluation.id,
      currentStep: 0,
      template: evaluation.template,
      formData: {
        employeeId: evaluation.employeeId,
        templateId: evaluation.templateId,
        period: evaluation.period,
        evaluatedAt: evaluation.evaluatedAt.slice(0, 10),
        answers,
        categoryComments,
        finalFeedback: evaluation.finalFeedback || initialFormData.finalFeedback,
      },
    });
  },
  reset: () =>
    set({
      evaluationId: null,
      currentStep: 0,
      template: null,
      formData: initialFormData,
    }),
}));
