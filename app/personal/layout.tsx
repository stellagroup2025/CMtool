import { PersonalNavSidebar, PersonalNavMobile } from "@/components/personal-nav"
import { OnboardingAlert } from "@/components/onboarding-alert"
import { BackgroundTasksProvider } from "@/contexts/background-tasks-context"
import { BackgroundTasksPanel } from "@/components/background-tasks-panel"

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BackgroundTasksProvider>
      <div className="min-h-screen flex">
        <PersonalNavSidebar />
        <main className="flex-1 overflow-auto page-transition">
          <OnboardingAlert />
          {children}
        </main>
        <PersonalNavMobile />
        <BackgroundTasksPanel />
      </div>
    </BackgroundTasksProvider>
  )
}
