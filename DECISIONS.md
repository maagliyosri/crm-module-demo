# DECISIONS.md — CRM Module Demo

## Stack technique
- **NestJS** : architecture modulaire native (modules, services, controllers, DTO) — alignée avec les exigences du test sans configuration supplémentaire
- **Prisma** : ORM type-safe avec migrations versionnées, parfait pour PostgreSQL et compatible TypeScript strict
- **Next.js App Router** : routing file-based, Server Components, et API Routes dans un seul projet — choix naturel pour un frontend moderne
- **TypeScript strict** : `any` banni, types partagés entre frontend et backend via `lib/types.ts`

## Base de données
- **PostgreSQL local** pour le développement — zéro dépendance externe
- **Docker Compose** pour les reviewers — une seule commande (`docker-compose up --build`) lance la base, le backend et le frontend
- **Migrations versionnées** via Prisma — reproductibles et auditables

## Modèle de données

### Client (entreprise vs particulier)
- Un seul modèle `Client` avec champ `type: ClientType` (COMPANY / INDIVIDUAL) et champs nullable selon le type
- Choix retenu face à deux tables séparées : plus simple à maintenir, suffisant pour ce périmètre, et évite les jointures inutiles

### Opportunité — définition des "problèmes"
Deux règles distinctes encodées dans `isAtRisk` (booléen retourné par l'API) :
- **En retard** : `expectedCloseDate < aujourd'hui` ET statut ≠ WON / LOST
- **Stagnante** : aucune mise à jour (`updatedAt`) depuis **14 jours**
- Seuil de 14 jours choisi comme valeur métier raisonnable pour un cycle commercial standard — facilement configurable

## Pipeline — indicateurs retenus
Quatre métriques jugées utiles pour une équipe commerciale :
- **Valeur totale du pipeline** (opportunités actives uniquement)
- **Répartition par étape** (nombre + montant)
- **Opportunités à risque** (count)
- **Taux de conversion** (WON / total fermées)

Les opportunités WON et LOST sont exclues du pipeline actif mais incluses dans le taux de conversion.

## API REST
- **Pagination côté serveur** sur la liste des opportunités (page + limit)
- **Filtrage** par étape (`stage`) et type de client (`clientType`) via query params
- **Gestion des erreurs centralisée** via `NotFoundException` NestJS — codes HTTP cohérents (404, 400, 201)
- **CORS activé** globalement pour permettre la communication frontend/backend en local

## Frontend
- **Design sobre et professionnel** : palette gris/blanc, typographie Inter, zéro couleur superflue
- **Mise en avant visuelle** des opportunités à risque : bordure gauche rouge + badge — visible sans surcharger l'interface
- **États de chargement et d'erreur** gérés sur chaque page
- **Pas de librairie UI externe** (pas de MUI, pas de shadcn) — Tailwind suffit pour ce périmètre et garde le code léger
