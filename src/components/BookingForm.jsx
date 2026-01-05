import { Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { doctorAPI, patientAPI } from "../services/api.js";

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"];

function BookingForm({onDoctorSelect}) {
 const [departments, setDepartments] = useState([]);
 const [doctors, setDoctors] = useState([]);
 const [loading, setLoading] = useState(false);
 const [selectedDepartment, setSelectedDepartment] = useState("");
 const [selectedDoctor, setSelectedDoctor] = useState("");
 const [selectedDate, setSelectedDate] = useState("");
 const [selectedTime, setSelectedTime] = useState("");
 const [reason, setReason] = useState("");
 const [submitStatus, setSubmitStatus] = useState(null);

 // Fetch departments on mount
 useEffect(() => {
   loadDepartments();
 }, []);

 // Fetch doctors when department changes
 useEffect(() => {
   if (selectedDepartment) {
     loadDoctors(selectedDepartment);
   } else {
     setDoctors([]);
   }
 }, [selectedDepartment]);

 const loadDepartments = async () => {
   try {
     const { departments: depts } = await doctorAPI.getDepartments();
     setDepartments(depts);
   } catch (error) {
     console.error('Failed to load departments:', error);
   }
 };

 const loadDoctors = async (department) => {
   try {
     const { doctors: docs } = await doctorAPI.getDoctors({ department });
     setDoctors(docs);
   } catch (error) {
     console.error('Failed to load doctors:', error);
   }
 };

const availableDoctors = doctors;

 const isFormValid =
   selectedDepartment && selectedDoctor && selectedDate && selectedTime;


 const handleSubmit = async () => {
   if (!isFormValid) return;

   setLoading(true);
   setSubmitStatus(null);

   try {
     const payload = {
       doctor_id: parseInt(selectedDoctor),
       department: selectedDepartment,
       appointment_date: selectedDate,
       appointment_time: selectedTime,
       reason,
     };

     await patientAPI.bookAppointment(payload);
     setSubmitStatus({ type: 'success', message: 'Appointment booked successfully!' });
     
     // Reset form
     setSelectedDepartment("");
     setSelectedDoctor("");
     setSelectedDate("");
     setSelectedTime("");
     setReason("");
   } catch (error) {
     setSubmitStatus({ type: 'error', message: error.message || 'Failed to book appointment' });
   } finally {
     setLoading(false);
   }
 };


 return (
   <div className="bg-white rounded-lg border border-gray-200 p-6">
     <div className="space-y-6">
       <div>
         <label className="block text-sm text-gray-700 mb-2">
           Select Department
         </label>
         <select
           value={selectedDepartment}
           onChange={(e) => {
             setSelectedDepartment(e.target.value);
             setSelectedDoctor("");
           }}
           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         >
           <option value="">Choose a department</option>
           {departments.map((dept) => (
             <option key={dept} value={dept}>
               {dept}
             </option>
           ))}
         </select>
       </div>
       <div>
         <label className="block text-sm text-gray-700 mb-2">
           Select Doctor
         </label>
         <select
           value={selectedDoctor}
           onChange={(e) => {
             setSelectedDoctor(e.target.value);
             onDoctorSelect(e.target.value);
           }}
           disabled={!selectedDepartment || availableDoctors.length === 0}
           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50"
         >
           <option value="">Choose a doctor</option>
           {availableDoctors.map((doctor) => (
             <option key={doctor.user_id} value={doctor.user_id}>
               {doctor.name}
             </option>
           ))}
         </select>
       </div>
       <div>
         <label className="block text-sm text-gray-700 mb-2">
           <Calendar className="inline w-4 h-4 mr-1" />
           Select Date
         </label>
         <input
           type="date"
           value={selectedDate}
           min={new Date().toISOString().split("T")[0]}
           onChange={(e) => setSelectedDate(e.target.value)}
           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
       </div>
       <div>
         <label className="block text-sm text-gray-700 mb-2">
           <Clock className="inline w-4 h-4 mr-1" />
           Select Time Slot
         </label>
         <div className="grid grid-cols-3 gap-2">
           {timeSlots.map((slot) => (
             <button
               key={slot}
               disabled={!selectedDate}
               onClick={() => setSelectedTime(slot)}
               className={`px-4 py-2 text-sm rounded-full border ${
                 selectedTime === slot
                   ? "bg-blue-600 text-white border-blue-600"
                   : "bg-white text-gray-700 border-gray-300"
               } disabled:opacity-40`}
             >
               {slot}
             </button>
           ))}
         </div>
       </div>
       <div>
         <label className="block text-sm text-gray-700 mb-2">
           Reason for Visit <span className="text-gray-400">(Optional)</span>
         </label>
         <textarea
           value={reason}
           onChange={(e) => setReason(e.target.value)}
           rows={4}
           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none"
         />
       </div>
       {submitStatus && (
         <div className={`p-3 rounded-lg ${
           submitStatus.type === 'success' 
             ? 'bg-green-50 text-green-700 border border-green-200'
             : 'bg-red-50 text-red-700 border border-red-200'
         }`}>
           {submitStatus.message}
         </div>
       )}
       <button
         disabled={!isFormValid || loading}
         onClick={handleSubmit}
         className={`w-full py-3 rounded-lg ${
           isFormValid && !loading
             ? "bg-blue-600 text-white hover:bg-blue-700"
             : "bg-gray-200 text-gray-400 cursor-not-allowed"
         }`}
       >
         {loading ? 'Booking...' : 'Book Appointment'}
       </button>
     </div>
   </div>
 );
}

export default BookingForm
