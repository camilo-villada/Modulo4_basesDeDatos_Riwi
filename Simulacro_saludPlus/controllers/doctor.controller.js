const {
  listDoctors,
  findDoctorById,
  updateDoctorById,
} = require("../services/doctor.service");

function parseDoctorId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getDoctors(req, res) {
  try {
    const specialty = req.query.specialty ? String(req.query.specialty).trim() : null;
    const doctors = await listDoctors(specialty);

    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener médicos", error: error.message });
  }
}

async function getDoctorById(req, res) {
  try {
    const id = parseDoctorId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "El id del médico debe ser un número entero positivo" });
    }

    const doctor = await findDoctorById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Médico no encontrado" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener médico", error: error.message });
  }
}

async function putDoctorById(req, res) {
  try {
    const id = parseDoctorId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "El id del médico debe ser un número entero positivo" });
    }

    const payload = {
      name: req.body.name,
      email: req.body.email,
      specialty: req.body.specialty,
    };

    if (!payload.name && !payload.email && !payload.specialty) {
      return res.status(400).json({ message: "Debes enviar al menos un campo: name, email o specialty" });
    }

    const updatedDoctor = await updateDoctorById(id, payload);

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Médico no encontrado" });
    }

    return res.status(200).json({
      message: "Médico actualizado correctamente",
      doctor: updatedDoctor,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El email ya está registrado en otro médico" });
    }

    return res.status(500).json({ message: "Error al actualizar médico", error: error.message });
  }
}

module.exports = {
  getDoctors,
  getDoctorById,
  putDoctorById,
};
