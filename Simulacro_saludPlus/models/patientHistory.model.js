const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true },
    date: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    treatmentDescription: { type: String, required: true },
    amountPaid: { type: Number, required: true },
  },
  { _id: false }
);

const patientHistorySchema = new mongoose.Schema(
  {
    patientEmail: { type: String, required: true, unique: true, index: true },
    patientName: { type: String, required: true },
    appointments: { type: [appointmentSchema], default: [] },
  },
  { collection: "patient_histories", timestamps: true }
);

patientHistorySchema.index({ "appointments.appointmentId": 1 });

module.exports = mongoose.model("PatientHistory", patientHistorySchema);
