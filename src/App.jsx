import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Appointments from "./components/Appointments";
import Prescriptions from "./components/Prescriptions";
import Profile from "./components/Profile";

function App() {
  // 1. Setup the state to track navigation
  const [activeTab, setActiveTab] = useState("appointments");

  // 2. Logic to determine which component to show
  const renderComponent = () => {
    switch (activeTab) {
      case "appointments":
        return <Appointments />;
      case "prescriptions":
        return <Prescriptions />;
      case "profile":
        return <Profile />;
      default:
        return <Appointments />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 3. Pass state and setter to Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 4. Display the selected component */}
      <main className="animate-in fade-in duration-500">
        {renderComponent()}
      </main>
    </div>
  );
}

export default App;