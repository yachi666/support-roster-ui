import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout/AppLayout";
import { OverviewDashboard } from "./pages/OverviewDashboard";
import { MonthlyRosterPlanner } from "./pages/MonthlyRosterPlanner";
import { StaffDirectory } from "./pages/StaffDirectory";
import { ShiftDefinitions } from "./pages/ShiftDefinitions";
import { TeamMapping } from "./pages/TeamMapping";
import { ImportExportCenter } from "./pages/ImportExportCenter";
import { ValidationCenter } from "./pages/ValidationCenter";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: OverviewDashboard },
      { path: "roster", Component: MonthlyRosterPlanner },
      { path: "staff", Component: StaffDirectory },
      { path: "shifts", Component: ShiftDefinitions },
      { path: "teams", Component: TeamMapping },
      { path: "import-export", Component: ImportExportCenter },
      { path: "validation", Component: ValidationCenter },
    ],
  },
]);
