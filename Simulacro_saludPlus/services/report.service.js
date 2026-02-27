const db = require("../config/mysql");

function formatDate(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

async function getRevenueReport(startDate, endDate) {
  const [totalRows] = await db.query(
    "SELECT COALESCE(SUM(amount_paid), 0) AS totalRevenue FROM appointments"
  );

  const [insuranceRows] = await db.query(
    `SELECT COALESCE(i.name, 'Sin seguro') AS insuranceName,
            COALESCE(SUM(a.amount_paid), 0) AS totalRevenue
     FROM appointments a
     LEFT JOIN insurances i ON i.id = a.insurance_id
     GROUP BY COALESCE(i.name, 'Sin seguro')
     ORDER BY insuranceName ASC`
  );

  let finalStartDate = startDate || null;
  let finalEndDate = endDate || null;

  if (!finalStartDate || !finalEndDate) {
    const [rangeRows] = await db.query(
      "SELECT MIN(appointment_date) AS minDate, MAX(appointment_date) AS maxDate FROM appointments"
    );

    if (!finalStartDate) {
      finalStartDate = formatDate(rangeRows[0]?.minDate);
    }

    if (!finalEndDate) {
      finalEndDate = formatDate(rangeRows[0]?.maxDate);
    }
  }

  let totalByDateRange = 0;

  if (finalStartDate && finalEndDate) {
    const [rangeTotalRows] = await db.query(
      `SELECT COALESCE(SUM(amount_paid), 0) AS totalRevenue
       FROM appointments
       WHERE appointment_date BETWEEN ? AND ?`,
      [finalStartDate, finalEndDate]
    );

    totalByDateRange = Number(rangeTotalRows[0].totalRevenue || 0);
  }

  return {
    totalRevenue: Number(totalRows[0].totalRevenue || 0),
    totalByInsurance: insuranceRows.map((row) => ({
      insuranceName: row.insuranceName,
      totalRevenue: Number(row.totalRevenue || 0),
    })),
    totalByDateRange: {
      startDate: finalStartDate,
      endDate: finalEndDate,
      totalRevenue: totalByDateRange,
    },
  };
}

module.exports = { getRevenueReport };
