import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CategoryStep from '@/components/evaluations/steps/CategoryStep';
import FeedbackStep from '@/components/evaluations/steps/FeedbackStep';
import SetupStep from '@/components/evaluations/steps/SetupStep';
import SummaryStep from '@/components/evaluations/steps/SummaryStep';
import WizardProgress from '@/components/evaluations/WizardProgress';
import PageHeader from '@/components/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useEvaluationMutations } from '@/hooks/useEvaluationMutations';
import { useEvaluation, useTemplate, useTemplates } from '@/hooks/useEvaluations';
import { useEmployees } from '@/hooks/useEmployees';
import { useEvaluationWizardStore } from '@/store/evaluationWizardStore';
import {
  calculateEvaluationSummary,
  mapAnswersObjectToList,
  mapCategoryCommentsObjectToList,
} from '@/utils/evaluationCalculator';

function buildPayload(formData) {
  return {
    period: formData.period,
    evaluatedAt: formData.evaluatedAt,
    answers: mapAnswersObjectToList(formData.answers),
    categoryComments: mapCategoryCommentsObjectToList(
      formData.categoryComments,
    ),
    finalFeedback: formData.finalFeedback,
  };
}

export default function EvaluationWizardPage({ mode: modeProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const mode =
    modeProp ||
    (location.pathname.startsWith('/autoavaliacao') ? 'self' : 'manager');
  const isSelfMode = mode === 'self';

  const user = useAuthStore((state) => state.user);
  const [stepError, setStepError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    evaluationId,
    currentStep,
    template,
    formData,
    setStep,
    setEvaluationId,
    setTemplate,
    updateFormData,
    setAnswer,
    setCategoryComment,
    setFinalFeedback,
    loadEvaluation,
    reset,
  } = useEvaluationWizardStore();

  const { data: existingEvaluation, isLoading: isLoadingEvaluation } =
    useEvaluation(id, isEditing);
  const { data: templates = [] } = useTemplates();
  const { data: employeesData } = useEmployees({
    page: 1,
    limit: 100,
    search: '',
    department: '',
    active: 'true',
  });
  const { data: selectedTemplate } = useTemplate(
    formData.templateId,
    Boolean(formData.templateId) && !template,
  );

  const employees = employeesData?.data ?? [];
  const selectedEmployee =
    employees.find((employee) => employee.id === formData.employeeId) ||
    existingEvaluation?.employee;

  const listPath = isSelfMode ? '/avaliacoes' : '/avaliacoes';

  useEffect(() => {
    if (isEditing && existingEvaluation) {
      if (isSelfMode && !existingEvaluation.isAutoEvaluation) {
        setStepError('Esta avaliação não é uma autoavaliação.');
        return;
      }

      loadEvaluation(existingEvaluation);
    }
  }, [isEditing, existingEvaluation, loadEvaluation, isSelfMode]);

  useEffect(() => {
    if (!isEditing) {
      reset();
    }
  }, [isEditing, reset]);

  useEffect(() => () => reset(), [reset]);

  useEffect(() => {
    if (!isSelfMode || isEditing || formData.employeeId) {
      return;
    }

    if (user?.employeeId) {
      updateFormData({ employeeId: user.employeeId });
    }
  }, [isSelfMode, isEditing, formData.employeeId, user?.employeeId, updateFormData]);

  useEffect(() => {
    if (template) {
      return;
    }

    if (selectedTemplate) {
      setTemplate(selectedTemplate);
      return;
    }

    if (!isEditing && templates.length > 0 && !formData.templateId) {
      updateFormData({ templateId: templates[0].id });
    }
  }, [
    template,
    selectedTemplate,
    templates,
    isEditing,
    formData.templateId,
    setTemplate,
    updateFormData,
  ]);

  const activeTemplate = template || selectedTemplate;

  const steps = useMemo(() => {
    if (!activeTemplate) {
      return ['Dados'];
    }

    return [
      'Dados',
      ...activeTemplate.categories.map((category) => category.name),
      'Feedback',
      'Resumo',
    ];
  }, [activeTemplate]);

  const categorySteps = activeTemplate?.categories ?? [];
  const isSetupStep = currentStep === 0;
  const isFeedbackStep = currentStep === steps.length - 2;
  const isSummaryStep = currentStep === steps.length - 1;
  const currentCategory = categorySteps[currentStep - 1];

  const summary = useMemo(() => {
    if (!activeTemplate) {
      return null;
    }

    return calculateEvaluationSummary(
      activeTemplate,
      mapAnswersObjectToList(formData.answers),
    );
  }, [activeTemplate, formData.answers]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMutationError = (error) => {
    const message =
      error?.response?.data?.message ||
      'Não foi possível salvar a avaliação.';
    setStepError(message);
    showSnackbar(message, 'error');
  };

  const {
    createMutation,
    createSelfMutation,
    updateMutation,
    completeMutation,
  } = useEvaluationMutations({
    onSuccess: (message, data) => {
      if (data?.id) {
        setEvaluationId(data.id);
      }

      if (message.includes('concluída')) {
        navigate(`/avaliacoes/${data.id}`);
        return;
      }

      showSnackbar(message);
    },
    onError: handleMutationError,
  });

  const createDraft = async () => {
    if (isSelfMode) {
      return createSelfMutation.mutateAsync({
        templateId: formData.templateId,
        period: formData.period,
        evaluatedAt: formData.evaluatedAt,
      });
    }

    return createMutation.mutateAsync({
      employeeId: formData.employeeId,
      templateId: formData.templateId,
      period: formData.period,
      evaluatedAt: formData.evaluatedAt,
    });
  };

  const validateSetupStep = () => {
    if (!isSelfMode && !formData.employeeId) {
      return 'Selecione um colaborador.';
    }

    if (isSelfMode && !user?.employeeId && !formData.employeeId) {
      return 'Sua conta não está vinculada a um colaborador. Solicite ao RH.';
    }

    if (!formData.templateId) {
      return 'Selecione um template de avaliação.';
    }

    if (!formData.period.trim()) {
      return 'Informe o período avaliado.';
    }

    if (!formData.evaluatedAt) {
      return 'Informe a data da avaliação.';
    }

    return '';
  };

  const validateCategoryStep = (category) => {
    const unanswered = category.questions.filter(
      (question) => !formData.answers[question.id]?.score,
    );

    if (unanswered.length > 0) {
      return 'Atribua uma nota de 1 a 5 para todas as perguntas desta categoria.';
    }

    return '';
  };

  const validateFeedbackStep = () => {
    const { strengths, improvements, recommendations } = formData.finalFeedback;

    if (!strengths.trim() || !improvements.trim() || !recommendations.trim()) {
      return 'Preencha todos os campos do feedback final.';
    }

    return '';
  };

  const saveProgress = async () => {
    const payload = buildPayload(formData);
    const currentEvaluationId = evaluationId || id;

    if (!currentEvaluationId) {
      const created = await createDraft();
      setEvaluationId(created.id);
      setTemplate(created.template);
      await updateMutation.mutateAsync({ id: created.id, ...payload });
      return created.id;
    }

    await updateMutation.mutateAsync({
      id: currentEvaluationId,
      ...payload,
    });

    return currentEvaluationId;
  };

  const handleBack = () => {
    setStepError('');
    setStep(Math.max(currentStep - 1, 0));
  };

  const handleNext = async () => {
    setStepError('');

    if (isSetupStep) {
      const error = validateSetupStep();
      if (error) {
        setStepError(error);
        return;
      }

      try {
        if (!evaluationId && !id) {
          const created = await createDraft();
          setEvaluationId(created.id);
          setTemplate(created.template);
        } else {
          await saveProgress();
        }
        setStep(currentStep + 1);
      } catch {
        return;
      }

      return;
    }

    if (currentCategory) {
      const error = validateCategoryStep(currentCategory);
      if (error) {
        setStepError(error);
        return;
      }

      try {
        await saveProgress();
        setStep(currentStep + 1);
      } catch {
        return;
      }

      return;
    }

    if (isFeedbackStep) {
      const error = validateFeedbackStep();
      if (error) {
        setStepError(error);
        return;
      }

      try {
        await saveProgress();
        setStep(currentStep + 1);
      } catch {
        return;
      }
    }
  };

  const handleComplete = async () => {
    setStepError('');

    try {
      const currentEvaluationId = evaluationId || id;
      await saveProgress();
      await completeMutation.mutateAsync(currentEvaluationId);
    } catch {
      return;
    }
  };

  const isSaving =
    createMutation.isPending ||
    createSelfMutation.isPending ||
    updateMutation.isPending ||
    completeMutation.isPending;

  if (isEditing && isLoadingEvaluation) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEditing && !isLoadingEvaluation && !existingEvaluation) {
    return <Alert severity="error">Avaliação não encontrada.</Alert>;
  }

  if (
    isEditing &&
    isSelfMode &&
    existingEvaluation &&
    !existingEvaluation.isAutoEvaluation
  ) {
    return (
      <Alert severity="error">
        Esta avaliação não é uma autoavaliação.
      </Alert>
    );
  }

  if (isEditing && existingEvaluation?.status === 'COMPLETED') {
    navigate(`/avaliacoes/${existingEvaluation.id}`, { replace: true });
    return null;
  }

  if (isSelfMode && !isEditing && !user?.employeeId) {
    return (
      <Alert severity="warning">
        Sua conta ainda não está vinculada a um colaborador. Solicite ao RH para
        realizar a autoavaliação.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title={
          isSelfMode
            ? isEditing
              ? 'Continuar autoavaliação'
              : 'Nova autoavaliação'
            : isEditing
              ? 'Continuar avaliação'
              : 'Nova avaliação'
        }
        subtitle={
          isSelfMode
            ? 'Preencha suas respostas. O progresso é salvo automaticamente.'
            : 'Preencha o wizard em etapas. O progresso é salvo automaticamente.'
        }
        action={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(listPath)}
          >
            Voltar
          </Button>
        }
      />

      {activeTemplate && (
        <WizardProgress steps={steps} currentStep={currentStep} />
      )}

      {stepError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {stepError}
        </Alert>
      )}

      {isSetupStep && (
        <SetupStep
          mode={mode}
          employees={employees}
          templates={templates}
          formData={formData}
          selectedEmployee={selectedEmployee}
          onChange={updateFormData}
        />
      )}

      {currentCategory && (
        <CategoryStep
          category={currentCategory}
          answers={formData.answers}
          categoryComment={formData.categoryComments[currentCategory.id] || ''}
          onAnswerChange={(questionId, data) => setAnswer(questionId, data)}
          onCategoryCommentChange={(comment) =>
            setCategoryComment(currentCategory.id, comment)
          }
          error={stepError}
        />
      )}

      {isFeedbackStep && (
        <FeedbackStep
          mode={mode}
          finalFeedback={formData.finalFeedback}
          onChange={setFinalFeedback}
          error={stepError}
        />
      )}

      {isSummaryStep && summary && (
        <SummaryStep
          summary={summary}
          employee={selectedEmployee || existingEvaluation?.employee}
          period={formData.period}
          evaluatedAt={formData.evaluatedAt}
        />
      )}

      <Stack direction="row" justifyContent="space-between" mt={3}>
        <Button disabled={currentStep === 0 || isSaving} onClick={handleBack}>
          Anterior
        </Button>

        {!isSummaryStep ? (
          <Button variant="contained" onClick={handleNext} disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Próximo'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={isSaving}
          >
            {isSaving ? (
              <CircularProgress size={24} color="inherit" />
            ) : isSelfMode ? (
              'Salvar autoavaliação'
            ) : (
              'Salvar avaliação'
            )}
          </Button>
        )}
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
