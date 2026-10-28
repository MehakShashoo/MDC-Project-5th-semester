import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar, NavTab } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { AnalyzerPage } from "./pages/AnalyzerPage";
import { ModelInsightsPage } from "./pages/ModelInsightsPage";
import { AccessPage } from "./pages/AccessPage";

const employeeTabs: NavTab[] = ["home", "dashboard", "reviews", "analyzer", "model"];

function AppContent() {
  const [isEmployee, setIsEmployee] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>("access");
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);

  const handleNavigate = (tab: NavTab, params?: { productId?: number }) => {
    if (employeeTabs.includes(tab) && !isEmployee) {
      setCurrentTab("access");
      return;
    }
    if (params?.productId !== undefined) {
      setSelectedProductId(params.productId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRoleSelect = (role: "customer" | "employee") => {
    const employee = role === "employee";
    setIsEmployee(employee);
    setCurrentTab(employee ? "dashboard" : "feedback");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar
          currentTab={currentTab}
          isEmployee={isEmployee}
          onNavigate={handleNavigate}
          onSignOut={() => {
            setIsEmployee(false);
            setCurrentTab("access");
          }}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {currentTab === "access" && <AccessPage onSelectRole={handleRoleSelect} />}

          {currentTab === "feedback" && (
            <FeedbackPage
              initialProductId={selectedProductId}
              onNavigate={handleNavigate}
            />
          )}

          {isEmployee && currentTab === "home" && <HomePage onNavigate={handleNavigate} />}

          {isEmployee && currentTab === "dashboard" && (
            <DashboardPage
              initialProductId={selectedProductId}
              onNavigate={handleNavigate}
            />
          )}

          {isEmployee && currentTab === "reviews" && (
            <ReviewsPage initialProductId={selectedProductId} />
          )}

          {isEmployee && currentTab === "analyzer" && <AnalyzerPage />}

          {isEmployee && currentTab === "model" && <ModelInsightsPage />}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <AppContent />
  );
}

export default App;
