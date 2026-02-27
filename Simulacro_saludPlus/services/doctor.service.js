const db = require("../config/mysql");
const PatientHistory = require("../models/patientHistory.model");

async function listDoctors(specialty) {
  let query = "SELECT id, name, email, specialty FROM doctors";
  const params = [];

  if (specialty) {
    query += " WHERE specialty = ?";
    params.push(specialty);
  }

  query += " ORDER BY id ASC";

  const [rows] = await db.query(query, params);
  return rows;
}

async function findDoctorById(id) {
  const [rows] = await db.query(
    "SELECT id, name, email, specialty FROM doctors WHERE id = ?",
    [id]
  );

  return rows[0] || null;
}

async function updateDoctorById(id, payload) {
  const currentDoctor = await findDoctorById(id);

  if (!currentDoctor) {
    return null;
  }

  const nextDoctor = {
    name: payload.name ?? currentDoctor.name,
    email: payload.email ?? currentDoctor.email,
    specialty: payload.specialty ?? currentDoctor.specialty,
  };

  await db.query(
    `UPDATE doctors
     SET name = ?, email = ?, specialty = ?
     WHERE id = ?`,
    [nextDoctor.name, nextDoctor.email, nextDoctor.specialty, id]
  );

  if (currentDoctor.name !== nextDoctor.name) {
    const [appointmentRows] = await db.query(
      "SELECT appointment_id FROM appointments WHERE doctor_id = ?",
      [id]
    );

    const appointmentIds = appointmentRows.map((row) => row.appointment_id);

    if (appointmentIds.length > 0) {
      await PatientHistory.updateMany(
        { "appointments.appointmentId": { $in: appointmentIds } },
        { $set: { "appointments.$[item].doctorName": nextDoctor.name } },
        { arrayFilters: [{ "item.appointmentId": { $in: appointmentIds } }] }
      );
    }
  }

  return findDoctorById(id);
}

module.exports = {
  listDoctors,
  findDoctorById,
  updateDoctorById,
};
