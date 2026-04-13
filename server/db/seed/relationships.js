const { db } = require("../connection");
const { CIRCLE, circleLabelToId } = require("../constants");

// circle_id: 1 = Inner Circle, 2 = Connexions
const SEED_RELATIONSHIPS = [
  { owner_name: "Nora",   member_name: "Sam",    circle_id: CIRCLE.INNER },
  { owner_name: "Nora",   member_name: "Julien", circle_id: CIRCLE.INNER },
  { owner_name: "Nora",   member_name: "Maya",   circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Nora",   member_name: "Chris",  circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Nora",   member_name: "Ana",    circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Chris",  member_name: "Maya",   circle_id: CIRCLE.INNER },
  { owner_name: "Chris",  member_name: "Ana",    circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Chris",  member_name: "Nora",   circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Chris",  member_name: "Sam",    circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Chris",  member_name: "Julien", circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Ana",    member_name: "Chris",  circle_id: CIRCLE.INNER },
  { owner_name: "Ana",    member_name: "Maya",   circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Ana",    member_name: "Nora",   circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Sam",    member_name: "Nora",   circle_id: CIRCLE.INNER },
  { owner_name: "Sam",    member_name: "Chris",  circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Julien", member_name: "Nora",   circle_id: CIRCLE.INNER },
  { owner_name: "Julien", member_name: "Sam",    circle_id: CIRCLE.CONNEXIONS },
  { owner_name: "Maya",   member_name: "Chris",  circle_id: CIRCLE.INNER },
  { owner_name: "Maya",   member_name: "Ana",    circle_id: CIRCLE.CONNEXIONS },
];

function seedRelationships(byName) {
  const insert = db.prepare(`
    INSERT INTO user_relationships (owner_user_id, member_user_id, circle_id)
    VALUES (@owner_user_id, @member_user_id, @circle_id)
  `);

  const rows = SEED_RELATIONSHIPS
    .map((r) => ({
      owner_user_id:  byName[r.owner_name],
      member_user_id: byName[r.member_name],
      circle_id:      r.circle_id,
    }))
    .filter((r) => r.owner_user_id && r.member_user_id);

  db.transaction((items) => items.forEach((item) => insert.run(item)))(rows);
}

module.exports = { seedRelationships };