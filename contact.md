---
layout: default
title: Contact
description: Contactez LOCALUM - E2M pour vos devis de location sono, jeux de lumiére et livraison en Gironde.
---

{% assign last_tier = site.delivery.tiers | last %}

<section class="section">
  <div class="container">
    <div>
      <div class="section-header">
        <h1>Contact & réservation</h1>
        <p class="muted">{{ site.contact_page.intro }}</p>
      </div>
      <div class="contact-box">
        <ul>
          <li>
            <span>Téléphone</span>
            <a href="tel:{{ site.contact.phone | replace: ' ', '' }}">{{ site.contact.phone }}</a>
          </li>
          <li>
            <span>Email</span>
            <a href="mailto:{{ site.contact.email }}">{{ site.contact.email }}</a>
          </li>
          <li>
            <span>Adresse</span>
            {{ site.contact.address }}
          </li>
          <li>
            <span>SIRET</span>
            {{ site.contact.siret }}
          </li>
        </ul>
      </div>
      <div class="section-actions">
        <a class="button button--primary" href="{{ site.contact_page.booking_cta.url }}" target="_blank" rel="noopener">{{ site.contact_page.booking_cta.label }}</a>
        <a class="button button--ghost" href="{{ site.social.youtube }}" target="_blank" rel="noopener">Découvrir nos ambiances</a>
      </div>
      {% if site.contact_page.notes %}
      <div class="note">
        <h3>À savoir</h3>
        <ul>
          {% for item in site.contact_page.notes %}
          <li>{{ item }}</li>
          {% endfor %}
        </ul>
      </div>
      {% endif %}
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





