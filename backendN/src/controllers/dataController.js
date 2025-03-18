// src/controllers/dataController.js
const pool = require('../config/db');

async function getDatos(req, res) {
  try {
    // 1) Del token, obten la info del usuario
    const { role, categoryId } = req.user || {};

    // 2) Condición para filtrar
    //    Si es 'teacher' o 'student', filtras por cat.id = categoryId
    //    Si es 'manager' (o algún rol “admin”), devuelves todo.
    let whereCategory = '';
    if (role === 'teacher' || role === 'student') {
      // Filtrar por la categoría del user
      whereCategory = `AND cat.id = ${categoryId}`;
    }
    
    // [OPCIONAL] Quitar la parte que limitaba a 7 días
    // antes tenías: e.timecreated > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))
    // Si quieres TODOS los registros, quita esa condición.

    const sql = `
WITH ordered_events AS (
    SELECT
        e.userid,
        e.id AS log_id,
        DATE(CONVERT_TZ(FROM_UNIXTIME(e.timecreated), '+00:00', '-05:00')) AS event_date,
        CONVERT_TZ(FROM_UNIXTIME(e.timecreated), '+00:00', '-05:00') AS created_date,
        e.contextinstanceid,
        ROW_NUMBER() OVER (PARTITION BY e.userid ORDER BY e.timecreated) AS rn
    FROM
        eva_logstore_standard_log e
        JOIN eva_user u ON e.userid = u.id
        -- Quitar LIMITES de fecha si quieres el historial completo
),
differences AS (
    SELECT
        a.userid,
        a.event_date,
        a.contextinstanceid,
        a.created_date AS current_event,
        COALESCE(
            TIMESTAMPDIFF(
                SECOND,
                LAG(a.created_date) OVER (PARTITION BY a.userid, a.contextinstanceid ORDER BY a.rn),
                a.created_date
            ),
            0
        ) AS diff
    FROM ordered_events a
),
context_info AS (
    SELECT
        id AS contextid,
        instanceid AS courseid
    FROM eva_context
)
SELECT
    d.userid,
    u.firstname AS user_fname,
    u.lastname AS user_sname,
    ra.roleid AS user_roleid,
    r.shortname AS role_shortname,
    ci.courseid,
    c.fullname AS course_fullname,
    c.shortname AS course_shortname,
    cat.id AS category_id,
    cat.name AS category_name,
    cat.path AS category_path,
    d.event_date,
    SUM(
        CASE WHEN d.diff BETWEEN 10 AND 3600 THEN d.diff ELSE 0 END
    ) AS active_seconds
FROM differences d
JOIN eva_user u ON d.userid = u.id
JOIN context_info ci ON d.contextinstanceid = ci.courseid
JOIN eva_course c ON ci.courseid = c.id
JOIN eva_course_categories cat ON c.category = cat.id
JOIN eva_role_assignments ra ON d.userid = ra.userid AND ci.contextid = ra.contextid
JOIN eva_role r ON ra.roleid = r.id
WHERE 1=1
  ${whereCategory}  -- Filtra según el colegio
GROUP BY
  d.userid,
  user_fname,
  user_sname,
  user_roleid,
  role_shortname,
  ci.courseid,
  c.fullname,
  c.shortname,
  cat.id,
  cat.name,
  cat.path,
  d.event_date,
  d.contextinstanceid
ORDER BY
  d.userid,
  d.event_date
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);

  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  getDatos
};
