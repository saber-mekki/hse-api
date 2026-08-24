-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OPERATEUR', 'CHEF_EQUIPE', 'HSE', 'DIRECTION', 'ADMIN');

-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('SITUATION_DANGEREUSE', 'PRESQUE_ACCIDENT', 'ACCIDENT_SANS_ARRET', 'ACCIDENT_AVEC_ARRET', 'DEVERSEMENT', 'INCENDIE_PRESQU_INCENDIE', 'DEFAILLANCE_EQUIPEMENT', 'COMPORTEMENT_RISQUE');

-- CreateEnum
CREATE TYPE "StatutWorkflow" AS ENUM ('DECLARE', 'ANALYSE', 'ACTION_EN_COURS', 'CLOTURE');

-- CreateEnum
CREATE TYPE "StatutAction" AS ENUM ('OUVERTE', 'EN_RETARD', 'CLOTUREE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "atelierId" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atelier" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "qrCode" TEXT,

    CONSTRAINT "Atelier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evenement" (
    "id" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "atelierId" TEXT NOT NULL,
    "type" "TypeEvenement" NOT NULL,
    "description" TEXT NOT NULL,
    "risquePotentiel" TEXT NOT NULL,
    "photoUrl" TEXT,
    "anonyme" BOOLEAN NOT NULL DEFAULT false,
    "declarantId" TEXT,
    "statut" "StatutWorkflow" NOT NULL DEFAULT 'DECLARE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionCorrective" (
    "id" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "echeance" TIMESTAMP(3) NOT NULL,
    "statut" "StatutAction" NOT NULL DEFAULT 'OUVERTE',
    "clotureLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionCorrective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueStatut" (
    "id" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,
    "ancienStatut" TEXT NOT NULL,
    "nouveauStatut" TEXT NOT NULL,
    "parUserId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueStatut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier_qrCode_key" ON "Atelier"("qrCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_atelierId_fkey" FOREIGN KEY ("atelierId") REFERENCES "Atelier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evenement" ADD CONSTRAINT "Evenement_atelierId_fkey" FOREIGN KEY ("atelierId") REFERENCES "Atelier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evenement" ADD CONSTRAINT "Evenement_declarantId_fkey" FOREIGN KEY ("declarantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionCorrective" ADD CONSTRAINT "ActionCorrective_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueStatut" ADD CONSTRAINT "HistoriqueStatut_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
