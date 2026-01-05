import React, { useState, useEffect } from "react";
import { Pill, FileText, CheckCircle, Clock, Hash, Download, QrCode } from "lucide-react";
import { patientAPI } from "../services/api.js";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRxId, setSelectedRxId] = useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const { prescriptions: rx } = await patientAPI.getPrescriptions();
      setPrescriptions(rx || []);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Find the selected prescription object
  const selectedRx = prescriptions.find(rx => rx.prescription_token_id === selectedRxId);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Medical Records Vault
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Access your decentralized prescriptions and verifiable health credentials.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Prescription List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                Recent Records
              </h3>
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No prescriptions found</div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div
                      key={rx.prescription_token_id}
                      onClick={() => setSelectedRxId(rx.prescription_token_id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                        selectedRxId === rx.prescription_token_id 
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <Pill className={selectedRxId === rx.prescription_token_id ? "text-blue-600" : "text-gray-400"} size={18} />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                          rx.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {rx.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">{rx.drug_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{rx.doctor_name}</span>
                        <span>•</span>
                        <span>{new Date(rx.issue_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Prescription Details */}
            <div className="lg:col-span-2">
              {selectedRx ? (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Detail Header */}
                  <div className="bg-slate-900 p-8 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                          <Hash size={16} />
                          <span className="text-xs font-mono uppercase tracking-tighter">Token ID: {selectedRx.prescription_token_id}</span>
                        </div>
                        <h2 className="text-3xl font-bold">{selectedRx.drug_name}</h2>
                        <p className="text-slate-400 mt-1">{selectedRx.type || 'Prescription'} • {selectedRx.dosage}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-lg">
                        <QrCode size={64} className="text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Detail Body */}
                  <div className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                          <Clock size={14} /> Usage Instructions
                        </h4>
                        <p className="text-gray-800 leading-relaxed italic">
                          "{selectedRx.instructions || 'Follow doctor\'s instructions'}"
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                          <CheckCircle size={14} /> Issuing Doctor
                        </h4>
                        <p className="text-gray-800 font-medium">{selectedRx.doctor_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedRx.specialization} • Verified Medical License</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">IPFS Content Hash</p>
                          <p className="text-xs font-mono text-gray-600 truncate max-w-50 md:max-w-md">
                            {selectedRx.ipfs_hash || 'Not available'}
                          </p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-125 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 bg-gray-50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <FileText size={48} className="text-gray-200" />
                  </div>
                  <p className="font-medium">Select a record to view details</p>
                  <p className="text-xs mt-1">All data is fetched from the MedChain smart contract</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}