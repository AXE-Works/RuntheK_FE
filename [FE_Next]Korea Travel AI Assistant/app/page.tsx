export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4 bg-background text-foreground p-8 min-h-screen">
      <h1 className="text-2xl font-bold">Tailwind v4 OK</h1>
      <p className="text-muted-foreground">
        @theme inline 변수가 적용되면 색상이 정상
      </p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
        Test
      </button>
    </div>
  );
}
