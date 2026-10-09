# E-Clinique — Application de gestion de clinique

Application complète de gestion de clinique médicale (e-clinique) construite avec :

- **Backend** : Spring Boot 3, Spring Security (JWT), Spring Data JPA, iText (PDF)
- **Frontend** : Angular 17 (standalone components), Bootstrap 5, Bootstrap Icons

## Fonctionnalités

- 🔐 **Authentification & rôles** : ADMIN, MEDECIN, INFIRMIER, PHARMACIEN, RECEPTIONNISTE (JWT)
- 🗂️ **Dossiers patients** : création, modification, recherche, historique des consultations
- 📅 **Planification des rendez-vous** : création, changement de statut, détection des conflits d'horaire pour un médecin
- 🩺 **Consultations / dossier médical** : motif, symptômes, diagnostic, constantes vitales, prescriptions
- 💊 **Gestion automatisée des stocks de médicaments** : le stock est décrémenté automatiquement à chaque prescription ; alertes de seuil bas et de péremption proche ; historique complet des mouvements (entrée / sortie / ajustement)
- 🧾 **Facturation** : création de factures multi-lignes, remise, paiement, annulation
- 🖨️ **Impression** : génération de reçus de paiement et de rapports médicaux détaillés au format PDF
- 🕵️ **Journal d'audit (audit logs)** : traçabilité automatique de toutes les actions sensibles (créations, modifications, suppressions, paiements, mouvements de stock, connexions/déconnexions), consultable et filtrable depuis l'interface (réservé aux administrateurs)

## Structure du projet

```
e-clinique/
├── backend/     → API REST Spring Boot (port 8282, contexte /api)
└── frontend/    → Application Angular 17 (port 4200)
```

## Démarrage rapide du backend

Prérequis : **Java 17**, **Maven 3.9+** et **PostgreSQL 14+**

Créez la base PostgreSQL avant le démarrage :

```sql
CREATE DATABASE eclinique;
```

```bash
cd backend
mvn spring-boot:run
```

L'application démarre sur `http://localhost:8282/api` avec PostgreSQL. Par défaut, elle utilise l'utilisateur `postgres` et le mot de passe `postgres`. Vous pouvez modifier ces valeurs avec `DB_URL`, `DB_USERNAME` et `DB_PASSWORD`. Un compte administrateur est créé automatiquement au premier démarrage :

- **Utilisateur :** `admin`
- **Mot de passe :** `Admin@123`

Un compte médecin de démonstration est aussi créé :
- **Utilisateur :** `dr.diop`
- **Mot de passe :** `Medecin@123`

La documentation Swagger est accessible sur `http://localhost:8282/api/swagger-ui.html`.

### Démarrer avec Docker Compose

Avec Docker Desktop démarré, lancez PostgreSQL et le backend depuis la racine du projet :

```bash
docker compose up --build
```

Le backend est accessible sur `http://localhost:8282/api` et PostgreSQL sur le port hôte `5435`.
Les données PostgreSQL sont conservées dans le volume Docker `e-clinique2_postgres_data`.
Pour arrêter les services :

```bash
docker compose down
```

## Démarrage rapide du frontend

Prérequis : **Node.js 18+** et **npm**

```bash
cd frontend
npm install
npm start
```

L'application est accessible sur `http://localhost:4200`.

Par défaut, le frontend appelle l'API sur `http://localhost:8282/api` (configurable dans `src/environments/environment.ts`).

## Rôles et permissions (résumé)

| Fonctionnalité              | ADMIN | MEDECIN | INFIRMIER | PHARMACIEN | RECEPTIONNISTE |
|------------------------------|:-----:|:-------:|:---------:|:----------:|:--------------:|
| Gérer les utilisateurs       |  ✅   |    ❌   |    ❌     |     ❌     |       ❌       |
| Gérer les patients           |  ✅   |    ✅   |    ✅     |     ❌     |       ✅       |
| Gérer les rendez-vous        |  ✅   |    ✅   |    ❌     |     ❌     |       ✅       |
| Créer une consultation       |  ✅   |    ✅   |    ❌     |     ❌     |       ❌       |
| Gérer la pharmacie / stock   |  ✅   |    ❌   |    ❌     |     ✅     |       ❌       |
| Gérer les factures           |  ✅   |    ✅*  |    ❌     |     ❌     |       ✅       |
| Consulter le journal d'audit  |  ✅   |    ❌   |    ❌     |     ❌     |       ❌       |

*le médecin peut créer une facture liée à sa consultation.

## Journal d'audit

Chaque action sensible est consignée automatiquement dans une table `audit_logs`, sans que le code métier n'ait à s'en soucier :

- Une annotation `@Audite(action = ..., entite = "...")` posée sur une méthode de service (`PatientService.create`, `FactureService.marquerPayee`, `StockService.enregistrerMouvement`, etc.) suffit à déclencher l'enregistrement.
- Un aspect Spring AOP (`AuditAspect`) intercepte ces méthodes, capture automatiquement l'utilisateur connecté (via le contexte de sécurité), l'entité concernée, son identifiant, et le résultat (succès/échec).
- Les connexions et déconnexions sont tracées explicitement dans `AuthService` (y compris les tentatives de connexion échouées, utile pour détecter des tentatives d'intrusion).
- L'écriture d'un log ne peut jamais faire échouer l'action métier : toute erreur d'écriture est absorbée et journalisée côté serveur.
- Consultation via `GET /api/audit-logs` (filtres : utilisateur, entité, type d'action, période ; pagination), réservé au rôle **ADMIN**.
- Page dédiée côté frontend : **Journal d'audit** (visible uniquement pour les administrateurs dans le menu).

## Notes techniques

- Le backend applique une politique **stateless** avec un jeton **JWT** transmis dans l'en-tête `Authorization: Bearer <token>`.
- La décrémentation du stock est **transactionnelle** : si le stock est insuffisant lors d'une prescription, la consultation entière est annulée (rollback).
- Les PDF (reçus et rapports médicaux) sont générés côté serveur avec **iText 5** et renvoyés en tant que flux binaire (`application/pdf`), ouverts et imprimés automatiquement côté client.
- Le frontend utilise l'API Angular 17 **standalone components** avec `provideRouter` et `provideHttpClient`, sans NgModules.

## Prochaines évolutions suggérées

- Vue calendrier interactive pour les rendez-vous
- Notifications par email/SMS de rappel de rendez-vous
- Gestion des assurances et tiers-payant
- Export comptable des factures
