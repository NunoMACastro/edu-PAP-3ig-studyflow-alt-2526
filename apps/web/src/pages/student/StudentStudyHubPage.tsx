/** Hub de estudo com separação clara entre escola e estudo pessoal. */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import { StudyAreaForm } from "../../components/study/StudyAreaForm.js";
import {
    ContextCard,
    PrimaryActionCard,
    WorkspaceTabs,
} from "../../components/student/StudentWorkspace.js";
import {
    EmptyState,
    InlineNotice,
    SectionHeader,
} from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import {
    createStudyArea,
    listStudentClasses,
    listStudyAreas,
    type StudentClassSummary,
    type StudyArea,
} from "../../lib/apiClient.js";

export function StudentStudyHubPage() {
    const [searchParams] = useSearchParams();
    const archived = searchParams.get("estado") === "arquivo";
    const [classes, setClasses] = useState<StudentClassSummary[]>([]);
    const [areas, setAreas] = useState<StudyArea[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    useHashSidePanel("#criar-area", setCreateOpen);

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.all([
            listStudentClasses(archived ? "ARCHIVED" : "ACTIVE"),
            listStudyAreas(),
        ])
            .then(([nextClasses, nextAreas]) => {
                if (!active) return;
                setClasses(nextClasses);
                setAreas(nextAreas);
            })
            .catch((caught) => {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível carregar os contextos.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [archived]);

    async function createArea(input: {
        name: string;
        description: string;
    }): Promise<boolean> {
        setError(null);
        try {
            const area = await createStudyArea(input);
            setAreas((current) =>
                [...current, area].sort((left, right) =>
                    left.name.localeCompare(right.name, "pt"),
                ),
            );
            setCreateOpen(false);
            return true;
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível criar a área.",
            );
            return false;
        }
    }

    return (
        <section className="space-y-8">
            <PageHeader
                description="A escola e o estudo pessoal no mesmo local, sem misturar os dois contextos."
                title="Estudar"
            />
            <WorkspaceTabs
                items={[
                    {
                        label: "Ativas",
                        href: "/app/estudar?vista=escola",
                        active: !archived,
                    },
                    {
                        label: "Arquivo",
                        href: "/app/estudar?vista=escola&estado=arquivo",
                        active: archived,
                    },
                ]}
            />
            {loading ? <InlineNotice>A carregar os teus estudos...</InlineNotice> : null}
            {error && !createOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!loading && !error ? (
                <>
                    <section className="space-y-4" id="escola">
                        <SectionHeader
                            eyebrow="Da escola"
                            title={archived ? "Turmas em arquivo" : "Turmas e disciplinas"}
                        />
                        {classes.length ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {classes.map((schoolClass) => (
                                    <ContextCard
                                        actionLabel={archived ? "Consultar turma" : "Abrir turma"}
                                        description={`${schoolClass.code} · ${schoolClass.schoolYear}${archived ? " · Consulta" : ""}`}
                                        href={`/app/turmas/${schoolClass._id}/disciplinas`}
                                        key={schoolClass._id}
                                        title={schoolClass.name}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                description={
                                    archived
                                        ? "As turmas arquivadas aparecerão aqui."
                                        : "Quando fores inscrito numa turma, ela aparecerá aqui."
                                }
                                icon="graduation"
                                title={archived ? "Sem turmas em arquivo" : "Sem turmas ativas"}
                            />
                        )}
                    </section>

                    {!archived ? (
                        <section className="space-y-4">
                            <SectionHeader
                                eyebrow="Arquivo privado"
                                title="Materiais criados no Assistente"
                            />
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <PrimaryActionCard
                                    actionLabel="Ver materiais"
                                    description="Consulta resumos, explicações, flashcards e quizzes organizados por disciplina, turma ou área pessoal."
                                    href="/app/estudar/materiais"
                                    icon="spark"
                                    title="Materiais de estudo"
                                />
                            </div>
                        </section>
                    ) : null}

                    {!archived ? (
                        <section className="space-y-4" id="pessoal">
                            <SectionHeader
                                action={
                                    <button
                                        className="sf-button-secondary"
                                        onClick={() => setCreateOpen(true)}
                                        type="button"
                                    >
                                        Nova área
                                    </button>
                                }
                                eyebrow="Estudo pessoal"
                                title="Áreas privadas"
                            />
                            {areas.length ? (
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {areas.map((area) => (
                                        <ContextCard
                                            actionLabel="Continuar"
                                            description={area.description}
                                            href={`/app/areas/${area._id}`}
                                            key={area._id}
                                            title={area.name}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    action={
                                        <button
                                            className="sf-button-primary"
                                            onClick={() => setCreateOpen(true)}
                                            type="button"
                                        >
                                            Criar primeira área
                                        </button>
                                    }
                                    description="Junta materiais e pratica num espaço que é só teu."
                                    icon="folder"
                                    title="Ainda não tens áreas pessoais"
                                />
                            )}
                        </section>
                    ) : null}
                </>
            ) : null}
            <SidePanel
                closeDisabled={saving}
                description="Define um contexto privado para materiais e ferramentas de estudo."
                onClose={() => setCreateOpen(false)}
                open={createOpen}
                title="Criar área"
            >
                <StudyAreaForm
                    error={createOpen ? error : null}
                    formId="criar-area"
                    onSavingChange={setSaving}
                    onSubmit={createArea}
                    submitLabel="Criar área"
                />
            </SidePanel>
        </section>
    );
}
