import { RibbonStage } from "@/components/RibbonStage";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <main className="page-shell">
      <RibbonStage />
      <section className="waitlist-content" aria-labelledby="waitlist-heading">
        <h1 id="waitlist-heading">
          EARLY ACCESS TO THE CRAZY GOOD COMMUNITY
        </h1>
        <WaitlistForm />
      </section>
    </main>
  );
}
