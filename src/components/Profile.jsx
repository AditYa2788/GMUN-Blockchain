import { useState, useEffect } from "react";
import { patientAPI } from "../services/api.js";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  Users, 
  Edit3, 
  Save, 
  X 
} from "lucide-react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "Male",
    address: "",
    
    // Medical Information
    blood_type: "",
    height: "",
    weight: "",
    allergies: "",
    chronic_conditions: "",
    current_medications: "",
    
    // Emergency Contact
    emergency_name: "",
    emergency_relation: "",
    emergency_phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { profile } = await patientAPI.getProfile();
      if (profile) {
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          date_of_birth: profile.date_of_birth || "",
          gender: profile.gender || "Male",
          address: profile.address || "",
          blood_type: profile.blood_type || "",
          height: profile.height || "",
          weight: profile.weight || "",
          allergies: profile.allergies || "",
          chronic_conditions: profile.chronic_conditions || "",
          current_medications: profile.current_medications || "",
          emergency_name: profile.emergency_name || "",
          emergency_relation: profile.emergency_relation || "",
          emergency_phone: profile.emergency_phone || "",
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await patientAPI.updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values if needed
  };

  const ProfileSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InputField = ({ label, field, type = "text", placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {isEditing ? (
        type === "select" ? (
          <select
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
          {formData[field] || "Not specified"}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your personal and medical information
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <ProfileSection title="Personal Information" icon={User}>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading profile...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="First Name" field="first_name" />
                  <InputField label="Last Name" field="last_name" />
                </div>
                <InputField label="Email Address" field="email" type="email" />
                <InputField label="Phone Number" field="phone" type="tel" />
                <InputField label="Date of Birth" field="date_of_birth" type="date" />
                <InputField label="Gender" field="gender" type="select" />
                <InputField label="Address" field="address" type="textarea" />
              </div>
            )}
          </ProfileSection>

          {/* Medical Information */}
          <ProfileSection title="Medical Information" icon={Heart}>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading profile...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Blood Type" field="blood_type" />
                  <InputField label="Height" field="height" />
                </div>
                <InputField label="Weight" field="weight" />
                <InputField 
                  label="Allergies" 
                  field="allergies" 
                  type="textarea"
                  placeholder="List any known allergies..."
                />
                <InputField 
                  label="Chronic Conditions" 
                  field="chronic_conditions" 
                  type="textarea"
                  placeholder="List any chronic medical conditions..."
                />
                <InputField 
                  label="Current Medications" 
                  field="current_medications" 
                  type="textarea"
                  placeholder="List current medications and dosages..."
                />
              </div>
            )}
          </ProfileSection>

          {/* Emergency Contact */}
          <ProfileSection title="Emergency Contact" icon={AlertTriangle}>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading profile...</div>
            ) : (
              <div className="space-y-4">
                <InputField label="Full Name" field="emergency_name" />
                <InputField label="Relationship" field="emergency_relation" />
                <InputField label="Phone Number" field="emergency_phone" type="tel" />
              </div>
            )}
          </ProfileSection>
        </div>

        {/* Additional Information Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Note</p>
              <p>
                Please ensure all medical information is accurate and up-to-date. 
                This information helps healthcare providers give you better care during emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;