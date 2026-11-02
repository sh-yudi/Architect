export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
        Architect<span className="text-sky-600">AI</span>
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl">
        Turn your plot dimensions and house wishlist into complete 2D floor plans, 3D models, structural drawings, and municipal approval packages in minutes.
      </p>
      <div className="mt-8">
        <a
          href="/start"
          className="rounded-lg bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Create House Plan
        </a>
      </div>
    </main>
  );
}
