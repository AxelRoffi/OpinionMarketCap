# OMC Marketing Machine — la démarche, étape par étape

La machine = 3 couches : **assets** (faits ✅) → **outils/comptes** (à toi) →
**routine** (quotidienne). Coche dans l'ordre.

---

## Phase 0 — Assets & outillage de rendu ✅ (déjà fait)

- [x] Brand kit Remotion (couleurs, fonts, audio validé)
- [x] 12 clips concepts + thread combiné 2:12 (`out/thread/`)
- [x] Hero 16:9 · Short 9:16 · Loop 1:1 (`out/`)
- [x] Avatar + bannière X (`out/x/`)
- [x] THREAD.md prêt à poster (tweets + tags + liens + best practices appliquées)
- [x] MARKETING-PLAN.md (le plan haut volume 12–24 posts/j)
- [x] `npm run daily` — Market of the Day : clip + caption en 1 commande
- [x] `npm run stat -- card` — StatCard image (5 presets) + caption
- [x] `npm run stat -- card … --video` — StatCard **animée** (gros moments)
- [x] `npm run stat -- pulse` — DailyPulse (digest du soir) + caption

## Phase 1 — Comptes & outils (30 min, une seule fois)

- [ ] **X Premium+** sur le compte OMC (Articles, analytics, vidéos longues)
- [ ] Uploader avatar (`out/x/omc-x-avatar.png`) + bannière (`omc-x-banner.png`)
- [ ] Bio : "Take a stand. Get paid for it. Opinion markets on @base ★ app.opinionmarketcap.xyz"
- [ ] **Typefully** (ou X Pro) pour programmer les posts (~$12/mois)
- [ ] Compte **Paragraph** (paragraph.com) — miroir des articles, connecté à Farcaster
- [ ] (Optionnel, pour le watcher plus tard) clé RPC Base gratuite — Alchemy ou QuickNode
- [ ] Vérifier les handles de THREAD.md avant de tagger (2 min)

## Phase 2 — Lancement (J0 → J3)

- [ ] **J0** : pin un tweet de présentation, poste le début du thread (THREAD.md, tweets 1–4, 1 toutes les 2h)
- [ ] **J1** : suite du thread (5–8)
- [ ] **J2** : fin du thread (9–12) → **pin le tweet 1 du thread**
- [ ] **J3** : premier Market of the Day → la routine démarre (Phase 3)
- [ ] Poster la vidéo combinée `00-ExplainerThread-full.mp4` sur Farcaster/Paragraph

## Phase 3 — La routine quotidienne (~25 min/jour)

**Matin (12 min)**
- [ ] Choisir 3 débats (1 crypto · 1 sport/pop · 1 lifestyle/local) depuis les trends X
- [ ] Minter les 3 markets sur app.opinionmarketcap.xyz (tu gagnes les 3% dessus)
- [ ] Générer les 3 clips :
      `npm run daily -- --q "…" --a "…" --p X.XX --cat CAT --tags "@a,@b"`
- [ ] Programmer dans Typefully : 08h / 14h / 19h UTC (+ 2–3 evergreen de `out/thread/` à 11h/17h)

**Au fil de la journée (10 min, mobile)**
- [ ] 4–6 quote-tweets de débats viraux (« ça se trade chez nous 👉 » + market live)
- [ ] 8–10 replies sous les gros comptes des sujets du jour + sous tes posts

**Soir (3 min)**
- [ ] Daily pulse : `npm run stat -- pulse --volume '$X' --trades N --topq "…" --payout '$X'`
      (chiffres lus sur l'app/BaseScan — en attendant le watcher auto)
- [ ] Si événement marquant (payout ≥$50, record, bidding war) :
      `npm run stat -- card --kind payout --value '$X' --q "…" --a "…"`
      → ajouter `--video` si c'est un GROS moment (record, war)

## Phase 4 — La routine hebdo (dimanche, ~50 min)

- [ ] Weekly recap chiffré (image pulse + thread court)
- [ ] Programmer les evergreen de la semaine (rotation des 12 clips, max 1×/10 jours chacun)
- [ ] **1 article long-form** (mar) + 1 (jeu) : X Articles + miroir Paragraph + thread résumé
      → backlog des 8 sujets dans MARKETING-PLAN.md §3 (je les rédige à la demande)
- [ ] Regarder les KPIs (posts/sem ≥80, markets ≥21, wallets app ↑) — si un thème fait 5×
      la moyenne, tripler dessus la semaine suivante

## Phase 5 — Automatisation niveau 2 (à me demander quand la routine tourne)

- [ ] `scripts/onchain-watch.mjs` — lit les events OpinionCore sur Base (RPC), applique
      les seuils anti-spam (§5 du plan), pré-remplit les commandes `stat` dans `out/queue/`
      → ta validation du soir passe de « chercher les chiffres » à « oui/non »
- [ ] Rédaction des 8 articles long-form (1 par session)
- [ ] (Option) posting semi-auto : un cron Claude qui prépare chaque matin les 3 débats
      candidats + drafts — tu ne fais plus que choisir
- [ ] (Option) API X pour publier automatiquement la queue validée

---

## Récap des commandes (ta télécommande)

```bash
cd apps/marketing

# Market of the day (clip 10s + caption)
npm run daily -- --q "Best EV under $50k?" --a "Model 3" --p 5.00 --cat CARS --tags "@InsideEVs"

# StatCard image (payout | surge | record | war | hot)
npm run stat -- card --kind payout --value '$47.20' --q "GOAT of basketball?" --a "Jordan"

# StatCard ANIMÉE (gros moments)
npm run stat -- card --kind record --value '$180.00' --q "…" --a "…" --video

# Digest du soir
npm run stat -- pulse --volume '$1,240' --trades 87 --topq "Best L2?" --payout '$47.20'

# Studio (preview/édition live)
npm run dev
```

Sorties : `out/daily/` · `out/stats/` — toujours le média + sa `.caption.txt` prête à coller.
