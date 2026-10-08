import type { Metadata } from "next";

import { TemplateDemo } from "@/components/template-demo";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Template preview",
};

const PreviewPage = async ({
  params,
}: {
  params: Promise<{ name: string }>;
}) => {
  const { name } = await params;

  return (
    <main className="bg-background h-svh">
      <TemplateDemo
        className="h-full max-h-none! w-full rounded-none! border-0! shadow-none!"
        name={name}
      />
    </main>
  );
};

export default PreviewPage;
