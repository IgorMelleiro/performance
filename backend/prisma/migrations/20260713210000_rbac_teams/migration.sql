-- Phase 1: RBAC roles, teams, User-Employee link, auto-evaluation

-- 1) Replace UserRole enum (RH, ADMIN -> RH, GERENTE, FUNCIONARIO)
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

CREATE TYPE "UserRole_new" AS ENUM ('RH', 'GERENTE', 'FUNCIONARIO');

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING (
    CASE
      WHEN ("role"::text = 'RH') THEN 'RH'::"UserRole_new"
      WHEN ("role"::text = 'ADMIN') THEN 'RH'::"UserRole_new"
      ELSE 'RH'::"UserRole_new"
    END
  );

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'RH'::"UserRole";

-- 2) Employee.userId (optional link to login account)
ALTER TABLE "Employee" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

ALTER TABLE "Employee"
  ADD CONSTRAINT "Employee_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) Auto-evaluation flag
ALTER TABLE "Evaluation" ADD COLUMN "isAutoEvaluation" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Evaluation_isAutoEvaluation_idx" ON "Evaluation"("isAutoEvaluation");

-- 4) Teams
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamManager" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamManager_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamMember_teamId_employeeId_key" ON "TeamMember"("teamId", "employeeId");
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX "TeamMember_employeeId_idx" ON "TeamMember"("employeeId");
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

CREATE UNIQUE INDEX "TeamManager_teamId_managerId_key" ON "TeamManager"("teamId", "managerId");
CREATE INDEX "TeamManager_teamId_idx" ON "TeamManager"("teamId");
CREATE INDEX "TeamManager_managerId_idx" ON "TeamManager"("managerId");

ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TeamManager"
  ADD CONSTRAINT "TeamManager_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamManager"
  ADD CONSTRAINT "TeamManager_managerId_fkey"
  FOREIGN KEY ("managerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
