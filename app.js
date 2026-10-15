/* Casseroles Politiques — logique de la page unique.
 * Chargement en deux temps : partis.json + personnalites.json au démarrage
 * (quelques Ko), affaires.json au premier clic sur un parti.
 * Aucune dépendance, aucun build. */

"use strict";

/* ---------- État de la page : deux valeurs seulement ---------- */

const etat = {
  plage: [0, 100],        // zone sélectionnée sur l'axe
  partiSelectionne: null, // id du parti cliqué, ou null
};

/* Chargement paresseux : affaires.json n'est récupéré qu'une fois */
let affaires = null;

/* ---------- Correspondance position -> classe de pastille ---------- */

const CLASSES_PASTILLE = {
  "relaxe": "pastille-vert",
  "non-lieu": "pastille-vert",
  "classement": "pastille-vert",
  "en-proces": "pastille-bleu",
  "mis-en-examen": "pastille-bleu",
  "mis-en-cause": "pastille-gris",
};

const LIBELLES_POSITION = {
  "condamne": "Condamné",
  "relaxe": "Relaxé",
  "non-lieu": "Non-lieu",
  "classement": "Classé sans suite",
  "en-proces": "En procès",
  "mis-en-examen": "Mis en examen",
  "mis-en-cause": "Mis en cause",
};

const LIBELLES_STATUT = {
  "condamnation-definitive": "Condamnation définitive",
  "condamnation-appel": "Condamné en appel, pourvoi en cours",
  "condamnation-premiere-instance": "Condamné en première instance, appel en cours",
  "en-proces": "Procès en cours",
  "mis-en-examen": "Information judiciaire en cours",
  "mis-en-cause-presse": "Révélations de presse, aucune poursuite",
  "relaxe": "Relaxe",
  "non-lieu": "Non-lieu",
  "classement-sans-suite": "Classement sans suite",
  "prescription": "Prescription",
};

/* ---------- Utilitaires ---------- */

function creer(nom, classe, texte) {
  const el = document.createElement(nom);
  if (classe) el.className = classe;
  if (texte !== undefined) el.textContent = texte;
  return el;
}

async function chargerJson(chemin) {
  const reponse = await fetch(chemin);
  if (!reponse.ok) throw new Error("Chargement impossible : " + chemin);
  return reponse.json();
}

/* ---------- Bloc 1 : axe et partis positionnés ---------- */

let partis = [];
let personnalites = [];
let compteParParti = new Map();

function partiEstActif(parti) {
  return parti.axe >= etat.plage[0] && parti.axe <= etat.plage[1];
}

function afficherPartisSurAxe(conteneurAxe) {
  conteneurAxe.replaceChildren();
  /* Anti-collision : trois lignes. Les partis sont traités de gauche à droite,
   * chacun prend la première ligne dont le dernier occupant est à au moins
   * ECART_MIN unités d'axe. Couvre les grappes réelles (50-55, 72-74, 90-92). */
  const ECART_MIN = 10;
  const derniere = [-100, -100, -100];
  const tries = [...partis].sort((a, b) => a.axe - b.axe);
  for (const parti of tries) {
    let ligne = 2;
    for (let i = 0; i < 3; i++) {
      if (parti.axe - derniere[i] >= ECART_MIN) { ligne = i; break; }
    }
    derniere[ligne] = parti.axe;

    const bouton = creer("button", "axe-parti");
    if (ligne === 1) bouton.classList.add("niveau-milieu");
    if (ligne === 2) bouton.classList.add("niveau-bas");
    bouton.style.left = parti.axe + "%";
    bouton.dataset.parti = parti.id;
    bouton.type = "button";
    bouton.appendChild(creer("span", null, parti.sigle));
    bouton.addEventListener("click", () => selectionnerParti(parti.id));
    conteneurAxe.appendChild(bouton);
  }
}

function afficherPartisEnTuiles(conteneur) {
  conteneur.replaceChildren();
  for (const parti of partis) {
    const compte = compteParParti.get(parti.id) || 0;
    const tuile = creer("button", "parti-tuile");
    tuile.dataset.parti = parti.id;
    tuile.type = "button";
    tuile.appendChild(creer("span", "sigle", parti.sigle));
    tuile.appendChild(creer("span", "nom", parti.nom));
    tuile.appendChild(creer("span", "compte", compte + " personnalité" + (compte > 1 ? "s" : "")));
    tuile.addEventListener("click", () => selectionnerParti(parti.id));
    conteneur.appendChild(tuile);
  }
}

function rafraichirEtatVisuel() {
  for (const bouton of document.querySelectorAll(".axe-parti")) {
    const parti = partis.find((p) => p.id === bouton.dataset.parti);
    bouton.classList.toggle("inactif", !partiEstActif(parti));
  }
  for (const tuile of document.querySelectorAll(".parti-tuile")) {
    const parti = partis.find((p) => p.id === tuile.dataset.parti);
    tuile.classList.toggle("inactif", !partiEstActif(parti));
    tuile.classList.toggle("selectionne", parti.id === etat.partiSelectionne);
  }
}

/* ---------- Slider : plage au clic, au doigt et au clavier ---------- */

function configurerSlider(axe) {
  /* Restitue l'état visuellement : la poignée suit le centre de la plage.
   * C'est la fonction qui manquait — l'état était calculé mais jamais affiché. */
  function deplacerPoignee() {
    const centre = (etat.plage[0] + etat.plage[1]) / 2;
    axe.style.setProperty("--poignee", centre + "%");
  }

  function majPlageDepuisPoint(clientX) {
    const rect = axe.getBoundingClientRect();
    const x = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const point = Math.round(x * 100);
    const debut = Math.max(0, point - 15);
    const fin = Math.min(100, point + 15);
    etat.plage = [debut, fin];
    axe.setAttribute("aria-valuenow", debut + "-" + fin);
    deplacerPoignee();
    rafraichirEtatVisuel();
  }

  axe.addEventListener("pointerdown", (e) => {
    e.preventDefault(); /* évite sélection/scroll parasite au démarrage du geste */
    axe.classList.add("saisie");
    majPlageDepuisPoint(e.clientX);
    const deplacer = (ev) => majPlageDepuisPoint(ev.clientX);
    const relacher = () => {
      axe.classList.remove("saisie");
      window.removeEventListener("pointermove", deplacer);
      window.removeEventListener("pointerup", relacher);
      window.removeEventListener("pointercancel", relacher);
    };
    window.addEventListener("pointermove", deplacer);
    window.addEventListener("pointerup", relacher);
    window.addEventListener("pointercancel", relacher);
  });

  axe.addEventListener("keydown", (e) => {
    let [debut, fin] = etat.plage;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { debut = Math.max(0, debut - 5); fin = Math.max(debut + 1, fin - 5); }
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") { fin = Math.min(100, fin + 5); debut = Math.min(fin - 1, debut + 5); }
    else if (e.key === "Home") { debut = 0; fin = 15; }
    else if (e.key === "End") { debut = 85; fin = 100; }
    else return;
    e.preventDefault();
    etat.plage = [debut, fin];
    axe.setAttribute("aria-valuenow", debut + "-" + fin);
    deplacerPoignee();
    rafraichirEtatVisuel();
  });

  deplacerPoignee(); /* position initiale : centre de l'axe */
}

/* ---------- Bloc 3 : cards ---------- */

function couleurPour(implication, affaire) {
  if (implication.position === "condamne") {
    if (affaire.statut === "condamnation-definitive") return "pastille-condamne";
    return "pastille-orange";
  }
  return CLASSES_PASTILLE[implication.position] || "pastille-gris";
}

function construireCard(personne, affairesParId) {
  const card = creer("article", "card");
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-expanded", "false");

  const entete = creer("div", "card-entete");
  const photo = creer("div", "card-photo placeholder");
  photo.textContent = personne.nom.charAt(0);
  entete.appendChild(photo);

  const identite = creer("div");
  identite.appendChild(creer("div", "card-nom", personne.nom));
  identite.appendChild(creer("div", "card-fonction", personne.fonction));
  entete.appendChild(identite);
  card.appendChild(entete);

  const pastilles = creer("div", "card-pastilles");
  const blocDetail = creer("div", "card-detail");
  blocDetail.setAttribute("aria-hidden", "true");

  for (const implication of personne.implications) {
    const affaire = affairesParId.get(implication.affaire);
    if (!affaire) continue;

    const pastille = creer("span", "pastille " + couleurPour(implication, affaire));
    pastille.title = affaire.nom + " — " + LIBELLES_POSITION[implication.position];
    pastilles.appendChild(pastille);

    const bloc = creer("div", "affaire");
    bloc.appendChild(creer("div", "affaire-nom", affaire.nom));
    bloc.appendChild(creer("div", "affaire-statut", LIBELLES_STATUT[affaire.statut] || affaire.statut));
    bloc.appendChild(creer("div", "affaire-periode", affaire.periode));
    bloc.appendChild(creer("p", "affaire-resume", affaire.resume));
    const source = creer("div", "affaire-source");
    const lien = creer("a", null, "Source");
    lien.href = affaire.sources[0];
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    source.appendChild(lien);
    bloc.appendChild(source);
    blocDetail.appendChild(bloc);
  }

  card.appendChild(pastilles);
  card.appendChild(blocDetail);

  function basculer() {
    const depliee = card.classList.toggle("depliee");
    card.setAttribute("aria-expanded", String(depliee));
    blocDetail.setAttribute("aria-hidden", String(!depliee));
  }

  card.addEventListener("click", basculer);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); basculer(); }
  });

  return card;
}

function afficherCards(partiId) {
  const bloc = document.getElementById("bloc-cards");
  const liste = document.getElementById("cards-liste");
  const titre = document.getElementById("cards-titre");

  const parti = partis.find((p) => p.id === partiId);
  const personnes = personnalites.filter((p) => p.parti === partiId);

  titre.textContent = personnes.length + " personnalité" + (personnes.length > 1 ? "s" : "") + " — " + parti.nom;

  liste.replaceChildren();
  const affairesParId = new Map(affaires.map((a) => [a.id, a]));

  /* Tri : nombre d'affaires décroissant, puis alphabétique */
  personnes.sort((a, b) => b.implications.length - a.implications.length || a.nom.localeCompare(b.nom, "fr"));

  for (const personne of personnes) {
    liste.appendChild(construireCard(personne, affairesParId));
  }

  bloc.hidden = false;
  bloc.classList.remove("visible");
  void bloc.offsetWidth; /* relance l'animation d'apparition */
  bloc.classList.add("visible");
}

function masquerCards() {
  const bloc = document.getElementById("bloc-cards");
  bloc.hidden = true;
  document.getElementById("cards-liste").replaceChildren();
}

async function selectionnerParti(partiId) {
  const parti = partis.find((p) => p.id === partiId);
  if (!partiEstActif(parti)) return;

  if (etat.partiSelectionne === partiId) {
    etat.partiSelectionne = null;
    masquerCards();
  } else {
    if (!affaires) {
      affaires = await chargerJson("data/affaires.json");
    }
    etat.partiSelectionne = partiId;
    afficherCards(partiId);
  }
  rafraichirEtatVisuel();
}

/* ---------- Démarrage ---------- */

async function demarrer() {
  [partis, personnalites] = await Promise.all([
    chargerJson("data/partis.json"),
    chargerJson("data/personnalites.json"),
  ]);

  compteParParti = new Map();
  for (const personne of personnalites) {
    compteParParti.set(personne.parti, (compteParParti.get(personne.parti) || 0) + 1);
  }

  afficherPartisSurAxe(document.getElementById("axis-partis"));
  afficherPartisEnTuiles(document.getElementById("partis-liste"));
  configurerSlider(document.getElementById("axe"));
  rafraichirEtatVisuel();
}

demarrer().catch((e) => {
  console.error("Erreur au démarrage :", e);
});
