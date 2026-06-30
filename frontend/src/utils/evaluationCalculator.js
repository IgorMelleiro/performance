export function calculateCategoryAverage(answers, questionIds) {
  const relevantAnswers = answers.filter((answer) =>
    questionIds.includes(answer.questionId),
  );

  if (relevantAnswers.length === 0) {
    return null;
  }

  const total = relevantAnswers.reduce((sum, answer) => sum + answer.score, 0);
  return total / relevantAnswers.length;
}

export function calculateEvaluationSummary(template, answersList) {
  const categories = template.categories.map((category) => {
    const questionIds = category.questions.map((question) => question.id);
    const average = calculateCategoryAverage(answersList, questionIds);
    const weightedScore =
      average === null ? null : average * (category.weight / 100);

    return {
      categoryId: category.id,
      name: category.name,
      weight: category.weight,
      average,
      weightedScore,
    };
  });

  const finalScore = Number(
    categories
      .reduce((sum, category) => sum + (category.weightedScore || 0), 0)
      .toFixed(2),
  );

  return {
    categories,
    finalScore,
    classification: getClassification(finalScore),
  };
}

export function getClassification(finalScore) {
  if (finalScore >= 4.5) {
    return 'Performance Excepcional';
  }

  if (finalScore >= 4.0) {
    return 'Acima das Expectativas';
  }

  if (finalScore >= 3.0) {
    return 'Atende às Expectativas';
  }

  if (finalScore >= 2.0) {
    return 'Necessita Desenvolvimento';
  }

  return 'Performance Crítica';
}

export const scoreLabels = {
  1: 'Necessita melhoria significativa',
  2: 'Abaixo do esperado',
  3: 'Atende às expectativas',
  4: 'Acima das expectativas',
  5: 'Excelente / Referência',
};

export function mapAnswersObjectToList(answersObject) {
  return Object.entries(answersObject).map(([questionId, value]) => ({
    questionId,
    score: value.score,
    comment: value.comment || '',
  }));
}

export function mapCategoryCommentsObjectToList(categoryCommentsObject) {
  return Object.entries(categoryCommentsObject)
    .filter(([, comment]) => comment?.trim())
    .map(([categoryId, comment]) => ({
      categoryId,
      comment,
    }));
}
