import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

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
import { DemoBadge } from "@/components/public/DemoBadge";
import { EmptyState, LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { logAudit } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitize";

export const Route = createFileRoute("/painel/campanhas")({
  head: () => ({
    meta: [
      { title: "Campanhas | CampaignPilot" },
      { name: "description", content: "Crie e acompanhe campanhas multicanal da sua organização." },
      { property: "og:title", content: "Campanhas | CampaignPilot" },
      { property: "og:description", content: "Gestão de campanhas multicanal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CampanhasPage,
});

const channels = ["email", "whatsapp", "sms", "push", "multicanal"] as const;
type Channel = (typeof channels)[number];
const channelLabels: Record<Channel, string> = {
  email: "E-mail",
  whatsapp: "WhatsApp",
  sms: "SMS",
  push: "Push",
  multicanal: "Multicanal",
};

const statuses = [
  "rascunho",
  "em_revisao",
  "aprovada",
  "programada",
  "em_execucao",
  "pausada",
  "concluida",
  "cancelada",
] as const;
type Status = (typeof statuses)[number];
const statusLabels: Record<Status, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  aprovada: "Aprovada",
  programada: "Programada",
  em_execucao: "Em execução",
  pausada: "Pausada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

function CampanhasPage() {
  const queryClient = useQueryClient();
  const { organizationId, canEdit } = useOrganization();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<Channel>("email");

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, description, channel, status, objective, starts_at, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (form: FormData) => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      const name = sanitizeText(form.get("name"), 120);
      if (!name) throw new Error("Informe o nome da campanha.");
      const startsAt = String(form.get("starts_at") ?? "");

      const { error } = await supabase.from("campaigns").insert({
        organization_id: organizationId,
        name,
        description: sanitizeText(form.get("description"), 800) || null,
        objective: sanitizeText(form.get("objective"), 160) || null,
        channel,
        status: "rascunho",
        is_simulation: true,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      });
      if (error) throw error;
      await logAudit({ action: "campanha.criada", entity: "campaigns", organizationId });
    },
    onSuccess: () => {
      toast.success("Campanha criada como rascunho (simulação).");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["campaigns", organizationId] });
    },
    onError: (error: Error) => toast.error(error.message ?? "Não foi possível criar a campanha."),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
      if (error) throw error;
      await logAudit({
        action: "campanha.status_alterado",
        entity: "campaigns",
        entityId: id,
        organizationId,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns", organizationId] }),
    onError: () => toast.error("Não foi possível atualizar a campanha."),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas"
        description="Planeje campanhas multicanal. Nesta versão todos os disparos são simulados."
        action={
          canEdit ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="brand">
                  <Megaphone className="size-4" /> Nova campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nova campanha</DialogTitle>
                  <DialogDescription>
                    A campanha é criada em modo simulação — nenhum envio real é realizado.
                  </DialogDescription>
                </DialogHeader>
                <form
                  id="form-campanha"
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createCampaign.mutate(new FormData(event.currentTarget));
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" required maxLength={120} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="objective">Objetivo</Label>
                    <Input
                      id="objective"
                      name="objective"
                      maxLength={160}
                      placeholder="Reativar clientes inativos"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="canal">Canal</Label>
                      <Select value={channel} onValueChange={(value) => setChannel(value as Channel)}>
                        <SelectTrigger id="canal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.map((item) => (
                            <SelectItem key={item} value={item}>
                              {channelLabels[item]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="starts_at">Início previsto</Label>
                      <Input id="starts_at" name="starts_at" type="date" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" name="description" rows={3} maxLength={800} />
                  </div>
                </form>
                <DialogFooter>
                  <Button
                    type="submit"
                    form="form-campanha"
                    variant="brand"
                    disabled={createCampaign.isPending}
                  >
                    {createCampaign.isPending ? "Criando..." : "Criar campanha"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <DemoBadge />

      {isLoading ? (
        <LoadingState label="Carregando campanhas..." />
      ) : (campaigns ?? []).length === 0 ? (
        <EmptyState
          title="Nenhuma campanha ainda"
          description="Crie sua primeira campanha para organizar objetivo, canal e cronograma de execução."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(campaigns ?? []).map((campaign) => (
            <article key={campaign.id} className="card-elevated flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{campaign.name}</h2>
                <Badge variant="secondary">
                  {channelLabels[campaign.channel as Channel] ?? campaign.channel}
                </Badge>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {campaign.description ?? campaign.objective ?? "Sem descrição."}
              </p>
              <p className="text-xs text-muted-foreground">
                Início:{" "}
                {campaign.starts_at
                  ? new Date(campaign.starts_at).toLocaleDateString("pt-BR")
                  : "a definir"}
              </p>
              <div className="mt-auto pt-2">
                {canEdit ? (
                  <Select
                    value={campaign.status}
                    onValueChange={(value) =>
                      updateStatus.mutate({ id: campaign.id, status: value as Status })
                    }
                  >
                    <SelectTrigger className="h-9" aria-label="Alterar status da campanha">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{statusLabels[campaign.status as Status]}</Badge>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}