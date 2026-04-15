const { db } = require("../connection");

const SEED_USERS = [
  { name: "Nora", is_admin: 1, availability: "Disponible", image_path: "/images/Nora.jpeg", status_text: "Peut être là en 10 min" },
  { name: "Sam", is_admin: 0, availability: "Disponible", image_path: "/images/Sam.jpeg", status_text: "Part du bureau bientôt" },
  { name: "Julien", is_admin: 0, availability: "Probable", image_path: "/images/Julien.jpeg", status_text: "Confirme s'il finit à l'heure" },
  { name: "Maya", is_admin: 0, availability: "Ne sais pas", image_path: "/images/Maya.jpeg", status_text: "Attend de voir le timing exact" },
  { name: "Chris", is_admin: 0, availability: "Disponible", image_path: "/images/Chris.jpeg", status_text: "Open pour impro après 18h" },
  { name: "Ana", is_admin: 0, availability: "Ne sais pas", image_path: "/images/Ana.jpeg", status_text: "Peut embarquer plus tard" },
];

function seedUsers() {
  const insert = db.prepare(`
    INSERT INTO users (name, is_admin, availability, image_path, status_text)
    VALUES (@name, @is_admin, @availability, @image_path, @status_text)
  `);

  db.transaction((rows) => rows.forEach((row) => insert.run(row)))(SEED_USERS);
}

module.exports = { seedUsers };
