"use client";

// 파일 경로: src/app/studio/library/page.tsx

import Image from "next/image";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { MemoryCard } from "@/components/memory-card";
import { MemoryPlayer } from "@/components/memory-player";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { PauseCard } from "@/components/pause-card";
import { Modal } from "@/components/ui/modal";
import { uploadImageToR2 } from "@/lib/upload";
import { Badge } from "@/components/ui/badge";

interface Memory {
  id: number;
  content: string;
  image_filename: string | null;
  created_at: string;
  section: string;
}

const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ?? "";

enum MemoryCategory {
  All = "All",
  Photo = "Photo",
  Text = "Text",
}

const typeFilters = [
  MemoryCategory.All,
  MemoryCategory.Photo,
  MemoryCategory.Text,
] as const;

export default function LibraryPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [showPauseCard, setShowPauseCard] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MemoryCategory>(MemoryCategory.All);
  const [sectionFilter, setSectionFilter] = useState<string>("All Sections");

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meResponse, memoriesResponse] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/memories"),
      ]);

      if (meResponse.status === 401) {
        router.replace("/");
        return;
      }

      const meData = await meResponse.json();
      if (!meData.logged_in) {
        router.replace("/");
        return;
      }
      setUserEmail(meData.email);

      if (!memoriesResponse.ok) {
        const data = await memoriesResponse.json();
        setError(data.error || "기억을 불러오지 못했습니다.");
        setMemories([]);
        return;
      }

      const memoryData: Memory[] = await memoriesResponse.json();
      setMemories(memoryData);
    } catch (err) {
      console.error(err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const availableSections = useMemo(() => {
    const set = new Set<string>(["General"]);
    memories.forEach((memory) => {
      if (memory.section) {
        set.add(memory.section);
      }
    });
    return Array.from(set).sort();
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      const matchesType =
        typeFilter === MemoryCategory.All
          ? true
          : typeFilter === MemoryCategory.Photo
          ? Boolean(memory.image_filename)
          : !memory.image_filename;

      const resolvedSection = memory.section || "General";
      const matchesSection =
        sectionFilter === "All Sections" || resolvedSection === sectionFilter;

      return matchesType && matchesSection;
    });
  }, [memories, typeFilter, sectionFilter]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  };

  const handleDelete = async (memoryId: number) => {
    if (!confirm("정말로 이 기억을 삭제하시겠습니까?")) return;

    const response = await fetch(`/api/memories/${memoryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "삭제 중 오류가 발생했습니다.");
      return;
    }

    fetchMemories();
  };

  const handleTakeBreak = () => {
    setShowPauseCard(true);
  };

  const handlePlayerClose = () => {
    setSelectedMemory(null);
    setShowPauseCard(false);
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-default)]">
            나의 기억 라이브러리
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            업로드한 사진 · 기록은 모두 계정별로 안전하게 분리됩니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-sm text-[var(--text-muted)]">
              {userEmail}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      <MemoryComposer onCreated={fetchMemories} availableSections={availableSections} />

      <section className="flex flex-wrap items-center gap-2">
        {typeFilters.map((filter) => (
          <Button
            key={filter}
            variant={typeFilter === filter ? "primary" : "ghost"}
            size="sm"
            onClick={() => setTypeFilter(filter)}
          >
            {filter === MemoryCategory.All
              ? "전체"
              : filter === MemoryCategory.Photo
              ? "사진"
              : "텍스트"}
          </Button>
        ))}
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button
          variant={sectionFilter === "All Sections" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setSectionFilter("All Sections")}
        >
          모든 섹션
        </Button>
        {availableSections.map((section) => (
          <Button
            key={section}
            variant={sectionFilter === section ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSectionFilter(section)}
          >
            {section}
          </Button>
        ))}
      </section>

      {loading ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
          기억을 불러오는 중입니다…
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--warn)]">
          {error}
        </div>
      ) : (
        <section>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memoryType={memory.image_filename ? "photo" : "text"}
                title={deriveTitle(memory.content)}
                subtitle={deriveSubtitle(memory.content)}
                thumbnailUrl={composeImageUrl(memory.image_filename)}
                durationLabel={formatKoreanDateTime(memory.created_at)}
                className="cursor-pointer"
                footer={
                  <div className="flex items-center justify-between pt-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-2">
                      <Badge type="neutral" size="sm">
                        {memory.section || "General"}
                      </Badge>
                      개인용 · 비공개
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingMemory(memory);
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(memory.id);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                }
                onClick={() => setSelectedMemory(memory)}
              />
            ))}
          </div>
          {filteredMemories.length === 0 && (
            <div className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-10 text-center text-sm text-[var(--text-muted)]">
              아직 기록된 기억이 없습니다. 위의 폼에서 첫 기억을 남겨보세요.
            </div>
          )}
        </section>
      )}

      {selectedMemory && (
        <MemoryPlayer
          open={Boolean(selectedMemory)}
          mode={selectedMemory.image_filename ? "photo" : "text"}
          title={deriveTitle(selectedMemory.content)}
          description={deriveSubtitle(selectedMemory.content)}
          mediaUrl={composeImageUrl(selectedMemory.image_filename)}
          captions={selectedMemory.content}
          metadata={[
            { label: "섹션", value: selectedMemory.section || "General" },
            { label: "작성일", value: formatKoreanDateTime(selectedMemory.created_at) },
            { label: "공개 범위", value: "Only Me" },
          ]}
          onClose={handlePlayerClose}
          onTakeBreak={handleTakeBreak}
        />
      )}
      {showPauseCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--overlay-scrim)] px-6">
          <PauseCard onResume={() => setShowPauseCard(false)} />
        </div>
      )}

      <EditMemoryModal
        memory={editingMemory}
        availableSections={availableSections}
        onClose={() => setEditingMemory(null)}
        onUpdated={() => {
          setEditingMemory(null);
          fetchMemories();
        }}
      />
    </div>
  );
}

function MemoryComposer({
  onCreated,
  availableSections,
}: {
  onCreated: () => void;
  availableSections: string[];
}) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sectionInput, setSectionInput] = useState<string>(
    availableSections[0] ?? "General",
  );

  useEffect(() => {
    setSectionInput((previous) => {
      if (availableSections.length === 0) {
        return previous || "General";
      }
      if (previous && availableSections.includes(previous)) {
        return previous;
      }
      return availableSections[0];
    });
  }, [availableSections]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() && !file) {
      setStatus("내용 또는 이미지를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setStatus("기록 중입니다…");

    let imageKey: string | null = null;
    if (file) {
      imageKey = await uploadImageToR2(file);
      if (!imageKey) {
        setStatus("이미지 업로드 중 오류가 발생했습니다.");
        setSubmitting(false);
        return;
      }
    }

    const trimmedSection = sectionInput.trim() || "General";

    const formData = new FormData();
    formData.append("content", content);
    if (imageKey) {
      formData.append("image_filename", imageKey);
    }
    formData.append("section", trimmedSection);

    const response = await fetch("/api/memories", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "기록 저장에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    setContent("");
    setFile(null);
    setStatus("기억이 저장되었습니다.");
    setSectionInput(trimmedSection);
    setSubmitting(false);
    onCreated();
  };

  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--elev-1)]">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-default)]">
          새로운 기억 남기기
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          텍스트, 사진을 업로드하면 자동으로 계정에 저장됩니다.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="내용"
          placeholder="기억하고 싶은 순간을 기록하세요…"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="flex flex-col gap-2 text-sm">
          <label className="font-medium text-[var(--text-muted)]">
            섹션
          </label>
          <input
            list="memory-section-options"
            value={sectionInput}
            onChange={(event) => setSectionInput(event.target.value)}
            placeholder="예: 가족, 여행, 편지"
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-default)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:rgba(37,99,235,0.25)]"
          />
          <datalist id="memory-section-options">
            {availableSections.map((section) => (
              <option key={section} value={section} />
            ))}
          </datalist>
          <p className="text-xs text-[var(--text-muted)]">
            섹션을 입력하거나 기존 섹션을 선택해 기록을 정리하세요.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <label className="font-medium text-[var(--text-muted)]">
            이미지 (선택)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const files = event.target.files;
              setFile(files && files.length > 0 ? files[0] : null);
            }}
            className="text-sm text-[var(--text-muted)] file:mr-4 file:rounded-md file:border-0 file:bg-[color:rgba(37,99,235,0.08)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--accent)]"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Cloudflare R2에 암호화된 상태로 저장됩니다.
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? "기록 중…" : "기억 저장"}
          </Button>
        </div>
      </form>
      {status && <p className="text-sm text-[var(--text-muted)]">{status}</p>}
    </section>
  );
}

function EditMemoryModal({
  memory,
  availableSections,
  onClose,
  onUpdated,
}: {
  memory: Memory | null;
  availableSections: string[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [content, setContent] = useState<string>(memory?.content ?? "");
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionInput, setSectionInput] = useState<string>(
    memory?.section || "General",
  );

  useEffect(() => {
    if (memory) {
      setContent(memory.content);
      setReplacementFile(null);
      setError(null);
      setSectionInput(memory.section || "General");
    }
  }, [memory]);

  if (!memory) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    let imageKey = memory.image_filename;

    if (replacementFile) {
      imageKey = await uploadImageToR2(replacementFile);
      if (!imageKey) {
        setSaving(false);
        setError("이미지 업로드에 실패했습니다.");
        return;
      }
    }

    const trimmedSection = sectionInput.trim() || "General";

    const formData = new FormData();
    formData.append("content", content);
    if (imageKey) {
      formData.append("image_filename", imageKey);
    }
    formData.append("section", trimmedSection);

    const response = await fetch(`/api/memories/${memory.id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "수정에 실패했습니다.");
      setSaving(false);
      return;
    }

    setSaving(false);
    onUpdated();
  };

  return (
    <Modal
      open={Boolean(memory)}
      onClose={onClose}
      title="기억 수정하기"
      description="내용을 업데이트하거나 이미지를 교체할 수 있습니다."
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button form="edit-memory-form" type="submit" disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </Button>
        </div>
      }
    >
      <form id="edit-memory-form" onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="내용"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="flex flex-col gap-2 text-sm">
          <label className="font-medium text-[var(--text-muted)]">
            섹션
          </label>
          <input
            list="memory-edit-section-options"
            value={sectionInput}
            onChange={(event) => setSectionInput(event.target.value)}
            placeholder="예: 가족, 여행, 편지"
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-default)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:rgba(37,99,235,0.25)]"
          />
          <datalist id="memory-edit-section-options">
            {availableSections.map((section) => (
              <option key={section} value={section} />
            ))}
          </datalist>
        </div>
        {memory.image_filename && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-muted)]">현재 이미지</p>
            <div className="relative h-48 w-full overflow-hidden rounded-[var(--radius-md)]">
              <Image
                src={composeImageUrl(memory.image_filename)}
                alt="현재 업로드 이미지"
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>
        )}
        <div className="space-y-2 text-sm">
          <label className="font-medium text-[var(--text-muted)]">
            새 이미지로 교체 (선택)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const files = event.target.files;
              setReplacementFile(files && files.length > 0 ? files[0] : null);
            }}
          />
        </div>
        {error && <p className="text-sm text-[var(--warn)]">{error}</p>}
      </form>
    </Modal>
  );
}

function deriveTitle(content: string) {
  const cleaned = content.trim();
  if (!cleaned) return "무제의 기록";
  const firstLine = cleaned.split("\n")[0];
  return firstLine.length > 30 ? `${firstLine.slice(0, 27)}…` : firstLine;
}

function deriveSubtitle(content: string) {
  const cleaned = content.trim();
  if (!cleaned) return "텍스트 없이 이미지로만 구성된 기억";
  if (cleaned.length <= 100) return cleaned;
  return `${cleaned.slice(0, 100)}…`;
}

function composeImageUrl(imageKey: string | null): string {
  if (!imageKey) return "";
  if (imageKey.startsWith("local/")) {
    return `/uploads/${imageKey.replace(/^local\//, "")}`;
  }
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${imageKey}`;
  }
  // 로컬 환경에서 기존 키만 저장된 경우 uploads 폴더를 기본 경로로 사용
  return `/uploads/${imageKey}`;
}

function formatKoreanDateTime(date: string) {
  try {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
}
