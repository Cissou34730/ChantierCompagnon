Spécification Fonctionnelle — Journal de Chantier Digital
Version : 1.0
Date : 10 avril 2026
Statut : Draft
Client cible : Entreprises du BTP
Utilisateurs cibles : Chefs de chantier, conducteurs de travaux

Table des matières
Vision & Objectifs
Personas & Contexte d'utilisation
Architecture fonctionnelle
Modules fonctionnels
4.1 Authentification & Gestion des chantiers
4.2 Pointage des ouvriers
4.3 Météo du chantier
4.4 Suivi du matériel & engins
4.5 Presqu'accidents & Sécurité
4.6 Photos & Anomalies
4.7 Bons de livraison
4.8 Commande vocale
4.9 Timeline des événements
4.10 Génération de rapport & Export ERP
Parcours utilisateur
Ergonomie & Design
Modèle de données
Exigences non fonctionnelles
Intégrations externes
Glossaire
1. Vision & Objectifs
1.1 Vision
Fournir aux chefs de chantier une application desktop unique, simple et robuste, qui centralise l'ensemble des événements quotidiens d'un chantier de construction. L'application remplace les journaux papier et les multiples outils éparpillés par une solution intégrée, pilotée en partie par la voix, avec un objectif final : produire un rapport de chantier structuré et l'envoyer automatiquement dans l'ERP de l'entreprise.

1.2 Objectifs métier
#	Objectif	KPI
O1	Supprimer les journaux de chantier papier	100 % des chantiers pilotes dématérialisés
O2	Réduire le temps de saisie quotidien	Gain de 50 % vs. saisie manuelle
O3	Fiabiliser le suivi des presqu'accidents	100 % des événements tracés avec horodatage
O4	Alimenter l'ERP en temps réel	Rapport envoyé en < 5 min après validation
O5	Améliorer la traçabilité matériel & livraisons	Zéro perte de bon de livraison
1.3 Périmètre
In scope : Application desktop (Windows), mode hors-ligne, synchronisation, export ERP.
Out of scope (v1) : Application mobile native, portail web de supervision, BI avancée.
2. Personas & Contexte d'utilisation
2.1 Persona principal — Le Chef de Chantier
Attribut	Valeur
Nom	Marc, 42 ans
Rôle	Chef de chantier, entreprise de gros œuvre
Contexte	Sur le terrain toute la journée, bureau de chantier (Algeco) avec PC portable
Compétences IT	Basiques — utilise un navigateur, Excel, mail
Frustrations	Papier qui se perd, double saisie, manque de traçabilité
Besoins	Saisie rapide (mains parfois occupées → voix), visibilité sur la journée
2.2 Persona secondaire — Le Conducteur de Travaux
Attribut	Valeur
Nom	Sophie, 35 ans
Rôle	Conductrice de travaux, supervise 3 chantiers
Besoins	Consulter les rapports de chantier, valider avant envoi ERP
2.3 Contexte d'utilisation
Environnement : Bureau de chantier (Algeco), PC portable Windows 10/11, parfois connecté en 4G/5G, parfois hors-ligne.
Conditions : Bruit ambiant (engins), luminosité variable, utilisateur souvent debout ou avec des gants.
Fréquence : Utilisation continue tout au long de la journée, avec pic en fin de poste pour la validation du rapport.
3. Architecture fonctionnelle
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION DESKTOP                     │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Pointage│ │  Météo  │ │ Matériel │ │  Sécurité   │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └──────┬──────┘  │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴─────┐ ┌──────┴──────┐  │
│  │ Photos  │ │  Bons   │ │  Vocal   │ │  Timeline   │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └──────┬──────┘  │
│       │           │           │               │          │
│  ┌────┴───────────┴───────────┴───────────────┴──────┐  │
│  │            MOTEUR DE RAPPORT                       │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                  │
│  ┌────────────────────┴──────────────────────────────┐  │
│  │         BASE DE DONNÉES LOCALE (SQLite)           │  │
│  └────────────────────┬──────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────┘
                        │ Sync
               ┌────────┴────────┐
               │   API BACKEND   │
               │   (.NET / Azure)│
               └────────┬────────┘
                        │
               ┌────────┴────────┐
               │   ERP Entreprise│
               └─────────────────┘
3.1 Stack technique recommandée
Couche	Technologie
Desktop UI	WPF (.NET 8) ou WinUI 3
Base locale	SQLite (via EF Core)
Reconnaissance vocale	Azure Cognitive Services Speech SDK (+ mode offline Windows Speech)
OCR (bons de livraison)	Azure AI Document Intelligence
Météo	API OpenWeatherMap ou Météo-France
Backend / Sync	ASP.NET Core Web API
ERP Integration	API REST / OData de l'ERP (SAP, Sage, etc.)
Stockage photos	Azure Blob Storage (sync) / dossier local (offline)
4. Modules fonctionnels
4.1 Authentification & Gestion des chantiers
4.1.1 Description
L'utilisateur se connecte à l'application, sélectionne le chantier du jour, et accède à son espace de travail.

4.1.2 Règles fonctionnelles
ID	Règle
AUTH-01	Authentification par identifiant / mot de passe (ou SSO entreprise via Azure AD / Entra ID)
AUTH-02	Session persistante — pas de re-login à chaque ouverture si le token est valide
AUTH-03	Un utilisateur peut être rattaché à un ou plusieurs chantiers
AUTH-04	Au lancement, l'application propose de sélectionner le chantier actif ou reprend le dernier utilisé
AUTH-05	Le chantier actif détermine la date du journal en cours (= date du jour par défaut)
4.1.3 Écrans
Écran	Description
E-AUTH-01	Écran de login (identifiant + mot de passe + logo entreprise)
E-AUTH-02	Sélecteur de chantier (liste avec recherche, favoris, dernier chantier en surbrillance)
4.1.4 Données
Chantier : id, code_chantier, nom, adresse, client, date_debut, date_fin_prevue, statut
Utilisateur : id, nom, prenom, email, role, chantiers_rattaches[]
4.2 Pointage des ouvriers
4.2.1 Description
Le chef de chantier enregistre la présence, les heures d'arrivée/départ et les qualifications des ouvriers présents sur le chantier.

4.2.2 Règles fonctionnelles
ID	Règle
PTG-01	Le pointage est lié à un chantier et une date
PTG-02	L'ouvrier est identifié par son nom + prénom + entreprise (sous-traitant ou interne)
PTG-03	Saisie de l'heure d'arrivée et de l'heure de départ
PTG-04	Possibilité de marquer : Présent, Absent, Retard, Départ anticipé
PTG-05	Possibilité de renseigner la qualification / tâche affectée (ex : coffreur, grutier)
PTG-06	Import d'une liste prédéfinie d'ouvriers depuis l'ERP ou un fichier CSV
PTG-07	Saisie rapide : la liste du jour précédent est proposée par défaut
PTG-08	Compteur automatique : nombre d'ouvriers présents, heures totales
PTG-09	Saisie vocale possible : « Ajoute Jean Dupont, arrivé à 7h30, coffreur »
4.2.3 Écrans
Écran	Description
E-PTG-01	Liste des ouvriers du jour (tableau avec colonnes : Nom, Entreprise, Arrivée, Départ, Statut, Tâche)
E-PTG-02	Formulaire d'ajout / modification d'un pointage
E-PTG-03	Récapitulatif par entreprise (sous-traitants)
4.2.4 Maquette conceptuelle
┌──────────────────────────────────────────────────────────────┐
│  📋 Pointage — Chantier Résidence Les Pins — 10/04/2026     │
│  ┌──────────────┬────────────┬───────┬───────┬───────┬─────┐ │
│  │ Nom          │ Entreprise │ Arr.  │ Dép.  │ Statut│Tâche│ │
│  ├──────────────┼────────────┼───────┼───────┼───────┼─────┤ │
│  │ Dupont Jean  │ Interne    │ 07:00 │ —     │ ✅    │ Cof.│ │
│  │ Martin Paul  │ SousT ABC  │ 07:30 │ —     │ ✅    │ Fer.│ │
│  │ Silva Carlos │ SousT XYZ  │ —     │ —     │ ❌    │ —   │ │
│  └──────────────┴────────────┴───────┴───────┴───────┴─────┘ │
│  [+ Ajouter]  [🎙 Vocal]  Effectif total : 2/3              │
└──────────────────────────────────────────────────────────────┘
4.3 Météo du chantier
4.3.1 Description
Enregistrer les conditions météorologiques constatées sur le chantier. La météo est un élément clé du journal de chantier (justification d'arrêts, de retards, etc.).

4.3.2 Règles fonctionnelles
ID	Règle
MTO-01	Enregistrement de la météo au minimum 2 fois par jour (matin et après-midi)
MTO-02	Données saisies : Température (°C), Vent (km/h), Précipitations (type + intensité), conditions générales (Ensoleillé, Nuageux, Pluie, Neige, Gel, Brouillard, Tempête)
MTO-03	Pré-remplissage automatique via API météo (OpenWeatherMap) basé sur la géolocalisation du chantier
MTO-04	Le chef de chantier peut corriger / surcharger les données automatiques
MTO-05	Indicateur d'impact : « Météo favorable » / « Météo défavorable — Impact sur l'avancement »
MTO-06	Si météo défavorable, champ commentaire obligatoire (description de l'impact)
MTO-07	Saisie vocale : « Météo matin : pluie forte, 8 degrés, vent 40 km/h, arrêt du coulage »
4.3.3 Écrans
Écran	Description
E-MTO-01	Carte météo du jour (matin / après-midi) avec icônes visuelles
E-MTO-02	Formulaire de saisie / correction météo
4.3.4 Maquette conceptuelle
┌─────────────────────────────────────────────────┐
│  🌤 Météo — 10/04/2026                          │
│                                                  │
│  ┌─── Matin (08:00) ───┐  ┌── Après-midi (14h) ┐│
│  │ ☁️ Nuageux           │  │ 🌧 Pluie modérée   ││
│  │ 12°C | Vent 20 km/h │  │ 10°C | Vent 35 km/h││
│  │ ✅ Favorable         │  │ ⚠️ Défavorable      ││
│  │                      │  │ Impact : Arrêt      ││
│  │                      │  │ coulage dalle N3    ││
│  └──────────────────────┘  └────────────────────┘│
│  [🎙 Saisie vocale]  [✏️ Modifier]               │
└─────────────────────────────────────────────────┘
4.4 Suivi du matériel & engins
4.4.1 Description
Tracker l'utilisation des engins de chantier (grues, pelleteuses, bétonnières, etc.) et du matériel significatif. Permet de justifier les coûts de location et de planifier la maintenance.

4.4.2 Règles fonctionnelles
ID	Règle
MAT-01	Catalogue de matériel / engins pré-configuré (import ERP ou saisie manuelle)
MAT-02	Pour chaque engin/matériel utilisé dans la journée : heure de début, heure de fin, durée calculée
MAT-03	Statut de l'engin : En service, En panne, En attente, Non utilisé
MAT-04	Champ « Observation » libre (ex : « fuite hydraulique sur pelle 320 »)
MAT-05	Association à un opérateur (ouvrier du pointage)
MAT-06	Distinction : Matériel propre vs. Location externe (avec n° contrat de location)
MAT-07	Compteur kilométrique / horométrique (optionnel, saisie manuelle)
MAT-08	Alerte automatique si un engin est déclaré « en panne » → notification conducteur de travaux
MAT-09	Saisie vocale : « La grue Liebherr a travaillé de 8h à 16h, opérateur Martin »
4.4.3 Écrans
Écran	Description
E-MAT-01	Liste du matériel utilisé aujourd'hui (tableau avec filtre par type / statut)
E-MAT-02	Fiche détaillée d'un engin (historique d'utilisation, pannes, etc.)
E-MAT-03	Formulaire d'ajout / modification d'une utilisation
4.5 Presqu'accidents & Sécurité
4.5.1 Description
Enregistrer tout événement de type « presqu'accident » (near miss) survenu sur le chantier. Cette fonctionnalité est critique pour la conformité réglementaire et l'amélioration continue de la sécurité.

4.5.2 Règles fonctionnelles
ID	Règle
SEC-01	Un presqu'accident est un événement qui aurait pu causer un dommage corporel ou matériel
SEC-02	Données obligatoires : Date/heure, lieu précis sur le chantier, description, gravité potentielle
SEC-03	Échelle de gravité potentielle : Faible, Modéré, Grave, Critique
SEC-04	Catégorisation : Chute de hauteur, Chute de plain-pied, Chute d'objet, Électrique, Écrasement/coincement, Chimique, Incendie, Autre
SEC-05	Personnes impliquées (optionnel — lien avec pointage)
SEC-06	Actions correctives immédiates prises (texte libre)
SEC-07	Actions correctives à planifier (texte + responsable + échéance)
SEC-08	Possibilité de joindre 1 à N photos (lien avec module Photos)
SEC-09	Champ « Témoin(s) » avec saisie de nom(s)
SEC-10	Le presqu'accident est horodaté automatiquement à la saisie
SEC-11	Notification automatique au responsable sécurité si gravité ≥ Grave
SEC-12	Saisie vocale : « Presqu'accident à 10h30, zone coffrage niveau 2, chute d'un panneau de coffrage, gravité grave, personne blessée : non »
SEC-13	Export spécifique pour le registre sécurité (format PDF séparé)
4.5.3 Écrans
Écran	Description
E-SEC-01	Liste des presqu'accidents du chantier (filtre par date, gravité, catégorie)
E-SEC-02	Formulaire de déclaration (guidé, étape par étape)
E-SEC-03	Fiche détaillée (avec photos, actions correctives, suivi)
4.5.4 Maquette conceptuelle
┌───────────────────────────────────────────────────────────┐
│  ⚠️ Presqu'accidents — Chantier Résidence Les Pins        │
│                                                           │
│  ┌─── 10/04 10:30 ──────────────────────────────────────┐ │
│  │ 🔴 GRAVE — Chute d'objet                             │ │
│  │ Zone coffrage Niveau 2                                │ │
│  │ Panneau de coffrage mal arrimé tombé de 3m            │ │
│  │ ✅ Action immédiate : Zone sécurisée, briefing équipe │ │
│  │ 📷 2 photos jointes                                   │ │
│  │ [Voir détail]                                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                           │
│  [+ Déclarer un presqu'accident]  [🎙 Vocal]             │
└───────────────────────────────────────────────────────────┘
4.6 Photos & Anomalies
4.6.1 Description
Permettre au chef de chantier de prendre des photos et de les rattacher à des événements (anomalies, avancement, presqu'accidents, livraisons).

4.6.2 Règles fonctionnelles
ID	Règle
PHO-01	Prise de photo via la webcam du PC ou import depuis le disque / clé USB
PHO-02	Chaque photo est horodatée et géolocalisée (si GPS disponible)
PHO-03	Catégorisation obligatoire : Anomalie, Avancement, Sécurité, Livraison, Autre
PHO-04	Champ description / commentaire associé
PHO-05	Possibilité d'annoter la photo (flèches, cercles, texte) directement dans l'app
PHO-06	Rattachement optionnel à un événement existant (presqu'accident, pointage, etc.)
PHO-07	Galerie de photos du jour avec miniatures
PHO-08	Stockage local (mode offline) puis synchronisation vers le cloud
PHO-09	Compression automatique pour optimiser le stockage (qualité réglable)
PHO-10	Saisie vocale du commentaire : « Photo anomalie : ferraillage non conforme dalle niveau 3 »
4.6.3 Écrans
Écran	Description
E-PHO-01	Galerie de photos du jour (grille de miniatures avec filtre par catégorie)
E-PHO-02	Vue plein écran d'une photo avec annotations et métadonnées
E-PHO-03	Formulaire de capture / import
4.7 Bons de livraison
4.7.1 Description
Scanner ou photographier les bons de livraison reçus sur le chantier, les numériser (OCR) et en extraire les données clés pour alimenter le journal et l'ERP.

4.7.2 Règles fonctionnelles
ID	Règle
BDL-01	Capture du bon par scan (scanner USB) ou photo (webcam / import fichier)
BDL-02	OCR automatique via Azure AI Document Intelligence pour extraire : fournisseur, n° bon, date, liste des matériaux (désignation, quantité, unité)
BDL-03	Affichage côte à côte : image du bon ↔ données extraites
BDL-04	Le chef de chantier valide / corrige les données extraites
BDL-05	Statut du bon : Conforme, Non conforme (avec motif : manquant, endommagé, erreur qté)
BDL-06	Rattachement au chantier et à la date du jour
BDL-07	Possibilité de saisie manuelle complète si l'OCR échoue
BDL-08	Archivage du document original (image / PDF)
BDL-09	Saisie vocale : « Bon de livraison Fournisseur BétonPlus, 12 m³ béton C25/30, conforme »
BDL-10	Lien avec la commande d'origine si disponible dans l'ERP
4.7.3 Écrans
Écran	Description
E-BDL-01	Liste des bons de livraison du jour (statut, fournisseur, montant)
E-BDL-02	Vue OCR : image du bon + données extraites côte à côte
E-BDL-03	Formulaire de validation / correction
4.7.4 Maquette conceptuelle
┌──────────────────────────────────────────────────────────────┐
│  📄 Bon de livraison — Scan & Extraction                     │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │                      │  │ Fournisseur : BétonPlus      │  │
│  │   [Image du bon]     │  │ N° Bon : BL-2026-04578       │  │
│  │                      │  │ Date : 10/04/2026            │  │
│  │                      │  │ ───────────────────────────  │  │
│  │                      │  │ Béton C25/30    12 m³   ✅   │  │
│  │                      │  │ Adjuvant XF3    200 L   ✅   │  │
│  │                      │  │ Acier HA12      2.5 T   ⚠️   │  │
│  │                      │  │  └→ Livré : 2.0 T (manque)  │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
│                                                              │
│  Statut : ⚠️ Non conforme — Manque 0.5T acier HA12          │
│  [✅ Valider]  [✏️ Corriger]  [🎙 Vocal]                     │
└──────────────────────────────────────────────────────────────┘
4.8 Commande vocale
4.8.1 Description
Permettre au chef de chantier de saisir des informations par la voix, pour une utilisation mains libres ou en déplacement dans le bureau de chantier.

4.8.2 Règles fonctionnelles
ID	Règle
VOC-01	Activation par bouton dédié (icône micro) présent sur chaque module, ou raccourci clavier global (Ctrl+Maj+V)
VOC-02	Reconnaissance vocale en français (France) avec support des termes techniques BTP
VOC-03	Mode dictée : transcription libre → remplissage du champ actif
VOC-04	Mode commande : interprétation de l'intention et routage vers le bon module
VOC-05	Commandes supportées :
— « Ajoute un pointage pour [Nom], arrivé à [heure] »
— « Météo : [conditions], [température], [vent] »
— « Déclare un presqu'accident : [description] »
— « Note : [texte libre] »
— « Photo anomalie : [description] »
— « Bon de livraison [fournisseur], [matériaux] »
— « Engin [nom] en service de [heure] à [heure] »
VOC-06	Feedback visuel pendant l'écoute (animation micro, texte en temps réel)
VOC-07	Confirmation avant enregistrement : affichage du résultat interprété → validation par l'utilisateur
VOC-08	Mode hors-ligne : utilisation du moteur de reconnaissance Windows intégré (qualité dégradée acceptée)
VOC-09	Mode en ligne : Azure Speech Services pour une meilleure précision
VOC-10	Historique des commandes vocales consultable (pour correction a posteriori)
4.8.3 Flux de traitement vocal
 🎙 Activation micro
       │
       ▼
 ┌─────────────┐
 │  Écoute &   │
 │ Transcription│
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │  Analyse    │
 │  d'intention│  (NLP — Azure Language Understanding)
 └──────┬──────┘
        │
        ▼
 ┌──────────────┐
 │  Routage     │ → Module cible (Pointage / Météo / Sécurité / etc.)
 │  + Extraction│ → Paramètres extraits (nom, heure, description, etc.)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │  Affichage   │ → Prévisualisation des données interprétées
 │  Confirmation│ → [Valider] / [Corriger] / [Annuler]
 └──────────────┘
4.8.4 Écrans
Écran	Description
E-VOC-01	Overlay d'écoute vocale (barre flottante en bas de l'écran avec visualisation audio)
E-VOC-02	Popup de confirmation (données interprétées + boutons Valider / Corriger / Annuler)
4.9 Timeline des événements
4.9.1 Description
Vue chronologique de tous les événements enregistrés dans la journée (ou sur une période). C'est la vue centrale de l'application, le « fil d'actualité » du chantier.

4.9.2 Règles fonctionnelles
ID	Règle
TML-01	Affichage chronologique vertical (le plus récent en haut ou en bas, configurable)
TML-02	Chaque événement est représenté par une carte avec : icône type, heure, titre résumé, aperçu
TML-03	Types d'événements affichés : Pointage, Météo, Matériel, Presqu'accident, Photo, Bon de livraison, Note libre
TML-04	Code couleur par type d'événement
TML-05	Filtrage par type d'événement (multi-sélection)
TML-06	Filtrage par plage horaire
TML-07	Recherche textuelle dans les événements
TML-08	Clic sur une carte → navigation vers le détail complet de l'événement
TML-09	Indicateurs visuels pour les événements importants (presqu'accidents, anomalies)
TML-10	Miniature de photo si l'événement contient des photos
TML-11	Navigation par date (calendrier) pour consulter les journaux passés
TML-12	Compteurs en haut : nombre d'événements par type
TML-13	Ajout rapide depuis la timeline : bouton « + » avec choix du type
4.9.3 Maquette conceptuelle
┌─────────────────────────────────────────────────────────────────┐
│  📅 Timeline — 10/04/2026 — Résidence Les Pins                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🔍 Rechercher...   [Tous ▾] [Pointage] [Météo] [Sécu]  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Effectif: 12 | Météo: ⛈ | Engins: 4 | Sécu: 1 | Photos: 5   │
│                                                                 │
│  ── 16:30 ──────────────────────────────────────────────────    │
│  │ 📄 Bon de livraison — BétonPlus                          │   │
│  │ BL-2026-04578 | 12 m³ béton C25/30 | ⚠️ Non conforme     │   │
│  │ [Voir détail →]                                          │   │
│                                                                 │
│  ── 14:00 ──────────────────────────────────────────────────    │
│  │ 🌧 Météo après-midi                                      │   │
│  │ Pluie modérée | 10°C | Vent 35 km/h | ⚠️ Défavorable     │   │
│  │ [Voir détail →]                                          │   │
│                                                                 │
│  ── 10:30 ──────────────────────────────────────────────────    │
│  │ ⚠️ PRESQU'ACCIDENT — Chute d'objet                       │   │
│  │ 🔴 Gravité Grave | Zone coffrage N2 | 📷 2 photos        │   │
│  │ [Voir détail →]                                          │   │
│                                                                 │
│  ── 08:00 ──────────────────────────────────────────────────    │
│  │ 🌤 Météo matin                                           │   │
│  │ Nuageux | 12°C | Vent 20 km/h | ✅ Favorable             │   │
│                                                                 │
│  ── 07:00 ──────────────────────────────────────────────────    │
│  │ 👷 Pointage                                               │   │
│  │ 12 ouvriers pointés / 14 prévus | 2 absents              │   │
│  │ [Voir détail →]                                          │   │
│                                                                 │
│  [+ Ajouter un événement]  [🎙 Vocal]  [📊 Générer rapport]   │
└─────────────────────────────────────────────────────────────────┘
4.10 Génération de rapport & Export ERP
4.10.1 Description
Consolider l'ensemble des données du journal de la journée en un rapport structuré, le faire valider par le chef de chantier, puis l'envoyer dans l'ERP de l'entreprise.

4.10.2 Règles fonctionnelles
ID	Règle
RPT-01	Le rapport est généré automatiquement à partir de toutes les données saisies dans la journée
RPT-02	Structure du rapport :
1. En-tête (Chantier, Date, Chef de chantier)
2. Conditions météo
3. Effectif présent (tableau récapitulatif)
4. Matériel & engins utilisés
5. Travaux réalisés (notes libres)
6. Livraisons reçues
7. Événements sécurité / presqu'accidents
8. Photos & anomalies
9. Observations générales
RPT-03	Prévisualisation du rapport (format PDF) avant envoi
RPT-04	Possibilité d'ajouter des commentaires / observations générales avant envoi
RPT-05	Signature électronique du chef de chantier (dessin tactile ou validation par code PIN)
RPT-06	Export en PDF (stockage local + archivage cloud)
RPT-07	Envoi vers l'ERP via API (REST / OData)
RPT-08	Mapping configurable : chaque section du rapport est mappée vers les entités ERP correspondantes
RPT-09	Gestion des erreurs d'envoi : retry automatique, file d'attente, notification en cas d'échec
RPT-10	Statuts du rapport : Brouillon, En attente de validation, Validé, Envoyé, Erreur d'envoi
RPT-11	Historique des rapports envoyés (consultable, re-téléchargeable)
RPT-12	Le conducteur de travaux peut avoir un rôle de validation avant envoi ERP (workflow optionnel)
4.10.3 Flux d'envoi ERP
 ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
 │   Rapport    │ ──▶ │  Validation  │ ──▶ │   Envoi      │
 │   Brouillon  │     │  Chef chant. │     │   ERP        │
 └──────────────┘     └──────┬───────┘     └──────┬───────┘
                             │                     │
                      (optionnel)                  │
                             ▼                     ▼
                      ┌──────────────┐     ┌──────────────┐
                      │  Validation  │     │  Archivage   │
                      │  Conducteur  │     │  PDF + Cloud │
                      └──────────────┘     └──────────────┘
4.10.4 Mapping ERP (exemple SAP)
Donnée Journal	Entité ERP	Champs ERP
Pointage ouvriers	Saisie des temps (CATS)	PERNR, BEGUZ, ENDUZ, AUFNR
Matériel utilisé	Confirmation d'ordre (CO11N)	AUFNR, MATNR, GAMNG
Bons de livraison	Entrée de marchandises (MIGO)	EBELN, MATNR, MENGE
Presqu'accidents	HSE / QM Notification (QM01)	QMNUM, QMART, QMTXT
Météo	Champ personnalisé projet	Z_METEO, Z_IMPACT
4.10.5 Écrans
Écran	Description
E-RPT-01	Prévisualisation du rapport (format imprimable, scroll, zoom)
E-RPT-02	Écran de validation et signature
E-RPT-03	Historique des rapports avec statut d'envoi
E-RPT-04	Configuration du mapping ERP (admin)
5. Parcours utilisateur
5.1 Journée type du chef de chantier
07:00  Arrivée sur chantier
  │    → Ouverture de l'application, sélection du chantier
  │    → Pointage des premiers ouvriers (saisie ou vocal)
  │
08:00  Début des travaux
  │    → Saisie météo matin (auto-complétée)
  │    → Déclaration des engins mis en service
  │
10:30  Événement sécurité
  │    → Déclaration vocale d'un presqu'accident
  │    → Prise de 2 photos de la zone
  │
12:00  Pause déjeuner
  │
14:00  Livraison béton
  │    → Scan du bon de livraison (OCR)
  │    → Validation des quantités
  │    → Saisie météo après-midi
  │
16:30  Fin de journée
  │    → Pointage des départs
  │    → Déclaration des heures d'arrêt des engins
  │    → Ajout d'observations générales
  │
17:00  Génération du rapport
  │    → Prévisualisation
  │    → Signature
  │    → Envoi ERP
  │
  ▼  Fin
5.2 Parcours critique — Saisie vocale d'un presqu'accident
 Utilisateur                          Application
     │                                    │
     │  Appuie sur 🎙 (ou Ctrl+Maj+V)    │
     │ ──────────────────────────────────▶ │
     │                                    │  Activation écoute
     │  « Presqu'accident à 10h30,        │
     │    zone coffrage niveau 2,         │
     │    chute d'un panneau,             │
     │    gravité grave »                 │
     │ ──────────────────────────────────▶ │
     │                                    │  Transcription
     │                                    │  Analyse d'intention → Module Sécurité
     │                                    │  Extraction paramètres :
     │                                    │    - Heure : 10:30
     │                                    │    - Zone : Coffrage N2
     │                                    │    - Description : Chute panneau
     │                                    │    - Gravité : Grave
     │                                    │
     │  ◀──────────────────────────────── │  Affiche popup confirmation
     │                                    │
     │  Clique [Valider]                  │
     │ ──────────────────────────────────▶ │
     │                                    │  Enregistrement
     │                                    │  Notification responsable sécurité
     │                                    │  Ajout à la Timeline
     │  ◀──────────────────────────────── │  Confirmation visuelle ✅
     │                                    │
     │  « Ajouter 2 photos »             │
     │ ──────────────────────────────────▶ │
     │                                    │  Ouverture capture photo
     │                                    │  Rattachement au presqu'accident
6. Ergonomie & Design
6.1 Principes directeurs
#	Principe	Application
UX-01	Gros boutons, zones de clic larges	Utilisateur parfois avec gants, écran parfois en plein soleil
UX-02	Contraste élevé	Fond blanc / texte noir, couleurs vives pour les icônes et alertes
UX-03	Navigation à 1 clic	Barre de navigation latérale avec icônes + texte, accès direct aux modules
UX-04	Saisie minimale	Pré-remplissage, listes déroulantes, vocal, OCR
UX-05	Feedback immédiat	Confirmation visuelle (toast) après chaque action, animation de sauvegarde
UX-06	Mode sombre optionnel	Pour utilisation en faible luminosité
UX-07	Responsive	Adaptation aux écrans 13" à 24" (PC portable de chantier à écran de bureau)
UX-08	Raccourcis clavier	Ctrl+P : Pointage, Ctrl+M : Météo, Ctrl+S : Sécurité, Ctrl+Maj+V : Vocal
UX-09	Persistance automatique	Pas de bouton « Sauvegarder » — tout est enregistré automatiquement
UX-10	Indicateur hors-ligne	Bandeau visible quand l'app est déconnectée + compteur d'éléments en attente de sync
6.2 Structure de l'interface
┌─────────────────────────────────────────────────────────────────────┐
│  ▐█▌ Journal de Chantier    Résidence Les Pins ▾    10/04/2026 📅  │
│  ─────────────────────────────────────────────── 🔴 Hors-ligne (3) │
├───────────┬─────────────────────────────────────────────────────────┤
│           │                                                         │
│  🏠 Home  │                                                         │
│           │              [ ZONE DE CONTENU PRINCIPALE ]             │
│  📋 Pointage│                                                       │
│           │         (Timeline / Module sélectionné)                 │
│  🌤 Météo │                                                         │
│           │                                                         │
│  🏗 Matériel│                                                       │
│           │                                                         │
│  ⚠️ Sécurité│                                                       │
│           │                                                         │
│  📷 Photos │                                                        │
│           │                                                         │
│  📄 Livraisons│                                                     │
│           │                                                         │
│  📊 Rapport│                                                        │
│           │                                                         │
├───────────┴──────────────────────────────────────────────────┬──────┤
│  [+ Ajouter]    [🎙 Commande vocale]                         │ 👤 MS│
└──────────────────────────────────────────────────────────────┴──────┘
6.3 Charte visuelle
Élément	Spécification
Police principale	Segoe UI (cohérence Windows)
Taille de base	16px
Couleur primaire	#0078D4 (bleu Microsoft) ou couleur brand entreprise
Couleur danger	#D13438 (rouge alertes sécurité)
Couleur succès	#107C10 (vert validation)
Couleur warning	#FFB900 (jaune attention)
Bordures	Arrondies (8px radius)
Ombres	Subtiles (Material Design elevation 2)
Icônes	Fluent UI Icons (cohérence Windows)
Espacement	Grille de 8px
7. Modèle de données
7.1 Diagramme Entité-Relation (simplifié)
┌──────────┐       ┌──────────┐       ┌───────────┐
│ Chantier │1────N│  Journal  │1────N│ Événement │
└──────────┘       │  (Date)  │       └─────┬─────┘
                   └──────────┘             │
                                     ┌──────┴──────┐
                              ┌──────┴──┐  ┌───────┴──────┐
                              │Pointage │  │PresquAccident│
                              └─────────┘  └──────────────┘
                              ┌──────────┐ ┌──────────────┐
                              │  Météo   │ │ BonLivraison │
                              └──────────┘ └──────────────┘
                              ┌──────────┐ ┌──────────────┐
                              │ Matériel │ │    Photo     │
                              └──────────┘ └──────────────┘
7.2 Entités détaillées
Chantier
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
code_chantier	string(20)	Oui	Code ERP
nom	string(200)	Oui	Nom du chantier
adresse	string(500)	Oui	Adresse complète
latitude	decimal	Non	Coordonnée GPS
longitude	decimal	Non	Coordonnée GPS
client	string(200)	Oui	Nom du client / maître d'ouvrage
date_debut	date	Oui	Date de début
date_fin_prevue	date	Non	Date de fin prévisionnelle
statut	enum	Oui	(EnCours, Terminé, Suspendu)
JournalChantier
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
chantier_id	GUID (FK)	Oui	Référence chantier
date	date	Oui	Date du journal
chef_chantier_id	GUID (FK)	Oui	Auteur
statut_rapport	enum	Oui	(Brouillon, Validé, Envoyé, Erreur)
observations_generales	text	Non	Commentaires du chef
signature	blob	Non	Signature électronique
date_envoi_erp	datetime	Non	Horodatage envoi
Pointage
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
journal_id	GUID (FK)	Oui	Référence journal
ouvrier_id	GUID (FK)	Oui	Référence ouvrier
heure_arrivee	time	Non	Heure d'arrivée
heure_depart	time	Non	Heure de départ
statut	enum	Oui	(Présent, Absent, Retard, DépartAnticipé)
qualification	string(100)	Non	Tâche/poste
commentaire	text	Non	Observations
Ouvrier
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
nom	string(100)	Oui	Nom de famille
prenom	string(100)	Oui	Prénom
entreprise	string(200)	Oui	Entreprise (interne ou sous-traitant)
matricule	string(20)	Non	Matricule ERP
qualification_principale	string(100)	Non	Métier principal
Meteo
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
journal_id	GUID (FK)	Oui	Référence journal
periode	enum	Oui	(Matin, ApresMidi)
heure_releve	time	Oui	Heure du relevé
temperature_c	decimal	Oui	Température en °C
vent_kmh	decimal	Non	Vitesse du vent
condition	enum	Oui	(Ensoleillé, Nuageux, Pluie, Neige, Gel, Brouillard, Tempête)
precipitation_type	string(50)	Non	Type de précipitation
precipitation_intensite	enum	Non	(Faible, Modérée, Forte)
impact	enum	Oui	(Favorable, Défavorable)
commentaire_impact	text	Conditionnel	Obligatoire si Défavorable
source	enum	Oui	(Automatique, Manuel)
UtilisationMateriel
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
journal_id	GUID (FK)	Oui	Référence journal
materiel_id	GUID (FK)	Oui	Référence matériel
heure_debut	time	Oui	Début d'utilisation
heure_fin	time	Non	Fin d'utilisation
operateur_id	GUID (FK)	Non	Ouvrier opérateur
statut	enum	Oui	(EnService, EnPanne, EnAttente, NonUtilisé)
compteur_horometrique	decimal	Non	Relevé horométrique
observation	text	Non	Remarques
Materiel
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
designation	string(200)	Oui	Nom / modèle
type	enum	Oui	(Grue, Pelleteuse, Bétonnière, Compacteur, Chariot, Échafaudage, Autre)
numero_serie	string(50)	Non	N° de série
proprietaire	enum	Oui	(Propre, Location)
numero_contrat_location	string(50)	Non	Si location
immatriculation	string(20)	Non	Si véhicule
PresquAccident
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
journal_id	GUID (FK)	Oui	Référence journal
date_heure	datetime	Oui	Date et heure de l'événement
lieu	string(200)	Oui	Localisation sur le chantier
description	text	Oui	Description détaillée
categorie	enum	Oui	(ChuteHauteur, ChutePlainPied, ChuteObjet, Electrique, Ecrasement, Chimique, Incendie, Autre)
gravite_potentielle	enum	Oui	(Faible, Modéré, Grave, Critique)
personnes_impliquees	text	Non	Noms des personnes
temoins	text	Non	Noms des témoins
action_immediate	text	Non	Actions correctives immédiates
action_planifiee	text	Non	Actions à planifier
action_responsable	string(200)	Non	Responsable de l'action
action_echeance	date	Non	Date limite action
Photo
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
journal_id	GUID (FK)	Oui	Référence journal
chemin_fichier	string(500)	Oui	Chemin local du fichier
chemin_cloud	string(500)	Non	URL cloud après sync
date_heure_prise	datetime	Oui	Horodatage
categorie	enum	Oui	(Anomalie, Avancement, Sécurité, Livraison, Autre)
description	text	Non	Commentaire
annotations_json	text	Non	Données d'annotation (JSON)
latitude	decimal	Non	GPS
longitude	decimal	Non	GPS
evenement_lie_id	GUID	Non	FK vers l'événement rattaché
evenement_lie_type	string(50)	Non	Type de l'événement rattaché
BonLivraison
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
journal_id	GUID (FK)	Oui	Référence journal
numero_bon	string(50)	Oui	N° du bon
fournisseur	string(200)	Oui	Nom du fournisseur
date_livraison	date	Oui	Date
statut	enum	Oui	(Conforme, NonConforme)
motif_non_conformite	text	Non	Si non conforme
chemin_document_original	string(500)	Oui	Image/PDF du bon
numero_commande_erp	string(50)	Non	Réf. commande ERP
donnees_ocr_json	text	Non	Résultat OCR brut
LigneBonLivraison
Champ	Type	Obligatoire	Description
id	GUID	Oui	Identifiant unique
bon_livraison_id	GUID (FK)	Oui	Référence bon
designation	string(200)	Oui	Matériau / produit
quantite_commandee	decimal	Non	Quantité attendue
quantite_livree	decimal	Oui	Quantité reçue
unite	string(20)	Oui	Unité (m³, T, L, pièces, etc.)
conforme	bool	Oui	Ligne conforme ?
commentaire	text	Non	Observation
EvenementTimeline (Vue dénormalisée pour la timeline)
Champ	Type	Description
id	GUID	ID de l'événement source
journal_id	GUID	Référence journal
type	enum	(Pointage, Météo, Matériel, Sécurité, Photo, Livraison, Note)
date_heure	datetime	Horodatage
titre	string(200)	Titre résumé (généré)
apercu	string(500)	Texte d'aperçu (généré)
niveau_importance	enum	(Normal, Important, Critique)
a_photos	bool	Contient des photos ?
source_saisie	enum	(Manuel, Vocal, OCR, Automatique)
8. Exigences non fonctionnelles
8.1 Performance
ID	Exigence	Cible
PERF-01	Temps de démarrage de l'application	< 3 secondes
PERF-02	Temps de réponse saisie (enregistrement local)	< 200 ms
PERF-03	Temps de transcription vocale	< 2 secondes (online), < 5 secondes (offline)
PERF-04	Temps de génération du rapport PDF	< 10 secondes
PERF-05	Temps d'extraction OCR d'un bon de livraison	< 5 secondes
8.2 Fiabilité & Mode hors-ligne
ID	Exigence
REL-01	L'application doit fonctionner à 100 % en mode hors-ligne (sauf OCR cloud et météo auto)
REL-02	Synchronisation automatique dès retour de la connexion
REL-03	Résolution des conflits de sync : dernière écriture gagne (avec historique)
REL-04	Sauvegarde automatique toutes les 30 secondes
REL-05	Base de données locale SQLite avec backup quotidien automatique
REL-06	Pas de perte de données en cas de crash (write-ahead logging)
8.3 Sécurité
ID	Exigence
SEC-NFR-01	Authentification via Azure AD / Entra ID (SSO)
SEC-NFR-02	Chiffrement de la base locale (SQLite Encryption Extension ou SQLCipher)
SEC-NFR-03	Communication API en HTTPS uniquement (TLS 1.2+)
SEC-NFR-04	Tokens JWT avec expiration et refresh
SEC-NFR-05	Journalisation des accès (audit trail)
SEC-NFR-06	Pas de données sensibles dans les logs
SEC-NFR-07	RBAC : rôles Chef de chantier, Conducteur de travaux, Administrateur
8.4 Compatibilité
ID	Exigence
COMP-01	Windows 10 (21H2+) et Windows 11
COMP-02	Résolution minimale : 1366 x 768
COMP-03	Résolution recommandée : 1920 x 1080
COMP-04	Support High DPI (125%, 150%)
COMP-05	Fonctionne avec ou sans connexion Internet
COMP-06	Compatible avec les principaux ERP du BTP (SAP, Sage, Oracle, Cegid) via connecteurs configurables
8.5 Accessibilité
ID	Exigence
ACC-01	Navigation complète au clavier
ACC-02	Support lecteur d'écran (Narrator, NVDA)
ACC-03	Ratio de contraste minimum WCAG AA (4.5:1)
ACC-04	Taille de police ajustable
9. Intégrations externes
9.1 Cartographie des intégrations
                    ┌─────────────────────┐
                    │  Journal Chantier   │
                    │     (Desktop)       │
                    └──────┬──┬──┬───────┘
                           │  │  │
              ┌────────────┘  │  └─────────────┐
              ▼               ▼                ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Azure Speech │  │ Azure AI Doc │  │ API Météo    │
   │ Services     │  │ Intelligence │  │ (OpenWeather)│
   │ (Vocal)      │  │ (OCR)        │  │              │
   └──────────────┘  └──────────────┘  └──────────────┘
              │               │                │
              └───────┬───────┘                │
                      ▼                        │
              ┌──────────────┐                 │
              │ Azure Blob   │                 │
              │ Storage      │                 │
              │ (Photos)     │                 │
              └──────────────┘                 │
                      │                        │
                      ▼                        │
              ┌──────────────┐                 │
              │  Backend API │ ◀───────────────┘
              │ (ASP.NET)    │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   ERP        │
              │ (SAP/Sage/   │
              │  Cegid/...)  │
              └──────────────┘
9.2 Détail des intégrations
Intégration	Direction	Protocole	Fréquence	Mode offline
Azure Speech Services	App → Azure	SDK / WebSocket	Temps réel	Fallback Windows Speech
Azure AI Document Intelligence	App → Azure	REST API	À la demande	Saisie manuelle
API Météo	Azure → App	REST API	2x/jour	Saisie manuelle
Azure Blob Storage	App ↔ Azure	SDK	Sync batch	Stockage local
Backend API (.NET)	App ↔ Backend	REST / HTTPS	Sync	File d'attente locale
ERP	Backend → ERP	REST / OData / RFC	Après validation rapport	File d'attente backend
9.3 Connector ERP
Le connecteur ERP est un composant configurable côté backend :

Configuration par fichier JSON : mapping entre les entités du journal et les entités ERP
Transformateurs : classes de transformation pour adapter les données au format attendu par l'ERP
Connecteurs : implémentation spécifique par ERP (SAP, Sage, Cegid, etc.)
File d'attente : les envois échoués sont mis en file d'attente et relancés automatiquement
Logs : toutes les interactions avec l'ERP sont tracées
10. Glossaire
Terme	Définition
BTP	Bâtiment et Travaux Publics
Chef de chantier	Responsable opérationnel d'un chantier, encadre les ouvriers
Conducteur de travaux	Supervise plusieurs chantiers, valide les rapports
Journal de chantier	Document quotidien retraçant tous les événements d'un chantier
Presqu'accident	Événement non planifié qui n'a pas causé de blessure ou de dommage, mais qui aurait pu le faire (near miss)
Pointage	Enregistrement de la présence et des heures de travail
Bon de livraison	Document accompagnant une livraison de matériaux
OCR	Reconnaissance optique de caractères (Optical Character Recognition)
ERP	Enterprise Resource Planning — logiciel de gestion intégré de l'entreprise
Horométrique	Compteur mesurant les heures de fonctionnement d'un engin
SSO	Single Sign-On — authentification unique
RBAC	Role-Based Access Control — contrôle d'accès basé sur les rôles
Algeco	Bureau de chantier préfabriqué / modulaire
Annexes
A. Liste des écrans
Code	Module	Écran
E-AUTH-01	Auth	Login
E-AUTH-02	Auth	Sélection chantier
E-PTG-01	Pointage	Liste ouvriers du jour
E-PTG-02	Pointage	Formulaire pointage
E-PTG-03	Pointage	Récapitulatif par entreprise
E-MTO-01	Météo	Carte météo du jour
E-MTO-02	Météo	Formulaire météo
E-MAT-01	Matériel	Liste matériel du jour
E-MAT-02	Matériel	Fiche détaillée engin
E-MAT-03	Matériel	Formulaire utilisation
E-SEC-01	Sécurité	Liste presqu'accidents
E-SEC-02	Sécurité	Formulaire déclaration
E-SEC-03	Sécurité	Fiche détaillée
E-PHO-01	Photos	Galerie du jour
E-PHO-02	Photos	Vue plein écran + annotations
E-PHO-03	Photos	Formulaire capture / import
E-BDL-01	Livraisons	Liste bons du jour
E-BDL-02	Livraisons	Vue OCR + données extraites
E-BDL-03	Livraisons	Formulaire validation
E-VOC-01	Vocal	Overlay écoute
E-VOC-02	Vocal	Popup confirmation
E-TML-01	Timeline	Vue timeline principale
E-RPT-01	Rapport	Prévisualisation PDF
E-RPT-02	Rapport	Validation & signature
E-RPT-03	Rapport	Historique rapports
E-RPT-04	Rapport	Configuration mapping ERP
B. Règles de nommage
Identifiants des règles : [MODULE]-[NN] (ex: PTG-01, SEC-05)
Identifiants des écrans : E-[MODULE]-[NN] (ex: E-PTG-01)
Identifiants des exigences NF : [CATÉGORIE]-[NN] (ex: PERF-01, REL-03)
C. Priorités de développement (MVP)
Priorité	Module	Justification
P0 (MVP)	Auth + Chantier	Prérequis à tout
P0 (MVP)	Timeline	Vue centrale, structurante
P0 (MVP)	Pointage	Besoin quotidien n°1
P0 (MVP)	Météo	Obligatoire dans le journal
P1	Matériel & engins	Important pour traçabilité coûts
P1	Presqu'accidents	Critique sécurité
P1	Photos	Support transverse
P1	Rapport + Export ERP	Objectif final
P2	Commande vocale	Confort d'usage, différenciateur
P2	OCR Bons de livraison	Gain de temps significatif
P3	Mode offline complet	Robustesse terrain
Document généré le 10/04/2026 — Version 1.0 — Draft