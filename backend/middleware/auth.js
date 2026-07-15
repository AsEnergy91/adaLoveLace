import jwt from "jsonwebtoken";

function auth(req, res, next) {
  // Le token arrive dans l'en-tête : "Authorization: Bearer xxx"
  const entete = req.headers.authorization;
  if (!entete || !entete.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = entete.split(" ")[1]; // on garde la partie après "Bearer "
  try {
    // Vérifie la signature avec la clé secrète
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode; // maintenant req.user.id est dispo dans la route
    next(); // tout est bon : on laisse passer
  } catch (err) {
    res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

export default auth;
