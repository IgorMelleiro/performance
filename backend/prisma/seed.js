import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';
import { calculateEvaluationSummary } from '../src/utils/evaluationCalculator.js';

const DEFAULT_PASSWORD = '123456';

const DEFAULT_TEMPLATE = {
  name: 'Avaliação de Performance Padrão',
  categories: [
    {
      name: 'Entrega de Resultados',
      weight: 30,
      order: 1,
      questions: [
        'Cumprimento de metas e prazos',
        'Qualidade das entregas',
        'Organização e planejamento',
        'Capacidade de resolução de problemas',
      ],
    },
    {
      name: 'Competências Comportamentais',
      weight: 30,
      order: 2,
      questions: [
        'Comunicação',
        'Trabalho em equipe',
        'Proatividade',
        'Adaptabilidade',
        'Responsabilidade',
      ],
    },
    {
      name: 'Alinhamento aos Valores',
      weight: 20,
      order: 3,
      questions: [
        'Demonstra os valores da empresa',
        'Atua com ética e respeito',
        'Contribui para ambiente positivo',
        'Coloca o cliente no centro',
      ],
    },
    {
      name: 'Desenvolvimento Profissional',
      weight: 10,
      order: 4,
      questions: [
        'Busca aprendizado contínuo',
        'Aplica novos conhecimentos',
        'Interesse pelo desenvolvimento',
      ],
    },
    {
      name: 'Potencial de Crescimento',
      weight: 10,
      order: 5,
      questions: [
        'Capacidade para assumir novos desafios',
        'Influência positiva sobre colegas',
        'Potencial para futuras posições',
      ],
    },
  ],
};

const EMPLOYEE_NAMES = [
  'Camila Rocha',
  'Diego Martins',
  'Eduarda Nunes',
  'Felipe Carvalho',
  'Gabriela Pinto',
  'Henrique Barbosa',
  'Isabela Freitas',
  'João Mendes',
  'Larissa Campos',
  'Marcelo Vieira',
  'Natália Azevedo',
  'Otávio Ribeiro',
  'Patrícia Gomes',
  'Rafael Duarte',
  'Sofia Teixeira',
  'Tiago Almeida',
  'Ursula Monteiro',
  'Vinícius Lopes',
  'Helena Castro',
  'Wagner Silveira',
  'Yasmin Ferreira',
  'André Cunha',
  'Beatriz Moura',
  'Caio Rezende',
  'Daniela Prado',
  'Emerson Tavares',
  'Fernanda Dias',
  'Gustavo Pires',
  'Helena Cardoso',
  'Igor Santana',
];

const POSITIONS = [
  'Analista',
  'Desenvolvedor(a)',
  'Designer',
  'Especialista',
  'Coordenador(a)',
  'Assistente',
];

const DEPARTMENTS = {
  A: 'Tecnologia',
  B: 'Comercial',
  C: 'Operações',
};

function scoreForIndex(index, base) {
  const scores = [2, 3, 3, 4, 4, 5, 2, 5, 3, 4];
  return scores[(index + base) % scores.length];
}

async function resetDemoData() {
  console.log('Limpando dados de demonstração...');
  await prisma.finalFeedback.deleteMany();
  await prisma.categoryComment.deleteMany();
  await prisma.evaluationAnswer.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.teamManager.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
}

async function ensureTemplate() {
  let template = await prisma.evaluationTemplate.findFirst({
    where: { name: DEFAULT_TEMPLATE.name },
    include: {
      categories: {
        include: { questions: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (template) {
    return template;
  }

  template = await prisma.evaluationTemplate.create({
    data: {
      name: DEFAULT_TEMPLATE.name,
      categories: {
        create: DEFAULT_TEMPLATE.categories.map((category) => ({
          name: category.name,
          weight: category.weight,
          order: category.order,
          questions: {
            create: category.questions.map((text, index) => ({
              text,
              order: index + 1,
            })),
          },
        })),
      },
    },
    include: {
      categories: {
        include: { questions: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  return template;
}

async function createCompletedEvaluation({
  employeeId,
  template,
  evaluatorId,
  period,
  isAutoEvaluation,
  scoreSeed,
}) {
  const allQuestions = template.categories.flatMap((category) => category.questions);
  const answers = allQuestions.map((question, index) => ({
    questionId: question.id,
    score: scoreForIndex(index, scoreSeed),
    comment: null,
  }));

  const summary = calculateEvaluationSummary(template, answers);

  const evaluation = await prisma.evaluation.create({
    data: {
      id: randomUUID(),
      employeeId,
      templateId: template.id,
      evaluatorId,
      period,
      evaluatedAt: new Date(Date.UTC(2026, scoreSeed % 6, 5 + (scoreSeed % 20))),
      status: 'COMPLETED',
      isAutoEvaluation,
      finalScore: summary.finalScore,
      classification: summary.classification,
      answers: {
        create: answers.map((answer) => ({
          id: randomUUID(),
          ...answer,
        })),
      },
      categoryComments: {
        create: template.categories.map((category) => ({
          id: randomUUID(),
          categoryId: category.id,
          comment: `Comentário da categoria ${category.name}.`,
        })),
      },
      finalFeedback: {
        create: {
          id: randomUUID(),
          strengths: isAutoEvaluation
            ? 'Consistência nas entregas e colaboração com o time.'
            : 'Bom alinhamento com metas e comunicação efetiva.',
          improvements: isAutoEvaluation
            ? 'Organizar melhor prioridades em demandas emergenciais.'
            : 'Aprofundar documentação e compartilhamento de conhecimento.',
          recommendations: isAutoEvaluation
            ? 'Participar de mentoring e acompanhar indicadores semanalmente.'
            : 'Assumir um projeto de maior complexidade no próximo ciclo.',
        },
      },
    },
  });

  return evaluation;
}

async function createDraftEvaluation({
  employeeId,
  template,
  evaluatorId,
  period,
  isAutoEvaluation,
}) {
  return prisma.evaluation.create({
    data: {
      id: randomUUID(),
      employeeId,
      templateId: template.id,
      evaluatorId,
      period,
      evaluatedAt: new Date(),
      status: 'DRAFT',
      isAutoEvaluation,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await resetDemoData();
  const template = await ensureTemplate();

  console.log('Criando usuários RH...');
  const rhUsers = [];
  for (const rh of [
    { name: 'Ana Souza RH', email: 'rh1@empresa.com' },
    { name: 'Bruno Lima RH', email: 'rh2@empresa.com' },
  ]) {
    rhUsers.push(
      await prisma.user.create({
        data: {
          id: randomUUID(),
          name: rh.name,
          email: rh.email,
          password: passwordHash,
          role: 'RH',
        },
      }),
    );
  }

  console.log('Criando gerentes...');
  const managers = [];
  for (const manager of [
    { name: 'Carla Gerente A', email: 'gerente.a@empresa.com', key: 'A' },
    { name: 'Diego Gerente B', email: 'gerente.b@empresa.com', key: 'B' },
    { name: 'Elena Gerente C', email: 'gerente.c@empresa.com', key: 'C' },
  ]) {
    managers.push({
      key: manager.key,
      user: await prisma.user.create({
        data: {
          id: randomUUID(),
          name: manager.name,
          email: manager.email,
          password: passwordHash,
          role: 'GERENTE',
        },
      }),
    });
  }

  console.log('Criando funcionários e vínculos...');
  const employees = [];
  for (let i = 0; i < 30; i += 1) {
    const number = String(i + 1).padStart(2, '0');
    const teamKey = i < 10 ? 'A' : i < 20 ? 'B' : 'C';
    const email = `funcionario${number}@empresa.com`;

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: EMPLOYEE_NAMES[i],
        email,
        password: passwordHash,
        role: 'FUNCIONARIO',
      },
    });

    const employee = await prisma.employee.create({
      data: {
        id: randomUUID(),
        name: EMPLOYEE_NAMES[i],
        position: POSITIONS[i % POSITIONS.length],
        department: DEPARTMENTS[teamKey],
        active: true,
        userId: user.id,
      },
    });

    employees.push({ index: i, number, teamKey, user, employee });
  }

  console.log('Criando times...');
  const teams = {};
  for (const [key, name, description] of [
    ['A', 'Time A', 'Time de Tecnologia'],
    ['B', 'Time B', 'Time Comercial'],
    ['C', 'Time C', 'Time de Operações'],
  ]) {
    const manager = managers.find((item) => item.key === key).user;
    const members = employees.filter((item) => item.teamKey === key);

    teams[key] = await prisma.team.create({
      data: {
        id: randomUUID(),
        name,
        description,
        managers: {
          create: [
            {
              id: randomUUID(),
              managerId: manager.id,
            },
          ],
        },
        members: {
          create: members.map((item) => ({
            id: randomUUID(),
            employeeId: item.employee.id,
            userId: item.user.id,
          })),
        },
      },
    });
  }

  console.log('Gerando avaliações fictícias...');
  const rhEvaluator = rhUsers[0];

  // Time A: concluídas (gestão) para 01-04, pendentes 05-06, auto concluídas 07-08, auto rascunho 09
  for (const item of employees.filter((e) => e.teamKey === 'A')) {
    const manager = managers.find((m) => m.key === 'A').user;

    if (item.index <= 3) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: manager.id,
        period: '2026 - 1º Semestre',
        isAutoEvaluation: false,
        scoreSeed: item.index + 1,
      });
    }

    if (item.index === 4 || item.index === 5) {
      await createDraftEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: manager.id,
        period: '2026 - 1º Semestre',
        isAutoEvaluation: false,
      });
    }

    if (item.index === 6 || item.index === 7) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: item.user.id,
        period: '2026 - Autoavaliação',
        isAutoEvaluation: true,
        scoreSeed: item.index + 2,
      });
    }

    if (item.index === 8) {
      await createDraftEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: item.user.id,
        period: '2026 - Autoavaliação',
        isAutoEvaluation: true,
      });
    }
  }

  // Time B: concluídas 11-14, pendentes 15-16, auto 17-18
  for (const item of employees.filter((e) => e.teamKey === 'B')) {
    const manager = managers.find((m) => m.key === 'B').user;

    if (item.index >= 10 && item.index <= 13) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: manager.id,
        period: '2026 - 1º Semestre',
        isAutoEvaluation: false,
        scoreSeed: item.index,
      });
    }

    if (item.index === 14 || item.index === 15) {
      await createDraftEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: manager.id,
        period: '2026 - 1º Semestre',
        isAutoEvaluation: false,
      });
    }

    if (item.index === 16 || item.index === 17) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: item.user.id,
        period: '2026 - Autoavaliação',
        isAutoEvaluation: true,
        scoreSeed: item.index,
      });
    }
  }

  // Time C: concluídas 21-24, pendentes 25, auto 26-27, e uma avaliação RH para 28
  for (const item of employees.filter((e) => e.teamKey === 'C')) {
    const manager = managers.find((m) => m.key === 'C').user;

    if (item.index >= 20 && item.index <= 23) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: manager.id,
        period: '2026 - 1º Semestre',
        isAutoEvaluation: false,
        scoreSeed: item.index,
      });
    }

    if (item.index === 24) {
      await createDraftEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: manager.id,
        period: '2026 - 1º Semestre',
        isAutoEvaluation: false,
      });
    }

    if (item.index === 25 || item.index === 26) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: item.user.id,
        period: '2026 - Autoavaliação',
        isAutoEvaluation: true,
        scoreSeed: item.index,
      });
    }

    if (item.index === 27) {
      await createCompletedEvaluation({
        employeeId: item.employee.id,
        template,
        evaluatorId: rhEvaluator.id,
        period: '2026 - Avaliação RH',
        isAutoEvaluation: false,
        scoreSeed: 9,
      });
    }
  }

  console.log('Seed completo concluído.\n');
  console.log(`Senha padrão para todos: ${DEFAULT_PASSWORD}\n`);
  console.log('RH:');
  console.log('  rh1@empresa.com');
  console.log('  rh2@empresa.com');
  console.log('Gerentes:');
  console.log('  gerente.a@empresa.com  (Time A)');
  console.log('  gerente.b@empresa.com  (Time B)');
  console.log('  gerente.c@empresa.com  (Time C)');
  console.log('Funcionários:');
  console.log('  funcionario01@empresa.com ... funcionario30@empresa.com');
  console.log('  Time A: 01-10 | Time B: 11-20 | Time C: 21-30');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
