# Instructions pour ajouter les pictogrammes GHS officiels

## Étape 1: Télécharger les pictogrammes officiels

Téléchargez les 9 pictogrammes GHS officiels depuis ces liens:

1. **GHS01 - Explosif**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/explos.gif

2. **GHS02 - Inflammable**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/flamme.gif

3. **GHS03 - Comburant**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/rondflam.gif

4. **GHS04 - Gaz sous pression**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/bottle.gif

5. **GHS05 - Corrosif**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/acid_red.gif

6. **GHS06 - Toxique**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/skull.gif

7. **GHS07 - Nocif**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/exclam.gif

8. **GHS08 - Danger pour la santé**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/silhouete.gif

9. **GHS09 - Environnement**
   https://www.unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/aquatic-pollut-red.gif

## Étape 2: Placer les fichiers

Créez le dossier `public/ghs/` et placez-y les fichiers téléchargés avec ces noms:

```
public/ghs/ghs01.gif  (Explosif)
public/ghs/ghs02.gif  (Inflammable)
public/ghs/ghs03.gif  (Comburant)
public/ghs/ghs04.gif  (Gaz sous pression)
public/ghs/ghs05.gif  (Corrosif)
public/ghs/ghs06.gif  (Toxique)
public/ghs/ghs07.gif  (Nocif)
public/ghs/ghs08.gif  (Danger santé)
public/ghs/ghs09.gif  (Environnement)
```

## Étape 3: Le code est déjà configuré

Le code a été mis à jour pour utiliser ces images depuis `/ghs/ghs0X.gif`.

## Alternative: Utiliser des CDN

Si vous ne voulez pas télécharger les fichiers, vous pouvez aussi utiliser directement les URLs de l'UNECE (déjà configuré dans le code comme fallback).

## Source officielle

Ces pictogrammes proviennent de l'UNECE (Commission économique des Nations Unies pour l'Europe), qui est l'organisme officiel responsable du SGH (Système Général Harmonisé).

Site officiel: https://unece.org/transport/standards/transport/dangerous-goods/ghs-pictograms
