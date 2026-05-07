import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import api from "@/lib/api";
import { CompanyDashboardContent } from "./CompanyDashboardContent";
import { UserCompanyAccessRequest } from "../forms/UserCompanyAccessRequest";

interface DashBoardData {
  totalProducts: number,
  activeWebhooks: number,
  monthlyUpdates: number,
  userEngagement: number,
}

const defaultDashBoardData = {
  totalProducts: 0,
  activeWebhooks: 0,
  monthlyUpdates: 0,
  userEngagement: 0,
}

export function CompanyDashboard() {
  const user = useUser();
  const [dashboardData, setDashboardData] = useState<DashBoardData>(defaultDashBoardData);
  const hasCompanies = Boolean(user?.user?.activeCompanies?.length);

  const handleSubmit = async (formData: any) => {
    try {
      const response = await api.post("companies/submit", formData);

      console.log(response.data.message);
    } catch (error) {

    }
  }

  const fetchDashData = async () => {
    try {
      const response = await api.get("/companies/dashboard-data");

      setDashboardData(response.data);
    } catch (error) {

    }
  };

  useEffect(() => {
    fetchDashData();
    console.log(hasCompanies)
  }, []);


  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {hasCompanies ? (
        <CompanyDashboardContent dashboardData={dashboardData} />
      ) : (
        <UserCompanyAccessRequest>

        </UserCompanyAccessRequest>
      )}
    </div>
  );
}