-- CreateTable
CREATE TABLE "modules" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "cor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "write" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "role_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "ultimo_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triage_entries" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_age" INTEGER,
    "patient_cns" TEXT,
    "vital_signs" JSONB NOT NULL,
    "symptoms" TEXT[],
    "main_complaint" TEXT,
    "classification" JSONB NOT NULL,
    "alerts" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "registered_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triage_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "concentracao" TEXT,
    "forma" TEXT,
    "categoria" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "validade" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "fabricante" TEXT,
    "data_recebimento" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_prescriptions" (
    "id" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "prontuario" TEXT,
    "medico" TEXT NOT NULL,
    "data_hora" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'recebida',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "separado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensations" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT,
    "paciente" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "responsavel" TEXT,
    "data_hora" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispensations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_patients" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "leito" TEXT,
    "idade" INTEGER,
    "prontuario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_prescriptions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dose" TEXT,
    "via" TEXT,
    "frequencia" TEXT,
    "interval_hours" INTEGER,
    "prescritor" TEXT,
    "data_inicio" TEXT,
    "data_fim" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_schedules" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dose" TEXT,
    "via" TEXT,
    "horarios" TEXT[],
    "criado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_checks" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dose" TEXT,
    "via" TEXT,
    "horario_previsto" TEXT NOT NULL,
    "horario_real" TEXT,
    "data" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'administrado',
    "responsavel" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microareas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "bairro" TEXT,
    "acs_id" INTEGER,
    "acs_nome" TEXT,
    "acs_avatar" TEXT,
    "acs_telefone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "microareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" SERIAL NOT NULL,
    "microarea_id" INTEGER NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "endereco" TEXT,
    "membros" INTEGER NOT NULL DEFAULT 1,
    "renda" TEXT,
    "moradia" TEXT,
    "agua" TEXT,
    "esgoto" TEXT,
    "vulnerabilidade" TEXT NOT NULL DEFAULT 'Media',
    "fatores_risco" TEXT[],
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individuals" (
    "id" SERIAL NOT NULL,
    "familia_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER,
    "sexo" TEXT,
    "riscos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "individuals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acs_alerts" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "urgencia" TEXT NOT NULL,
    "paciente_nome" TEXT NOT NULL,
    "familia_id" INTEGER,
    "microarea_id" INTEGER,
    "motivo" TEXT,
    "dias_pendentes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "data_criacao" TEXT,
    "data_resolucao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acs_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" SERIAL NOT NULL,
    "familia_id" INTEGER NOT NULL,
    "paciente_nome" TEXT,
    "endereco" TEXT,
    "tipo" TEXT,
    "data" TEXT NOT NULL,
    "hora" TEXT,
    "status" TEXT NOT NULL DEFAULT 'agendada',
    "acs_id" INTEGER,
    "motivo" TEXT,
    "observacoes" TEXT,
    "condicao_paciente" TEXT,
    "sinais_vitais" JSONB,
    "encaminhamento" BOOLEAN NOT NULL DEFAULT false,
    "proxima_visita" TEXT,
    "data_realizacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "paciente_nome" TEXT,
    "familia_id" INTEGER,
    "microarea_id" INTEGER,
    "destinatario" TEXT,
    "prioridade" TEXT DEFAULT 'normal',
    "motivo" TEXT,
    "observacoes" TEXT,
    "status" TEXT DEFAULT 'enviado',
    "data_criacao" TEXT,
    "acs_nome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "departamento" TEXT,
    "avatar" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT DEFAULT 'hash',
    "departamento" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_members" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nao_lidas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "channel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_messages" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nps_surveys" (
    "id" SERIAL NOT NULL,
    "paciente_nome" TEXT,
    "score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "comment" TEXT,
    "date" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nps_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guiches" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "profissional" TEXT,
    "especialidade" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guiches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "senhas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "cpf" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "guiche_id" TEXT,
    "prioridade" TEXT DEFAULT 'normal',
    "chamado_em" TIMESTAMP(3),
    "atendido_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "senhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_chamadas" (
    "id" TEXT NOT NULL,
    "senha_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "guiche_nome" TEXT NOT NULL,
    "profissional" TEXT,
    "chamado_em" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_chamadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_patients" (
    "id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "age" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "continuous_medications" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT,
    "frequency" TEXT,
    "route" TEXT DEFAULT 'Oral',
    "prescriber" TEXT,
    "since" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "continuous_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" SERIAL NOT NULL,
    "drug1" TEXT NOT NULL,
    "drug2" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_aliases" (
    "id" SERIAL NOT NULL,
    "canonical_name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modules_nome_key" ON "modules"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nome_key" ON "roles"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_role_id_module_id_key" ON "permissions"("role_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "triage_entries_codigo_key" ON "triage_entries"("codigo");

-- CreateIndex
CREATE INDEX "triage_entries_status_idx" ON "triage_entries"("status");

-- CreateIndex
CREATE INDEX "triage_entries_created_at_idx" ON "triage_entries"("created_at");

-- CreateIndex
CREATE INDEX "medications_nome_idx" ON "medications"("nome");

-- CreateIndex
CREATE INDEX "medications_categoria_idx" ON "medications"("categoria");

-- CreateIndex
CREATE INDEX "lots_medication_id_idx" ON "lots"("medication_id");

-- CreateIndex
CREATE INDEX "lots_validade_idx" ON "lots"("validade");

-- CreateIndex
CREATE INDEX "pharmacy_prescriptions_status_idx" ON "pharmacy_prescriptions"("status");

-- CreateIndex
CREATE INDEX "prescription_items_prescription_id_idx" ON "prescription_items"("prescription_id");

-- CreateIndex
CREATE INDEX "dispensations_prescription_id_idx" ON "dispensations"("prescription_id");

-- CreateIndex
CREATE INDEX "nursing_prescriptions_patient_id_idx" ON "nursing_prescriptions"("patient_id");

-- CreateIndex
CREATE INDEX "nursing_prescriptions_status_idx" ON "nursing_prescriptions"("status");

-- CreateIndex
CREATE INDEX "medication_schedules_patient_id_idx" ON "medication_schedules"("patient_id");

-- CreateIndex
CREATE INDEX "medication_schedules_prescription_id_idx" ON "medication_schedules"("prescription_id");

-- CreateIndex
CREATE INDEX "medication_checks_patient_id_idx" ON "medication_checks"("patient_id");

-- CreateIndex
CREATE INDEX "medication_checks_data_idx" ON "medication_checks"("data");

-- CreateIndex
CREATE UNIQUE INDEX "microareas_codigo_key" ON "microareas"("codigo");

-- CreateIndex
CREATE INDEX "families_microarea_id_idx" ON "families"("microarea_id");

-- CreateIndex
CREATE INDEX "families_vulnerabilidade_idx" ON "families"("vulnerabilidade");

-- CreateIndex
CREATE INDEX "individuals_familia_id_idx" ON "individuals"("familia_id");

-- CreateIndex
CREATE INDEX "acs_alerts_status_idx" ON "acs_alerts"("status");

-- CreateIndex
CREATE INDEX "acs_alerts_urgencia_idx" ON "acs_alerts"("urgencia");

-- CreateIndex
CREATE INDEX "acs_alerts_microarea_id_idx" ON "acs_alerts"("microarea_id");

-- CreateIndex
CREATE INDEX "visits_familia_id_idx" ON "visits"("familia_id");

-- CreateIndex
CREATE INDEX "visits_data_idx" ON "visits"("data");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "channel_members_channel_id_user_id_key" ON "channel_members"("channel_id", "user_id");

-- CreateIndex
CREATE INDEX "channel_messages_channel_id_idx" ON "channel_messages"("channel_id");

-- CreateIndex
CREATE INDEX "channel_messages_timestamp_idx" ON "channel_messages"("timestamp");

-- CreateIndex
CREATE INDEX "direct_messages_from_id_to_id_idx" ON "direct_messages"("from_id", "to_id");

-- CreateIndex
CREATE INDEX "direct_messages_timestamp_idx" ON "direct_messages"("timestamp");

-- CreateIndex
CREATE INDEX "nps_surveys_score_idx" ON "nps_surveys"("score");

-- CreateIndex
CREATE INDEX "nps_surveys_category_idx" ON "nps_surveys"("category");

-- CreateIndex
CREATE INDEX "nps_surveys_date_idx" ON "nps_surveys"("date");

-- CreateIndex
CREATE INDEX "senhas_status_idx" ON "senhas"("status");

-- CreateIndex
CREATE INDEX "senhas_tipo_idx" ON "senhas"("tipo");

-- CreateIndex
CREATE INDEX "senhas_criado_em_idx" ON "senhas"("criado_em");

-- CreateIndex
CREATE INDEX "historico_chamadas_chamado_em_idx" ON "historico_chamadas"("chamado_em");

-- CreateIndex
CREATE INDEX "continuous_medications_patient_id_idx" ON "continuous_medications"("patient_id");

-- CreateIndex
CREATE INDEX "drug_interactions_drug1_drug2_idx" ON "drug_interactions"("drug1", "drug2");

-- CreateIndex
CREATE UNIQUE INDEX "drug_aliases_alias_key" ON "drug_aliases"("alias");

-- CreateIndex
CREATE INDEX "drug_aliases_canonical_name_idx" ON "drug_aliases"("canonical_name");

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "pharmacy_prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "pharmacy_prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_prescriptions" ADD CONSTRAINT "nursing_prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "nursing_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "nursing_prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "nursing_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_checks" ADD CONSTRAINT "medication_checks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "medication_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_checks" ADD CONSTRAINT "medication_checks_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "nursing_prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_checks" ADD CONSTRAINT "medication_checks_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "nursing_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_microarea_id_fkey" FOREIGN KEY ("microarea_id") REFERENCES "microareas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individuals" ADD CONSTRAINT "individuals_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acs_alerts" ADD CONSTRAINT "acs_alerts_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acs_alerts" ADD CONSTRAINT "acs_alerts_microarea_id_fkey" FOREIGN KEY ("microarea_id") REFERENCES "microareas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "chat_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "chat_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "chat_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "chat_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "senhas" ADD CONSTRAINT "senhas_guiche_id_fkey" FOREIGN KEY ("guiche_id") REFERENCES "guiches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_chamadas" ADD CONSTRAINT "historico_chamadas_senha_id_fkey" FOREIGN KEY ("senha_id") REFERENCES "senhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "continuous_medications" ADD CONSTRAINT "continuous_medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "reconciliation_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
