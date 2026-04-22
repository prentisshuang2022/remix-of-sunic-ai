import { Sparkles } from "lucide-react";
import { PageHeader } from "./PageHeader";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  hint?: string;
}

export function PlaceholderPage({ title, description, hint }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col">
      <PageHeader title={title} description={description} />
      <div className="p-6">
        <div className="rounded-xl border border-dashed bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-base font-medium">页面骨架已就绪</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hint ?? "告诉我「实现这一页」，我将按原型 1:1 还原界面与交互。"}
          </p>
        </div>
      </div>
    </div>
  );
}
