/**
 * Remove usuários e dados associados para reinício limpo da Fase 1 (RBAC).
 * Mantém templates de avaliação.
 *
 * Uso: node prisma/cleanup-users.js
 */
import prisma from '../src/config/prisma.js';

async function main() {
  console.log('Limpando dados de usuários e relacionados...');

  await prisma.finalFeedback.deleteMany();
  await prisma.categoryComment.deleteMany();
  await prisma.evaluationAnswer.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.teamManager.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  console.log('Usuários, colaboradores, times e avaliações removidos.');
  console.log('Templates preservados.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
