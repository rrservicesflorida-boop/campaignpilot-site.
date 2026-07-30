import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { logAudit } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitize";

export const Route = createFileRoute("/painel/listas")({
  head: () => ({
    meta: [
      { title: "Listas e segmentos | CampaignPilot" },
      { name: "description", content: "Organize seus contatos em listas e segmentos reutilizáveis." },
      { property: "og:title", content: "Listas e segmentos | CampaignPilot" },
      { property: "og:description", content: "Listas de contatos da organização." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ListasPage,
});

function ListasPage() {
  const queryClient = useQueryClient();
  const { organizationId, canEdit } = useOrganization();
  const [open, setOpen] = useState(false);

  const { data: lists, isLoading } = useQuery({
    queryKey: ["contact-lists", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_lists")
        .select("id, name, description, created_at, contact_list_members(count)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createList = useMutation({
    mutationFn: async (form: FormData) => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      const name = sanitizeText(form.get("name"), 120);
      if (!name) throw new Error("Informe o nome da lista.");
      const { error } = await supabase.from("contact_lists").insert({
        organization_id: organizationId,
        name,
        description: sanitizeText(form.get("description"), 500) || null,
      });
      if (error) throw error;
      await logAudit({ action: "lista.criada", entity: "contact_lists", organizationId });
    },
    onSuccess: () => {
      toast.success("Lista criada.");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contact-lists", organizationId] });
    },
    onError: (error: Error) => toast.error(error.message ?? "Não foi possível criar a lista."),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listas e segmentos"
        description="Agrupe contatos para reutilizar em campanhas e automações."
        action={
          canEdit ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="brand">
                  <ListPlus className="size-4" /> Nova lista
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova lista</DialogTitle>
                  <DialogDescription>
                    As listas são isoladas por organização e respeitam a base de descadastro.
                  </DialogDescription>
                </DialogHeader>
                <form
                  id="form-lista"
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createList.mutate(new FormData(event.currentTarget));
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" required maxLength={120} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" name="description" rows={3} maxLength={500} />
                  </div>
                </form>
                <DialogFooter>
                  <Button
                    type="submit"
                    form="form-lista"
                    variant="brand"
                    disabled={createList.isPending}
                  >
                    {createList.isPending ? "Criando..." : "Criar lista"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      {isLoading ? (
        <LoadingState label="Carregando listas..." />
      ) : (lists ?? []).length === 0 ? (
        <EmptyState
          title="Nenhuma lista criada"
          description="Crie listas como “Clientes ativos” ou “Leads do evento” para segmentar seus envios."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(lists ?? []).map((list) => {
            const members =
              (list.contact_list_members as unknown as { count: number }[] | null)?.[0]?.count ?? 0;
            return (
              <article key={list.id} className="card-elevated p-5">
                <h2 className="text-base font-semibold text-foreground">{list.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {list.description ?? "Sem descrição."}
                </p>
                <p className="mt-4 text-sm font-medium text-brand">
                  {members} {members === 1 ? "contato" : "contatos"}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}