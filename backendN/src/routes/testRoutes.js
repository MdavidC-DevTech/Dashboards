// src/routes/testRoutes.js

/* Descomentar despues 
const express = require("express");
const router = express.Router();
const pool = require("../models/db"); // Ajusta la ruta según dónde esté tu módulo de conexión a la DB
const authMiddleware = require("../middlewares/authMiddleware"); // Para proteger el endpoint
*/
// Endpoint de prueba: Ejecuta la consulta SQL y devuelve el resultado
// Este endpoint está protegido; solo podrán acceder usuarios autenticados.

/* Descomentar despues 
router.get("/test-query", authMiddleware, async (req, res) => {
  try {
    const sql = `
WITH ordered_events AS (
  SELECT
    e.userid,
    e.id,
    DATE(CONVERT_TZ(FROM_UNIXTIME(e.timecreated), '+00:00', '-05:00')) AS event_date,
    CONVERT_TZ(FROM_UNIXTIME(e.timecreated), '+00:00', '-05:00') AS created_date,
    e.contextinstanceid,
    ROW_NUMBER() OVER (PARTITION BY e.userid ORDER BY e.timecreated) AS rn
  FROM eva_logstore_standard_log e
  JOIN eva_user u ON e.userid = u.id
  WHERE e.contextinstanceid IN (
    SELECT c.id AS curso_id
    FROM eva_course_categories cc
    LEFT JOIN eva_course c ON c.category = cc.id
    WHERE cc.path LIKE '/4/5/240/303/305/298/300%'
      AND c.id IS NOT NULL
    GROUP BY c.id
  )
),
differences AS (
  SELECT
    a.userid,
    a.event_date,
    a.contextinstanceid,
    a.created_date AS current_event,
    COALESCE(TIMESTAMPDIFF(SECOND, LAG(a.created_date) OVER (PARTITION BY a.userid, a.contextinstanceid ORDER BY a.rn), a.created_date), 0) AS diff
  FROM ordered_events a
),
context_info AS (
  SELECT
    id AS contextid,
    instanceid AS courseid
  FROM eva_context
  WHERE instanceid IN (
    SELECT c.id AS curso_id
    FROM eva_course_categories cc
    LEFT JOIN eva_course c ON c.category = cc.id
    WHERE cc.path LIKE '/4/5/240/303/305/298/300%'
      AND c.id IS NOT NULL
    GROUP BY c.id
  )
)
SELECT
  a.userid,
  u.firstname AS user_fname,
  u.lastname AS user_sname,
  ra.roleid AS user_roleid,
  r.shortname AS role_shortname,
  ci.courseid,
  c.fullname AS course_fullname,
  c.shortname AS course_shortname,
  a.event_date,
  SUM(
    CASE
      WHEN diff BETWEEN 10 AND 3600 THEN diff
      ELSE 0
    END
  ) AS active_seconds
FROM differences a
JOIN eva_user u ON a.userid = u.id
JOIN context_info ci ON a.contextinstanceid = ci.courseid
JOIN eva_role_assignments ra ON a.userid = ra.userid AND ci.contextid = ra.contextid
JOIN eva_role r ON ra.roleid = r.id
JOIN eva_course c ON ci.courseid = c.id
GROUP BY
  a.userid,
  user_fname,
  user_sname,
  user_roleid,
  role_shortname,
  ci.courseid,
  c.fullname,
  c.shortname,
  a.event_date,
  a.contextinstanceid
ORDER BY a.userid, a.event_date;
    `;
    const conn = await pool.getConnection();
    const rows = await conn.query(sql);
    conn.release();
    return res.json(rows);
  } catch (err) {
    console.error("Error al ejecutar la consulta de prueba:", err);
    return res.status(500).json({ error: "Error ejecutando consulta", details: err.message });
  }
});

module.exports = router;
*/
