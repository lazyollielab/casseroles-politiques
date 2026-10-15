#!/usr/bin/env node
/**
 * Validation des données du recensement.
 * Zéro dépendance : Node seul suffit. Sort avec un code non nul si une erreur
 * est trouvée, ce qui bloque la publication automatique du site.
 *
 * Usage : node scripts/valider.js
 */

const fs = require('fs');
const path = require('path');

// Listes fermées, identiques à REGLES.md. Modifier REGLES.md d'abord, puis ici.
const STATUTS_AFFAIRE = [
  'condamnation-definitive',
  'condamnation-appel',
  'condamnation-premiere-instance',
  'en-proces',
  'mis-en-examen',
  'mis-en-cause-presse',
  'relaxe',
  'non-lieu',
  'classement-sans-suite',
  'prescription',
];

const POSITIONS = [
  'condamne',
  'relaxe',
  'non-lieu',
  'classement',
  'en-proces',
  'mis-en-examen',
  'mis-en-cause',
];

const erreurs = [];
const avertissements = [];

function erreur(message) {
  erreurs.push(message);
}

function avertir(message) {
  avertissements.push(message);
}

// --- Lecture des fichiers -------------------------------------------------

function lireJson(cheminRelatif) {
  const chemin = path.join(__dirname, '..', cheminRelatif);
  if (!fs.existsSync(chemin)) {
    erreur(`Fichier manquant : ${cheminRelatif}`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(chemin, 'utf8'));
  } catch (e) {
    erreur(`JSON invalide dans ${cheminRelatif} : ${e.message}`);
    return [];
  }
}

const partis = lireJson('data/partis.json');
const affaires = lireJson('data/affaires.json');
const personnalites = lireJson('data/personnalites.json');

// --- Contrôles génériques ---------------------------------------------------

function doublons(liste, champ, etiquette) {
  const vus = new Set();
  for (const element of liste) {
    if (!element[champ]) continue;
    if (vus.has(element[champ])) {
      erreur(`${etiquette} : id « ${element[champ]} » en doublon.`);
    }
    vus.add(element[champ]);
  }
}

function estUrl(valeur) {
  return typeof valeur === 'string' && /^https?:\/\/.+/.test(valeur);
}

// --- Partis -----------------------------------------------------------------

doublons(partis, 'id', 'partis.json');
const idsPartis = new Set(partis.map((p) => p.id));

for (const parti of partis) {
  const ou = `partis.json [${parti.id || '?'}]`;
  for (const champ of ['id', 'nom', 'sigle']) {
    if (!parti[champ]) erreur(`${ou} : champ « ${champ} » manquant.`);
  }
  if (typeof parti.axe !== 'number' || parti.axe < 0 || parti.axe > 100) {
    erreur(`${ou} : « axe » doit être un entier entre 0 et 100.`);
  }
  if (parti.actuel !== true && parti.actuel !== false) {
    erreur(`${ou} : « actuel » doit être true ou false.`);
  }
  if (parti.logo && !fs.existsSync(path.join(__dirname, '..', parti.logo))) {
    avertir(`${ou} : le fichier logo « ${parti.logo} » n'existe pas encore.`);
  }
}

// --- Affaires ---------------------------------------------------------------

doublons(affaires, 'id', 'affaires.json');
const idsAffaires = new Set(affaires.map((a) => a.id));

for (const affaire of affaires) {
  const ou = `affaires.json [${affaire.id || '?'}]`;
  for (const champ of ['id', 'nom', 'periode', 'statut', 'resume']) {
    if (!affaire[champ]) erreur(`${ou} : champ « ${champ} » manquant.`);
  }
  if (!STATUTS_AFFAIRE.includes(affaire.statut)) {
    erreur(`${ou} : statut « ${affaire.statut} » inconnu. Voir REGLES.md §3.`);
  }
  if (!Array.isArray(affaire.sources) || affaire.sources.length === 0) {
    erreur(`${ou} : au moins une source est obligatoire.`);
  } else if (!affaire.sources.every(estUrl)) {
    erreur(`${ou} : chaque source doit être une URL complète.`);
  }
  if (affaire.date_maj && !/^\d{4}-\d{2}-\d{2}$/.test(affaire.date_maj)) {
    erreur(`${ou} : « date_maj » doit être au format AAAA-MM-JJ.`);
  }
}

// --- Personnalités ----------------------------------------------------------

doublons(personnalites, 'id', 'personnalites.json');

for (const personne of personnalites) {
  const ou = `personnalites.json [${personne.id || '?'}]`;
  for (const champ of ['id', 'nom', 'fonction', 'parti']) {
    if (!personne[champ]) erreur(`${ou} : champ « ${champ} » manquant.`);
  }
  if (personne.parti && !idsPartis.has(personne.parti)) {
    erreur(`${ou} : parti « ${personne.parti} » inconnu dans partis.json.`);
  }
  if (!Array.isArray(personne.implications) || personne.implications.length === 0) {
    erreur(`${ou} : au moins une implication est obligatoire.`);
  }
  for (const implication of personne.implications || []) {
    if (!idsAffaires.has(implication.affaire)) {
      erreur(`${ou} : implication vers une affaire inconnue « ${implication.affaire} ».`);
    }
    if (!POSITIONS.includes(implication.position)) {
      erreur(`${ou} : position « ${implication.position} » inconnue. Voir REGLES.md §4.`);
    }
  }
  if (personne.photo && !fs.existsSync(path.join(__dirname, '..', personne.photo))) {
    avertir(`${ou} : le fichier photo « ${personne.photo} » n'existe pas encore.`);
  }
}

// --- Affaires orphelines ---------------------------------------------------

const affairesReferencees = new Set(
  personnalites.flatMap((p) => (p.implications || []).map((i) => i.affaire))
);
for (const affaire of affaires) {
  if (!affairesReferencees.has(affaire.id)) {
    erreur(`affaires.json [${affaire.id}] : affaire rattachée à aucune personnalité.`);
  }
}

// --- Bilan -----------------------------------------------------------------

for (const message of avertissements) console.log('AVERTISSEMENT : ' + message);

if (erreurs.length > 0) {
  console.error(`\n${erreurs.length} erreur(s) :`);
  for (const message of erreurs) console.error(' - ' + message);
  console.error('\nValidation refusée. Corriger les points ci-dessus (voir REGLES.md et data/SCHEMA.md).');
  process.exit(1);
}

console.log(
  `Validation réussie : ${partis.length} partis, ${affaires.length} affaires, ${personnalites.length} personnalités, ${affairesReferencees.size} affaires référencées.`
);
