// src/controllers/dataController.js
const pool = require('../config/db');

async function getDatos(req, res) {
  try {
    // 1) Del token obtenemos role y categoryId (definidos en fakeUsers)
    const { role, categoryId } = req.user || {};

    // 2) Obtenemos el path completo de la categoría a partir del categoryId
    let categoryPath = '';
    if (role === 'teacher' || role === 'student') {
      const [catRows] = await pool.query(
        "SELECT path FROM eva_course_categories WHERE id = ?",
        [categoryId]
      );
      if (catRows.length > 0) {
        categoryPath = catRows[0].path; // Ejemplo: '/4/5/240/303/305/298/300'
      } else {
        throw new Error("No se encontró la categoría del usuario.");
      }
    } else {
      // Para otros roles, sin restricción
      categoryPath = '%';
    }

    // 3) Consulta optimizada: se filtra desde los CTE usando el categoryPath obtenido
    const sql = `
WITH ordered_events AS (
    SELECT
        e.userid,
        e.id AS log_id,
        DATE(CONVERT_TZ(FROM_UNIXTIME(e.timecreated), '+00:00', '-05:00')) AS event_date,
        CONVERT_TZ(FROM_UNIXTIME(e.timecreated), '+00:00', '-05:00') AS created_date,
        e.contextinstanceid,
        ROW_NUMBER() OVER (PARTITION BY e.userid, e.contextinstanceid ORDER BY e.timecreated) AS rn
    FROM eva_logstore_standard_log e
    WHERE e.contextinstanceid IN (
        SELECT c.id
        FROM eva_course_categories cc
        JOIN eva_course c ON c.category = cc.id
        WHERE cc.path LIKE CONCAT(?, '%')
        GROUP BY c.id
    )
),
differences AS (
    SELECT
        oe.userid,
        oe.event_date,
        oe.contextinstanceid,
        oe.created_date AS current_event,
        COALESCE(
            TIMESTAMPDIFF(SECOND,
                LAG(oe.created_date) OVER (PARTITION BY oe.userid, oe.contextinstanceid ORDER BY oe.rn),
                oe.created_date
            ),
            0
        ) AS diff
    FROM ordered_events oe
),
context_info AS (
    SELECT id AS contextid, instanceid AS courseid
    FROM eva_context
    WHERE instanceid IN (
        SELECT c.id
        FROM eva_course_categories cc
        JOIN eva_course c ON c.category = cc.id
        WHERE cc.path LIKE CONCAT(?, '%')
        GROUP BY c.id
    )
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
    SUM(CASE WHEN d.diff BETWEEN 10 AND 3600 THEN d.diff ELSE 0 END) AS active_seconds
FROM differences d
JOIN eva_user u ON d.userid = u.id
JOIN context_info ci ON d.contextinstanceid = ci.courseid
JOIN eva_course c ON ci.courseid = c.id
JOIN eva_course_categories cat ON c.category = cat.id
JOIN eva_role_assignments ra ON d.userid = ra.userid AND ci.contextid = ra.contextid
JOIN eva_role r ON ra.roleid = r.id
GROUP BY
    d.userid, u.firstname, u.lastname, ra.roleid, r.shortname,
    ci.courseid, c.fullname, c.shortname, cat.id, cat.name, cat.path,
    d.event_date, d.contextinstanceid
ORDER BY d.userid, d.event_date;
    `;

    // Se pasan el categoryPath para los dos subqueries
    const [rows] = await pool.query(sql, [categoryPath, categoryPath]);
    res.json(rows);

  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { getDatos };
