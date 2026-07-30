import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { logAudit } from "@/lib/audit";
import { isValidEmail, normalizeEmail, sanitizeText } from "@/lib/sanitize";

export const Route = createFileRoute("/painel/leads")({
  head: () => ({
    meta: [
      { title: "Leads | CampaignPilot" },
      { name: "description", content: "Capture, organize e qualifique os leads da sua operação." },
      { property: "og:title", content: "Leads | CampaignPilot" },
      { property: "og:description", content: "Gestão de leads da organização." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadsPage,
});

const statusOptions = [
  "novo",
  "contatado",
  "qualificado",
  "oportunidade",
  "cliente",
  "perdido",
  "descadastrado",
] as const;

type LeadStatus = (typeof statusOptions)[number];

const statusLabels: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  oportunidade: "Oportunidade",
  cliente: "Cliente",
  perdido: "Perdido",
  descadastrado: "Descadastrado",
};

function LeadsPage() {
  const queryClient = useQueryClient();
  const { organizationId, canEdit } = useOrganization();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | LeadStatus>("todos");
  const [open, setOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<LeadStatus>("novo");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, company, status, source, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (leads ?? []).filter((lead) => {
      const matchStatus = statusFilter === "todos" || lead.status === statusFilter;
      const matchTerm =
        !term ||
        [lead.full_name, lead.email, lead.company].some((field) =>
          (field ?? "").toLowerCase().includes(term),
        );
      return matchStatus && matchTerm;
    });
  }, [leads, search, statusFilter]);

  const createLead = useMutation({
    mutationFn: async (form: FormData) => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      const email = normalizeEmail(form.get("email"));
      const fullName = sanitizeText(form.get("full_name"), 120);
      if (!fullName) throw new Error("Informe o nome do lead.");
      if (email && !isValidEmail(email)) throw new Error("E-mail inválido.");

      const { error } = await supabase.from("leads").insert({
        organization_id: organizationId,
        full_name: fullName,
        email: email || null,
        phone: sanitizeText(form.get("phone"), 32) || null,
        company: sanitizeText(form.get("company"), 120) || null,
        source: sanitizeText(form.get("source"), 60) || "manual",
        notes: sanitizeText(form.get("notes"), 1000) || null,
        status: formStatus,
      });
      if (error) throw error;
      await logAudit({ action: "lead.criado", entity: "leads", organizationId });
    },
    onSuccess: () => {
      toast.success("Lead cadastrado.");
      setOpen(false);
      setFormStatus("novo");
      queryClient.invalidateQueries({ queryKey: ["leads", organizationId] });
    },
    onError: (error: Error) => toast.error(error.message ?? "Não foi possível salvar o lead."),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
      await logAudit({ action: "lead.status_alterado", entity: "leads", entityId: id, organizationId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", organizationId] }),
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  const removeLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leads")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await logAudit({ action: "lead.removido", entity: "leads", entityId: id, organizationId });
    },
    onSuccess: () => {
      toast.success("Lead removido.");
      queryClient.invalidateQueries({ queryKey: ["leads", organizationId] });
    },
    onError: () => toast.error("Não foi possível remover o lead."),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Capture, organize e acompanhe a qualificação da sua base."
        action={
          canEdit ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="brand">
                  <UserPlus className="size-4" /> Novo lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Novo lead</DialogTitle>
                  <DialogDescription>
                    Cadastre manualmente um contato. Somente sua organização enxerga estes dados.
                  </DialogDescription>
                </DialogHeader>
                <form
                  id="form-lead"
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createLead.mutate(new FormData(event.currentTarget));
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Nome completo</Label>
                    <Input id="full_name" name="full_name" required maxLength={120} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" name="email" type="email" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" name="phone" maxLength={32} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input id="company" name="company" maxLength={120} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="source">Origem</Label>
                      <Input id="source" name="source" maxLength={60} placeholder="site, evento..." />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status-novo">Status</Label>
                    <Select
                      value={formStatus}
                      onValueChange={(value) => setFormStatus(value as LeadStatus)}
                    >
                      <SelectTrigger id="status-novo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" name="notes" rows={3} maxLength={1000} />
                  </div>
                </form>
                <DialogFooter>
                  <Button
                    type="submit"
                    form="form-lead"
                    variant="brand"
                    disabled={createLead.isPending}
                  >
                    {createLead.isPending ? "Salvando..." : "Salvar lead"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa"
            className="pl-9"
            aria-label="Buscar leads"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
        >
          <SelectTrigger className="sm:w-56" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState label="Carregando leads..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          description="Cadastre seu primeiro contato ou ajuste os filtros de busca para ver resultados."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Origem</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{lead.full_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <p>{lead.email ?? "—"}</p>
                      <p className="text-xs">{lead.phone ?? ""}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary">{lead.source ?? "manual"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {canEdit ? (
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            updateStatus.mutate({ id: lead.id, status: value as LeadStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-40" aria-label="Alterar status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {statusLabels[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{statusLabels[lead.status as LeadStatus]}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remover ${lead.full_name}`}
                          onClick={() => removeLead.mutate(lead.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}