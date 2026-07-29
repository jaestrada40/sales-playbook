-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'SELLER');

-- CreateEnum
CREATE TYPE "PlaybookStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('SCRIPT', 'QUESTION', 'ANSWER', 'OBJECTION', 'OUTCOME');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SELLER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'es',
    "industry" TEXT NOT NULL DEFAULT 'general',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" "PlaybookStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookSection" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlaybookSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookNode" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "NodeType" NOT NULL DEFAULT 'SCRIPT',
    "title" TEXT NOT NULL,
    "script" TEXT NOT NULL DEFAULT '',
    "suggestedQuestion" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlaybookNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeBranch" (
    "id" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "customerResponse" TEXT NOT NULL,

    CONSTRAINT "NodeBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Playbook_ownerId_status_idx" ON "Playbook"("ownerId", "status");

-- CreateIndex
CREATE INDEX "PlaybookSection_playbookId_sortOrder_idx" ON "PlaybookSection"("playbookId", "sortOrder");

-- CreateIndex
CREATE INDEX "PlaybookNode_sectionId_sortOrder_idx" ON "PlaybookNode"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "NodeBranch_sourceNodeId_idx" ON "NodeBranch"("sourceNodeId");

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookSection" ADD CONSTRAINT "PlaybookSection_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookNode" ADD CONSTRAINT "PlaybookNode_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PlaybookSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeBranch" ADD CONSTRAINT "NodeBranch_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "PlaybookNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeBranch" ADD CONSTRAINT "NodeBranch_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "PlaybookNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
