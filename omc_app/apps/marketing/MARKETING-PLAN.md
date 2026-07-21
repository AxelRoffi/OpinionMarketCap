# OMC — Plan marketing X « quasi-automatique » (v2 — haut volume)

Objectif : **12–24 posts/jour** sur X + **2–3 formats longs/semaine**, avec
~20–30 min d'input humain/jour. Principe inchangé : tu donnes des **données**,
la machine (Remotion + templates + events on-chain filtrés) produit le contenu.

⚠️ Réalité X à haut volume : 24 tweets « broadcast » par jour depuis un petit
compte = silencé par l'algo + unfollows. La bonne recette pour 12–24 posts/jour
c'est un **mix** : ~6–8 posts originaux + ~4–6 quote-tweets/débat-jacking +
~8–10 **replies** (les replies comptent, construisent le reach, et ne fatiguent
pas tes followers). Le plan ci-dessous est construit comme ça.

---

## 1. Architecture

```
INPUTS                          MACHINE                                OUTPUTS/JOUR
──────                          ───────                                ────────────
3 débats choisis (toi)     →    Remotion MarketOfTheDay (props)   →    3 clips
Events on-chain (auto)     →    Filtre significatif + digest      →    2–4 StatCards
File d'evergreen (stock)   →    Scheduler                         →    2–3 reposts clips concepts
Débats viraux (toi, scroll)→    Playbook quote-tweet + tags       →    4–6 QT
Replies (toi + templates)  →    Bibliothèque de réponses          →    8–10 replies
```

## 2. Les lanes de contenu (pour atteindre 12–24/jour)

| Lane | Volume/jour | Auto ? | Description |
|---|---|---|---|
| **L1 Markets of the Day** | 3 | semi | 3 débats mintés + 3 clips Remotion (matin/midi/soir, thèmes différents : crypto / sport-pop / local-lifestyle) |
| **L2 On-chain pulse** | 2–4 | **full auto** (filtré, §5) | StatCards des events significatifs : gros payout, flip de slot, nouveau récord |
| **L3 Evergreen** | 2–3 | full auto | Les 12 clips concepts + hero/short/loop en rotation (un même clip revient max 1×/10 jours) |
| **L4 Débat-jacking** | 4–6 | manuel (le + rentable) | QT des débats viraux du jour avec le market live + tags ciblés (§4) |
| **L5 Replies** | 8–10 | manuel assisté | Réponses sous les gros comptes du sujet + sous tes propres posts. Templates prêts. |
| **L6 Long-form** | 2–3 **/semaine** | semi (§3) | Articles mécaniques OMC |

Total : **12–24 unités/jour** dont ~60% automatisables.

## 3. Formats longs (2–3 / semaine)

Trois canaux, même contenu recyclé 3 fois :

1. **X Articles** (Premium+) ou long post natif — le canal principal, l'algo X
   pousse le long-form natif.
2. **Paragraph/Mirror** (onchain, audience crypto native, se partage sur
   Farcaster) — miroir de l'article X.
3. **Thread résumé** qui pointe vers l'article (le thread EST la distribution).

**Backlog d'articles prêt à écrire** (je peux les rédiger, un par session — la
matière existe déjà : contrats + CLAUDE.md + THREAD.md) :
1. « Why opinion markets ≠ prediction markets » (le manifeste)
2. « The 95/3/2 split — where every dollar goes » (mécanique fees, exemples chiffrés)
3. « How OMC prices opinions: regimes, heat, and −20%→+80% moves » (PriceCalculator)
4. « Getting outbid pays: the claim-your-fees lifecycle » (submitAnswer → claim)
5. « Self-exit & reclaim: leaving with your stake » (stake, 20%, 50/50 — factuel contrat)
6. « Pools: how small wallets move big markets » (100$/5$/refund)
7. « Mint once, earn forever: the royalty engine » (3%, cas concrets)
8. « Why Base » (USDC natif, gas en centimes)

Cadence : **mardi + jeudi (+ dimanche récap chiffré de la semaine)**. Chaque
article finit par 1 CTA : mint ton premier market.

## 4. Tagging — toucher les gens concernés par le débat (sans se faire flag)

**Règles dures** (les filtres anti-spam de X sont réels) :
- Max **2 tags par post**, toujours **pertinents pour CE débat précis**.
- On tague des comptes qui **participent déjà** à ce débat (ils ont tweeté sur
  le sujet récemment) — pas des célébrités au hasard.
- Jamais 2 fois le même compte la même semaine.
- Le tag doit être une **invitation, pas une pub** : « @X tu dis Jordan, le
  market dit LeBron à $18. Settle it 👉 »

**Mécanique par market minté** :
1. Le débat vient d'un tweet viral → tague **l'auteur du tweet** + 1 gros
   compte du thread de réponses.
2. Débat de niche → 1 média du secteur + 1 voix connue du sujet
   (food : @Eater/@infatuation · EV : @InsideEVs/@electrek · NBA : comptes
   débat basket · crypto/L2 : la communauté de chaque chaîne · DeFi :
   @DefiIgnas/@TheDeFiEdge).
3. Base/écosystème : @base @jessepollak réservés aux **milestones** (pas au
   quotidien, sinon ça lasse).

**Qui trouve les comptes ?** Toi en 1 min au moment où tu choisis le débat
(tu pars de toute façon d'un tweet existant), ou je peux te préparer chaque
matin une short-list par débat si tu me donnes les 3 sujets.

## 5. Events on-chain : anti-spam par design

Tu as raison : brancher les events bruts = compte poubelle. Le pipeline filtre :

**Seuils de significativité (posts unitaires, max 3–4/jour)** :
- Payout ≥ **$50** encaissé → StatCard « quelqu'un vient de se faire payer pour son opinion »
- Prix d'un market × **≥3** depuis son mint → « ce débat chauffe »
- **Record** battu (plus gros trade, plus gros payout, market le + tradé) → toujours postable
- **Bidding war** : ≥4 flips sur le même market en 24h → storytelling (« Jordan vs LeBron, 4e flip aujourd'hui »)
- Nouveau market qui reçoit ≥3 trades dans sa 1ère heure → « born hot »

**Tout le reste → digest** :
- 1 « Daily pulse » (image unique, fin de journée) : volume 24h, nb trades,
  top market, top payout. Un seul post, zéro spam.
- 1 « Weekly recap » le dimanche (matière du récap = le digest des digests).

**Garde-fous** : cooldown 2h min entre 2 posts on-chain · jamais 2 posts sur le
même market le même jour · si un seuil déclenche 10 events (jour de folie), on
poste le meilleur + le digest dit « +9 autres ».

Les seuils sont dans un fichier de config → tu les règles quand le volume réel
de la plateforme évolue (au début, $50 de payout est rare donc significatif ;
plus tard tu montes à $500).

## 6. Semaine type (volume réparti)

| Créneau (UTC) | Contenu |
|---|---|
| 08h | L1 market #1 (Europe) + 2 replies |
| 11h | L3 evergreen + L2 si event |
| 14h | L1 market #2 (US wake) + L4 QT ×2 + replies |
| 17h | L2 event/StatCard + L4 QT |
| 19h | L1 market #3 (US peak) + replies |
| 21h | L2 Daily pulse + dernières replies |
| Mar/Jeu | + Article long (L6) + thread résumé |
| Dim | Weekly recap chiffré + programmation semaine |

## 7. Routine quotidienne (~25 min)

1. **(5 min)** Choisis 3 débats (1 crypto, 1 sport/pop, 1 lifestyle/local) — depuis les trends.
2. **(5 min)** Mint les 3 markets (tu touches les 3% sur chacun).
3. **(2 min)** `npm run daily` ×3 → 3 clips + captions + suggestions de tags.
4. **(10 min)** 8–10 replies/QT au fil de la journée (mobile, dans les trous).
5. **(3 min)** Valide ce que le pipeline on-chain propose (bouton oui/non).

Dimanche (+30 min) : programme la semaine, publie le recap, choisis l'article.

## 8. Briques à construire (je les code sur demande)

- [ ] `MarketOfTheDay.tsx` — clip paramétré `--props='{"q","a","p","cat"}'`
- [ ] `StatCard.tsx` + `DailyPulse.tsx` — images stats paramétrées
- [ ] `scripts/daily.mjs` — 3 clips + captions + tags suggérés en 1 commande
- [ ] `scripts/onchain-watch.mjs` — lit les events (OpinionCore sur Base via RPC),
      applique les seuils §5, écrit les posts candidats dans `out/queue/`
      (**rien ne part sans ta validation** au début)
- [ ] 8 articles long-form (1 par session de rédaction)
- [ ] Config seuils : `marketing.config.json`

**Outils à prendre** : X Premium+ (Articles + analytics), Typefully ou X Pro
(programmation), une clé RPC Base (Alchemy/QuickNode gratuit au début).

## 9. KPIs (hebdo)

- ≥ 80 posts/sem (mix L1–L5) · ≥ 21 markets mintés/sem · 2–3 articles
- Taux de reply sur les L1 (le vrai signal produit)
- Wallets uniques app ↑ — le seul KPI final
- Si un débat fait 5× la moyenne → 3 markets du même thème la semaine suivante
