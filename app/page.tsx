import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";
import { getTodayQuestion } from "@/lib/questions";

interface HomeProps {
  searchParams: Promise<{ date?: string }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const dateOverride =
    process.env.NODE_ENV === "development" ? params.date : undefined;
  const question = getTodayQuestion(dateOverride);

  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header
        questionNumber={question.questionNumber}
        category={question.category}
      />
      <div className="w-full max-w-game px-5">
        <GameBoard question={question} />
      </div>
    </main>
  );
}
