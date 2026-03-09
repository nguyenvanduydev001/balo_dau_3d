import BackpackScrollViewer from "@/components/BackpackScrollViewer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-dau-red selection:text-white">
      <BackpackScrollViewer />
    </main>
  );
}
