import DiscoveryChat from './components/DiscoveryChat';
import BrandIdentityBoard from './components/BrandIdentityBoard';

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-black text-white overflow-hidden">
      {/* Left Panel: Discovery Chat (35% width on large screens) */}
      <section className="w-full md:w-[40%] lg:w-[35%] h-full border-r border-slate-800">
        <DiscoveryChat />
      </section>

      {/* Right Panel: Brand Identity Board (Remaining width) */}
      <section className="flex-1 h-full bg-slate-950">
        <BrandIdentityBoard />
      </section>
    </main>
  );
}
