const seedRelationships = [
  { owner_name: "Nora",   member_name: "Sam",    circle: "Inner Circle" },
  { owner_name: "Nora",   member_name: "Julien", circle: "Inner Circle" },
  { owner_name: "Nora",   member_name: "Maya",   circle: "Connexions" },
  { owner_name: "Nora",   member_name: "Chris",  circle: "Connexions" },
  { owner_name: "Nora",   member_name: "Ana",    circle: "Connexions" },
  { owner_name: "Chris",  member_name: "Maya",   circle: "Inner Circle" },
  { owner_name: "Chris",  member_name: "Ana",    circle: "Connexions" },
  { owner_name: "Chris",  member_name: "Nora",   circle: "Connexions" },
  { owner_name: "Chris",  member_name: "Sam",    circle: "Connexions" },
  { owner_name: "Chris",  member_name: "Julien", circle: "Connexions" },
  { owner_name: "Ana",    member_name: "Chris",  circle: "Inner Circle" },
  { owner_name: "Ana",    member_name: "Maya",   circle: "Connexions" },
  { owner_name: "Ana",    member_name: "Nora",   circle: "Connexions" },
  { owner_name: "Sam",    member_name: "Nora",   circle: "Inner Circle" },
  { owner_name: "Sam",    member_name: "Chris",  circle: "Connexions" },
  { owner_name: "Julien", member_name: "Nora",   circle: "Inner Circle" },
  { owner_name: "Julien", member_name: "Sam",    circle: "Connexions" },
  { owner_name: "Maya",   member_name: "Chris",  circle: "Inner Circle" },
  { owner_name: "Maya",   member_name: "Ana",    circle: "Connexions" },
];

module.exports = { seedRelationships };
