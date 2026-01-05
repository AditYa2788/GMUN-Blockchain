import { Award, Clock, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { doctorAPI } from "../services/api.js";

function DoctorInfo({ doctorId }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctorId) {
      loadDoctorInfo(doctorId);
    } else {
      setDoctor(null);
    }
  }, [doctorId]);

  const loadDoctorInfo = async (id) => {
    setLoading(true);
    try {
      const { doctors } = await doctorAPI.getDoctors();
      const found = doctors.find(d => d.user_id === parseInt(id));
      setDoctor(found || null);
    } catch (error) {
      console.error('Failed to load doctor info:', error);
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      ) : doctor ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {doctor.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {doctor.specialization}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Experience</p>
                <p className="text-sm text-gray-600">{doctor.experience_years} years</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Availability
                </p>
                <p className="text-sm text-gray-600">{doctor.availability}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-600 space-y-2">
                <p>Appointment duration: 30 minutes</p>
                <p>
                  Cancellation policy: Cancel up to 24 hours before your
                  scheduled appointment without penalty.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Select a doctor to view details
          </p>
        </div>
      )}
    </div>
  );
}

export default DoctorInfo