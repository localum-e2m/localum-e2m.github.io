---
layout: default
title: Services
description: Services de location sono et jeux de lumiére avec livraison par zones, installation sur demande et assistance personnalise dans l'entre deux mers.
---

<section class="section">
  <div class="container">
    <div class="section-header">
      <h1>Services sur mesure pour vos événements</h1>
      <p class="muted">Je suis {{ site.owner_name }}, interlocuteur unique pour la sono et la lumière de vos soirées dans l'entre deux mers.</p>
    </div>
    <p>Je prépare le pack choisi, je fournis tous les câbles et je reste joignable le jour J. Vous gérez la playlist, je sécurise la technique.</p>
    <div class="section-actions" style="margin: 2.5rem 0; gap: 1.25rem;">
      <a class="button button--primary" href="{{ site.forms.booking_google_form_url }}" target="_blank" rel="noopener">Demander un devis rapide</a>
      <a class="button button--ghost" href="/packs/">Voir les packs disponibles</a>
    </div>
    <div class="feature-grid" style="margin-top: 2.5rem;">
      {% for highlight in site.services_page.highlights %}
      <article class="feature-card">
        <h3>{{ highlight.title }}</h3>
        <p class="muted">{{ highlight.text }}</p>
      </article>
      {% endfor %}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="display: grid; gap: 1.75rem; margin-top: 3rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); align-items: start;">
      <div>
        <h3 class="muted">Frais de déplacement</h3>
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              <th>Rayon</th>
              <th>Frais</th>
            </tr>
          </thead>
          <tbody>
          {% for tier in site.delivery.tiers %}
          <tr>
            <td>{{ tier.label }}</td>
            <td>{{ tier.radius_km }} km</td>
            <td>{{ tier.price_eur }} €</td>
          </tr>
          {% endfor %}
          <tr>
            <td>Hors zone</td>
            <td>Sur devis</td>
            <td><a href="{{ site.forms.booking_google_form_url }}" target="_blank" rel="noopener">Contactez-moi</a></td>
          </tr>
        </tbody>
      </table>
      </div>
      <div class="map-panel">
        <div class="map-shell">
          <div class="map js-delivery-map"
               data-map-id="services"
               data-center-lat="{{ site.delivery.center_lat }}"
               data-center-lng="{{ site.delivery.center_lng }}"
               data-tiers='{{ site.delivery.tiers | jsonify }}'
               data-city="{{ site.delivery.base_city }}">
            <noscript>Activez JavaScript pour afficher la carte des zones de livraison.</noscript>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header">
      <h2>Déroulé d’une location</h2>
      <p class="muted">Des échanges clairs et une logistique millimétrée pour profiter sereinement de votre soirée.</p>
    </div>
    <div class="feature-grid">
      <article class="feature-card">
        <h3>1. Premier contact</h3>
        <p class="muted">Vous me donnez la date, le lieu et le nombre d’invités.</p>
      </article>
      <article class="feature-card">
        <h3>2. Choix de la formule</h3>
        <p class="muted">Séléction parmis les packs disponibles et édition du contrat.</p>
      </article>
      <article class="feature-card">
        <h3>3. Livraison ou retrait</h3>
        <p class="muted">Sur place, je vérifie l’installation avec vous.</p>
      </article>
      <article class="feature-card">
        <h3>4. Assistance & reprise</h3>
        <p class="muted">Support par téléphone et reprise planifiée à l’avance.</p>
      </article>
    </div>
  </div>
</section>






