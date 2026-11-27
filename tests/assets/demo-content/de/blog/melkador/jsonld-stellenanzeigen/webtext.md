---
title: "Strukturierte Daten für Stellenanzeigen — JobPosting als JSON-LD"
description: Was die Job-Detailseiten für Suchmaschinen ausgeben — welche schema.org-Felder befüllt werden und warum nur echte Daten serialisiert werden.
author: melkador
date: 2026-11-15
categories: [technik]
tags: [seo, json-ld]
excerpt: Google for Jobs liest JSON-LD — aber vertraut nur, was die Seite tatsächlich zeigt. Nur befüllte Schlüssel, nichts Erfundenes.
---

Stellenanzeigen gehören zu den wenigen Inhaltstypen, bei denen sich strukturierte Daten sichtbar auszahlen: Google for Jobs liest `JobPosting`-JSON-LD und kann Einträge direkt in der Suche zeigen. Die Job-Detailseiten in arr geben genau das aus — ein `application/ld+json`-Block pro Ausschreibung.

## Was reingeht

`title`, `description` (als HTML), `datePosted` als reines Datum, `employmentType` aus dem schema.org-Vokabular, `hiringOrganization` mit Name und URL, `jobLocation` mit den Adressfeldern, `baseSalary` wenn ein Gehalt gesetzt ist und `validThrough` für befristete Ausschreibungen.

## Die Regel dahinter

**Nur befüllte Schlüssel.** Der Builder lässt jedes Feld weg, das der Job nicht hat — keine Platzhalter-Gehälter, keine erfundenen Standorte, keine geratenen Daten. Suchmaschinen bestrafen strukturierte Daten, die versprechen, was die Seite nicht zeigt; ein ehrlicher Block mit acht Schlüsseln schlägt einen gepolsterten mit zwanzig.

Die Rohrleitung dahinter ist unspektakulär — ein Mapping von Collection-Feldern auf Schema-Keys, ein Render im Template. Unspektakuläre Rohre sind die, die nicht platzen.

---
