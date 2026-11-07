# Abaarso Mathematics Learning Platform

A teacher-led mathematics project for Abaarso, beginning with Algebra 1 and Geometry. The current prototype includes three games and two simulations, with English and Somali content.

## Current activities

- **Mystery Island - Sky Climb:** Solve the nearest falling platform's equation to jump and stay above the spikes.
- **Space Race:** Two local players solve meteor equations to fire missiles and travel farther.
- **Rail Rescue:** Solve two linear equations and enter their shared coordinates to divert approaching trains.
- **Balance Lab:** Explore equality using whole- and half-unit weights.
- **Intersection Lab:** Explore lines, intersections, and inequality solution regions.

Only Algebra currently contains activities. Two of its twelve topic slots are active. Mini video lessons and broader curriculum coverage are planned.

## Publish on GitHub Pages

The files in this directory are the complete static website. No installation or build is required.

1. Upload this directory's **contents** to your repository's `main` branch, keeping all folders intact.
2. Open the repository's **Settings > Pages**.
3. Select **Deploy from a branch**, then **main** and **/(root)**, and save.
4. Use the exact live URL shown by GitHub Pages when deployment finishes.

Keep `.nojekyll` at the repository root. The site supports both a domain root and a repository subpath. Keep `island.html` in links; the host does not need extensionless routing.

GitHub's publishing guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Local preview

Run `python3 -m http.server 4173` from this directory and open http://localhost:4173/.

## Project notes

Activities run in the browser; there is no server, student account system, or learning analytics service. Fonts may load from Google Fonts. Train names and cities reference real examples, but junctions and timing are fictional learning scenarios.
