# Déploiement E-Clinique avec Docker Hub

Ce guide décrit le processus complet de déploiement de l'application E-Clinique en utilisant uniquement les images Docker publiées sur Docker Hub.

## 📋 Architecture du déploiement

```
Docker Hub Registry
├── moncompte/eclinique-backend:1.0.0
├── moncompte/eclinique-backend:latest
├── moncompte/eclinique-frontend:1.0.0
└── moncompte/eclinique-frontend:latest

↓ docker pull (développement ou production)

Machine cible
├── Frontend Nginx (port 80)
├── Backend Java (port 8282)
└── PostgreSQL (port 5432, interne uniquement)
```

## 🔑 Prérequis

**Sur la machine de développement (Mac) :**
- Docker Desktop
- Docker Compose

**Sur la machine cible :**
- Docker Desktop ou Docker Engine
- Docker Compose
- Pas besoin de : Node.js, npm, Java, Maven, ou code source

## 📦 Étape 1 : Créer les repositories Docker Hub

1. Va sur [Docker Hub](https://hub.docker.com)
2. Crée deux repositories publics (gratuits) :
   - `eclinique-backend`
   - `eclinique-frontend`

Exemple d'URL pour les repositories :
```
https://hub.docker.com/r/moncompte/eclinique-backend
https://hub.docker.com/r/moncompte/eclinique-frontend
```

Remplace `moncompte` par ton identifiant Docker Hub.

## 🔐 Étape 2 : S'authentifier à Docker Hub

```bash
docker login
```

Saisis ton identifiant Docker Hub et un **Access Token** (pas le mot de passe principal) :

- Va sur [Account Settings → Security → Access Tokens](https://hub.docker.com/settings/security)
- Crée un nouveau token avec les permissions `Read & Write`
- Utilise ce token au lieu de ton mot de passe

## 🛠️ Étape 3 : Construire les images localement

Depuis la racine du projet :

```bash
cd /Users/mac/Desktop/e-clinique

# Variables d'environnement
export DOCKERHUB_USERNAME=moncompte
export APP_VERSION=1.0.0
```

Construire le backend :

```bash
docker build \
  -t ${DOCKERHUB_USERNAME}/eclinique-backend:${APP_VERSION} \
  -t ${DOCKERHUB_USERNAME}/eclinique-backend:latest \
  ./backend
```

Construire le frontend :

```bash
docker build \
  -t ${DOCKERHUB_USERNAME}/eclinique-frontend:${APP_VERSION} \
  -t ${DOCKERHUB_USERNAME}/eclinique-frontend:latest \
  ./frontend
```

Vérifier les images :

```bash
docker images | grep eclinique
```

Résultat attendu :

```
moncompte/eclinique-backend        1.0.0         [id]   100MB
moncompte/eclinique-backend        latest        [id]   100MB
moncompte/eclinique-frontend       1.0.0         [id]   50MB
moncompte/eclinique-frontend       latest        [id]   50MB
```

## ✅ Étape 4 : Tester localement avec docker-compose.prod.yml

Créer un fichier `.env` à la racine du projet :

```env
DOCKERHUB_USERNAME=moncompte
APP_VERSION=1.0.0

POSTGRES_DB=eclinique
POSTGRES_USER=postgres
POSTGRES_PASSWORD=MotDePasseFortetUnique2026
```

Ne **jamais** commiter ce fichier sur Git !

Ajouter `.env` à `.gitignore` :

```bash
echo ".env" >> .gitignore
```

Lancer la stack :

```bash
docker compose -f docker-compose.prod.yml up -d
```

Vérifier l'état :

```bash
docker compose -f docker-compose.prod.yml ps
```

Résultat attendu :

```
NAME                      IMAGE                                    STATUS
eclinique-postgres        postgres:16-alpine                       Up (healthy)
eclinique-backend         moncompte/eclinique-backend:1.0.0        Up
eclinique-frontend        moncompte/eclinique-frontend:1.0.0       Up
```

Tester dans le navigateur :

```
Frontend : http://localhost
Backend  : http://localhost:8282/api/swagger-ui.html
```

Arrêter la stack :

```bash
docker compose -f docker-compose.prod.yml down
```

## 🚀 Étape 5 : Publier les images sur Docker Hub

```bash
docker push ${DOCKERHUB_USERNAME}/eclinique-backend:${APP_VERSION}
docker push ${DOCKERHUB_USERNAME}/eclinique-backend:latest

docker push ${DOCKERHUB_USERNAME}/eclinique-frontend:${APP_VERSION}
docker push ${DOCKERHUB_USERNAME}/eclinique-frontend:latest
```

Vérifier sur Docker Hub :

```
https://hub.docker.com/r/moncompte/eclinique-backend/tags
https://hub.docker.com/r/moncompte/eclinique-frontend/tags
```

Les tags `1.0.0` et `latest` doivent être visibles.

## 🎯 Étape 6 : Déployer sur une autre machine

### Préparer la machine cible

1. Installer Docker Desktop ou Docker Engine
2. Installer Docker Compose
3. S'authentifier à Docker Hub :

```bash
docker login
```

### Copier les fichiers de déploiement

Sur la machine cible, créer un dossier `/opt/eclinique` (ou anywhere) :

```bash
mkdir -p /opt/eclinique
cd /opt/eclinique
```

Copier depuis la machine dev :

```bash
scp docker-compose.prod.yml user@target-machine:/opt/eclinique/
```

### Créer le fichier .env

Sur la machine cible :

```env
DOCKERHUB_USERNAME=moncompte
APP_VERSION=1.0.0

POSTGRES_DB=eclinique
POSTGRES_USER=postgres
POSTGRES_PASSWORD=UnMotDePasseFortUnique2026
```

**Important** : Utiliser un mot de passe **différent** de celui de la machine de développement.

### Déployer l'application

```bash
cd /opt/eclinique

# Télécharger les images
docker compose -f docker-compose.prod.yml pull

# Démarrer la stack
docker compose -f docker-compose.prod.yml up -d

# Vérifier l'état
docker compose -f docker-compose.prod.yml ps
```

### Accéder à l'application

Trouver l'adresse IP de la machine cible :

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Supposons que l'adresse est `192.168.1.100` :

```
Frontend : http://192.168.1.100
Backend  : http://192.168.1.100:8282/api/swagger-ui.html
```

Depuis le téléphone sur le même Wi-Fi :

```
Frontend : http://192.168.1.100
```

Le frontend appelera automatiquement le backend sur le port `8282`.

## 🔄 Mettre à jour l'application

### Sur la machine de développement

Après une modification du code :

```bash
export APP_VERSION=1.0.1

# Reconstruire
docker build -t ${DOCKERHUB_USERNAME}/eclinique-backend:${APP_VERSION} ./backend
docker build -t ${DOCKERHUB_USERNAME}/eclinique-frontend:${APP_VERSION} ./frontend

# Publier
docker push ${DOCKERHUB_USERNAME}/eclinique-backend:${APP_VERSION}
docker push ${DOCKERHUB_USERNAME}/eclinique-frontend:${APP_VERSION}

# Tester localement
docker compose -f docker-compose.prod.yml up -d
```

### Sur la machine cible

Modifier le fichier `.env` :

```env
APP_VERSION=1.0.1
```

Puis redéployer :

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 🔙 Revenir à une ancienne version

Modifier le fichier `.env` :

```env
APP_VERSION=1.0.0
```

Redéployer :

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 📊 Gérer les données PostgreSQL

### Sauvegarder la base de données

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres eclinique > backup-eclinique.sql
```

### Restaurer la base de données

```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres eclinique < backup-eclinique.sql
```

### Supprimer la base (réinitialiser)

```bash
docker compose -f docker-compose.prod.yml down -v
# La flag -v supprime aussi le volume PostgreSQL
```

## 🔍 Dépannage

### Les conteneurs ne démarrent pas

```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Les images ne se téléchargent pas

Vérifier l'authentification :

```bash
docker logout
docker login
```

Vérifier les noms d'image :

```bash
docker compose -f docker-compose.prod.yml config | grep image
```

### Le frontend n'accède pas au backend

Vérifier que le backend écoute sur le port `8282` :

```bash
docker compose -f docker-compose.prod.yml exec backend curl -I http://localhost:8282/api/swagger-ui.html
```

Vérifier la configuration d'environment du frontend dans [environment.ts](frontend/src/environments/environment.ts).

## 📁 Structure de fichiers requise sur la machine cible

```
/opt/eclinique/
├── docker-compose.prod.yml
└── .env
```

Aucun autre fichier n'est nécessaire !

## 🛑 Arrêter l'application

```bash
docker compose -f docker-compose.prod.yml down
```

Pour garder les données PostgreSQL intactes.

Pour supprimer aussi la base de données :

```bash
docker compose -f docker-compose.prod.yml down -v
```

## 📝 Notes importantes

1. Les images sont versionées avec des tags (ex. `1.0.0`). Utilise toujours une version explicite en production, pas juste `latest`.
2. Le mot de passe PostgreSQL doit être différent entre développement et production.
3. La base PostgreSQL n'est jamais exposée sur le réseau (port `5432` interne uniquement).
4. Les fichiers `.env` ne doivent jamais être commités sur Git.
5. Le frontend appelera automatiquement le backend en utilisant l'IP de la machine via le port `8282`.
6. Les ports exposés sont :
   - `80` : Frontend Nginx
   - `8282` : Backend Java
   - `5432` : PostgreSQL (interne uniquement, pas accessible de l'extérieur)

## ✨ Avantages de cette approche

✅ **Aucune compilation** sur la machine cible  
✅ **Aucune dépendance** (pas de Node.js, Java, Maven)  
✅ **Déploiement rapide** (simple pull + up)  
✅ **Versioning facile** (tags Docker explicites)  
✅ **Rollback simple** (changer le tag dans .env)  
✅ **Scalabilité** (possibilité d'ajouter plusieurs conteneurs)  
✅ **Isolation** (chaque conteneur est indépendant)  

---

**Créé le** : 2026-09-10  
**Version du guide** : 1.0.0
