import DashboardLayout from "../components/DashboardLayout";
import ApplicantSideNavLinks from "./ApplicantSideNavLinks";

export default function ApplicantDashboard() {
  
  return (
    <DashboardLayout SideNavigation={ApplicantSideNavLinks} />
  )
}
