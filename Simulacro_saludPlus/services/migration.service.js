const xlsx = require("xlsx");
const db = require("../config/mysql");
const PatientHistory = require("../models/patientHistory.model");

const FIELD_ALIASES = {
  patientName: ["patientname", "nombrepaciente"],
  patientEmail: ["patientemail", "emailpaciente", "correopaciente"],
  patientPhone: ["patientphone", "telefonopaciente", "phonepaciente"],
  patientAddress: ["patientaddress", "direccionpaciente", "addresspaciente"],
  doctorName: ["doctorname", "nombredoctor", "nombremedico"],
  doctorEmail: ["doctoremail", "emaildoctor", "correodoctor", "emailmedico"],
  specialty: ["specialty", "especialidad"],
  insuranceName: ["insurancename", "nombreseguro", "aseguradora"],
  coveragePercentage: ["coveragepercentage", "porcentajecobertura", "cobertura"],
  appointmentId: ["appointmentid", "idcita"],
  appointmentDate: ["appointmentdate", "fechacita"],
  treatmentCode: ["treatmentcode", "codigotratamiento"],
  treatmentDescription: ["treatmentdescription", "descripciontratamiento"],
  treatmentCost: ["treatmentcost", "costotratamiento"],
  amountPaid: ["amountpaid", "montopagado", "pagado"],
};

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeRow(row) {
  const normalized = {};

  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeHeader(key)] = value;
  }

  return normalized;
}

function getField(row, aliases) {
  for (const alias of aliases) {
    const value = row[alias];

    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return value;
    }
  }

  return null;
}

function normalizeEmail(value) {
  if (!value) return null;
  return String(value).trim().toLowerCase();
}

function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const parsed = String(value).trim();
  return parsed === "" ? null : parsed;
}

function normalizeDate(value) {
  if (!value) return null;

  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const clean = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/[^0-9,.-]/g, "");

  if (!clean) return 0;

  const normalized = clean.includes(",") && !clean.includes(".")
    ? clean.replace(",", ".")
    : clean.replace(/,/g, "");

  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

async function upsertPatient(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO patients (name, email, phone, address)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       id = LAST_INSERT_ID(id),
       name = VALUES(name),
       phone = VALUES(phone),
       address = VALUES(address)`,
    [data.name, data.email, data.phone, data.address]
  );
  return result.insertId;
}

async function upsertDoctor(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO doctors (name, email, specialty)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       id = LAST_INSERT_ID(id),
       name = VALUES(name),
       specialty = VALUES(specialty)`,
    [data.name, data.email, data.specialty]
  );
  return result.insertId;
}

async function upsertInsurance(connection, data) {
  if (!data.name) return null;

  const [result] = await connection.query(
    `INSERT INTO insurances (name, coverage_percentage)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE
       id = LAST_INSERT_ID(id),
       coverage_percentage = VALUES(coverage_percentage)`,
    [data.name, data.coveragePercentage]
  );
  return result.insertId;
}

async function upsertAppointment(connection, data) {
  await connection.query(
    `INSERT INTO appointments
      (appointment_id, appointment_date, patient_id, doctor_id, insurance_id, treatment_code, treatment_description, treatment_cost, amount_paid)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       appointment_date = VALUES(appointment_date),
       patient_id = VALUES(patient_id),
       doctor_id = VALUES(doctor_id),
       insurance_id = VALUES(insurance_id),
       treatment_code = VALUES(treatment_code),
       treatment_description = VALUES(treatment_description),
       treatment_cost = VALUES(treatment_cost),
       amount_paid = VALUES(amount_paid)`,
    [
      data.appointmentId,
      data.appointmentDate,
      data.patientId,
      data.doctorId,
      data.insuranceId,
      data.treatmentCode,
      data.treatmentDescription,
      data.treatmentCost,
      data.amountPaid,
    ]
  );
}

async function upsertPatientHistory(data) {
  await PatientHistory.updateOne(
    { patientEmail: data.patientEmail },
    {
      $set: { patientName: data.patientName },
      $pull: { appointments: { appointmentId: data.appointmentId } },
    },
    { upsert: true }
  );

  await PatientHistory.updateOne(
    { patientEmail: data.patientEmail },
    {
      $push: {
        appointments: {
          appointmentId: data.appointmentId,
          date: data.appointmentDate,
          doctorName: data.doctorName,
          specialty: data.specialty,
          treatmentDescription: data.treatmentDescription,
          amountPaid: data.amountPaid,
        },
      },
    }
  );
}

async function upsertPatientHistoryWithRetry(data, attempts = 3) {
  let lastError = null;

  for (let i = 0; i < attempts; i += 1) {
    try {
      await upsertPatientHistory(data);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function parseRow(rawRow) {
  const row = normalizeRow(rawRow);

  return {
    patientName: normalizeText(getField(row, FIELD_ALIASES.patientName)),
    patientEmail: normalizeEmail(getField(row, FIELD_ALIASES.patientEmail)),
    patientPhone: normalizeText(getField(row, FIELD_ALIASES.patientPhone)),
    patientAddress: normalizeText(getField(row, FIELD_ALIASES.patientAddress)),
    doctorName: normalizeText(getField(row, FIELD_ALIASES.doctorName)),
    doctorEmail: normalizeEmail(getField(row, FIELD_ALIASES.doctorEmail)),
    specialty: normalizeText(getField(row, FIELD_ALIASES.specialty)),
    insuranceName: normalizeText(getField(row, FIELD_ALIASES.insuranceName)),
    coveragePercentage: normalizeNumber(getField(row, FIELD_ALIASES.coveragePercentage)),
    appointmentId: normalizeText(getField(row, FIELD_ALIASES.appointmentId)),
    appointmentDate: normalizeDate(getField(row, FIELD_ALIASES.appointmentDate)),
    treatmentCode: normalizeText(getField(row, FIELD_ALIASES.treatmentCode)),
    treatmentDescription: normalizeText(getField(row, FIELD_ALIASES.treatmentDescription)),
    treatmentCost: normalizeNumber(getField(row, FIELD_ALIASES.treatmentCost)),
    amountPaid: normalizeNumber(getField(row, FIELD_ALIASES.amountPaid)),
  };
}

function isValidRow(row) {
  return (
    row.patientName &&
    row.patientEmail &&
    row.doctorName &&
    row.doctorEmail &&
    row.specialty &&
    row.appointmentId &&
    row.appointmentDate &&
    row.treatmentCode &&
    row.treatmentDescription
  );
}

async function processExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(firstSheet, { defval: null });

  const connection = await db.getConnection();

  let processedRows = 0;
  let skippedRows = 0;
  const errors = [];

  try {
    for (let index = 0; index < rows.length; index += 1) {
      const rowNumber = index + 2;
      const data = parseRow(rows[index]);

      if (!isValidRow(data)) {
        skippedRows += 1;
        errors.push({ row: rowNumber, message: "Fila incompleta o con formato inválido" });
        continue;
      }

      let transactionOpen = false;

      try {
        await connection.beginTransaction();
        transactionOpen = true;

        const patientId = await upsertPatient(
          connection,
          {
            name: data.patientName,
            email: data.patientEmail,
            phone: data.patientPhone,
            address: data.patientAddress,
          }
        );

        const doctorId = await upsertDoctor(
          connection,
          {
            name: data.doctorName,
            email: data.doctorEmail,
            specialty: data.specialty,
          }
        );

        const insuranceId = await upsertInsurance(
          connection,
          {
            name: data.insuranceName,
            coveragePercentage: data.coveragePercentage,
          }
        );

        await upsertAppointment(connection, {
          appointmentId: data.appointmentId,
          appointmentDate: data.appointmentDate,
          patientId,
          doctorId,
          insuranceId,
          treatmentCode: data.treatmentCode,
          treatmentDescription: data.treatmentDescription,
          treatmentCost: data.treatmentCost,
          amountPaid: data.amountPaid,
        });

        await upsertPatientHistoryWithRetry({
          patientEmail: data.patientEmail,
          patientName: data.patientName,
          appointmentId: data.appointmentId,
          appointmentDate: data.appointmentDate,
          doctorName: data.doctorName,
          specialty: data.specialty,
          treatmentDescription: data.treatmentDescription,
          amountPaid: data.amountPaid,
        });

        await connection.commit();
        transactionOpen = false;

        processedRows += 1;
      } catch (error) {
        if (transactionOpen) {
          await connection.rollback();
        }
        skippedRows += 1;
        errors.push({ row: rowNumber, message: error.message });
      }
    }
  } finally {
    connection.release();
  }

  return {
    totalRows: rows.length,
    processedRows,
    skippedRows,
    errors,
  };
}

module.exports = { processExcel };
