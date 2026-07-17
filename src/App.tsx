import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "@/pages/HomePage";
import PlayPage from "@/pages/PlayPage";
import ResultPage from "@/pages/ResultPage";
import SharePage from "@/pages/SharePage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/play" component={PlayPage} />
      <Route path="/result" component={ResultPage} />
      <Route path="/run/:id" component={SharePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
          <Router />
        </WouterRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
