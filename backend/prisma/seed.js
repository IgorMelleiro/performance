import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

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

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'rh@empresa.com' },
    update: {},
    create: {
      name: 'Administrador RH',
      email: 'rh@empresa.com',
      password: passwordHash,
      role: 'RH',
    },
  });

  const existingTemplate = await prisma.evaluationTemplate.findFirst({
    where: { name: DEFAULT_TEMPLATE.name },
  });

  if (!existingTemplate) {
    await prisma.evaluationTemplate.create({
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
    });
  }

  console.log('Seed concluído.');
  console.log('Usuário RH: rh@empresa.com / admin123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
