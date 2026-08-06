# Map & results data

## Boundaries
Constituency boundary geometry from **ElectionData.MY** delimitation datasets,
dedicated to the public domain (CC0):

- `parlimen_ge15.geojson` — 222 federal parliamentary seats, combining:
  - Peninsular Malaysia, 2018 delimitation (166 seats)
  - Sabah, 2019 delimitation (25 seats)
  - Sarawak, 2015 delimitation (31 seats)
- `dun_johor.geojson` — Johor state assembly, 2018 delimitation (56 seats)
- `dun_negeri-sembilan.geojson` — Negeri Sembilan state assembly, 2018 delimitation (36 seats)
- `dun_sabah.geojson` — Sabah state assembly, 2019 delimitation (73 seats)

Source: https://electiondata.my/data-catalogue/
Raw files: https://lake.electiondata.my/maps/delimitations/

Geometry has been simplified for web delivery (Douglas-Peucker, tolerance
0.004° for the national map and 0.0015° for state maps; coordinates rounded to
4 decimal places; sub-threshold islands and holes dropped). Combined source
geometry of ~3.9 MB reduces to ~350 KB. Boundaries are therefore approximate
and are **not** suitable for any official, legal or survey purpose.

## Results
Winning candidate, party, coalition and vote share merged from ElectionData.MY's
candidate-level ballots dataset (CC0), covering every contest from 1955:
https://lake.electiondata.my/results_headline/headline_ballots.csv

Elections used: GE-15 (19 Nov 2022, including the Padang Serai poll deferred to
7 Dec 2022), Johor SE-16 (11 Jul 2026), Negeri Sembilan SE-16 (1 Aug 2026),
Sabah SE-15 (29 Nov 2025).
