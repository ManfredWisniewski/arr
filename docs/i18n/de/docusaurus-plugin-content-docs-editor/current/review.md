---
sidebar_position: 3
---

# Der Review-Ablauf

## Entwurfs-Banner

Wenn du angemeldet bist und eine Seite aufrufst, deren neueste Version ein
Entwurf ist, zeigt ein Banner oben an, dass sie **nicht live** ist, und
bietet eine **Veröffentlichen**-Aktion. Bestätigst du sie, geht die Seite
sofort live — beim nächsten Aufruf ist das Banner weg.

Anonyme Besucher sehen weder das Banner noch Entwurfsinhalte.

## `/review` — der Index der Ausstehenden

`/review` listet jedes Dokument, dessen neueste Version unveröffentlicht
ist — über Seiten, Beiträge und Strukturen hinweg — mit einem Link zur
jeweiligen Entwurfsansicht:

1. Öffne `/review`, um zu sehen, was aussteht.
2. Öffne einen Eintrag, prüfe ihn so, wie die Öffentlichkeit ihn sehen
   wird, und bestätige mit **Veröffentlichen**.
3. Der Ablauf springt automatisch zum nächsten ausstehenden Dokument —
   oder zurück zu `/review`, wenn nichts mehr offen ist.

Ein Dokument, das irgendwo bestätigt wurde (Admin, Banner, Review-Ablauf),
verschwindet beim nächsten Laden aus der Liste.
