import { useState } from "react";
import BookingForm from "./BookingForm";
import DoctorInfo from "./DoctorInfo";

function Appointments() {
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Book an Appointment
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Select a doctor and preferred time
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2">
              <BookingForm onDoctorSelect={setSelectedDoctorId} />
            </div>
            <div className="lg:col-span-1">
              <DoctorInfo doctorId={selectedDoctorId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Appointments