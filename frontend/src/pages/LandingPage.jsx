import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container mx-auto flex flex-col items-center px-4 py-16 text-center text-foreground">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Microfinance powered by AI
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Umeed AI helps borrowers access fair micro-loans with transparent
          scoring and faster approvals.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Empowering borrowers and loan officers with responsible underwriting,
          automated risk analysis, and clear repayment journeys.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/borrower-auth">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/admin-auth">Admin Portal</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;


