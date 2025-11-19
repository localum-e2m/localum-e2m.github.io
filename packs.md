---
layout: default
title: Packs
description: Packs sono et jeux de lumiére préts é l'emploi pour soires, mariages et vnements dans l'entre deux mers.
---

<section class="section">
  <div class="container">
    <div class="section-header">
      <h1>Packs sono & lumière</h1>
      <p class="muted">{{ site.data.packs.intro }}</p>
    </div>
    <div class="pack-slider pack-slider--finite" data-pack-slider data-slides-visible="3">
      <button class="pack-slider__control pack-slider__control--prev" type="button" data-pack-prev aria-label="Pack pr&eacute;c&eacute;dent">&lsaquo;</button>
      <div class="pack-slider__viewport" data-pack-viewport>
        <ul class="pack-slider__track" data-pack-track role="list">
          {% for pack in site.data.packs.items %}
          {% assign content_id = pack.id | default: 'pack-' | append: forloop.index | append: '-content' %}
          <li class="pack-slider__slide" data-pack-slide data-pack-index="{{ forloop.index0 }}">
            <article class="pack-card" data-pack-card data-pack-open="true">
              <header class="pack-card__header">
                <div class="pack-card__heading">
                  <span class="pack-card__index">Pack {{ forloop.index }}</span>
                  <h3>{{ pack.title }}</h3>
                  {% if pack.tagline %}<p class="pack-card__tagline muted">{{ pack.tagline }}</p>{% endif %}
                </div>
                {% if pack.capacity %}
                <span class="pack-card__capacity">{{ pack.capacity }}</span>
                {% endif %}
              </header>
              <div class="pack-card__body">
                {% if pack.weekend_price %}
                <div class="pack-card__price">
                  <span class="pack-card__price-label">Forfait week-end</span>
                  <span class="pack-card__price-value">{{ pack.weekend_price }} {{ site.pricing.currency }}</span>
                </div>
                {% endif %}
                {% if pack.description %}
                <p class="pack-card__description">{{ pack.description }}</p>
                {% endif %}
                {% if pack.includes %}
                <div class="pack-card__divider" aria-hidden="true"></div>
                <div class="pack-card__features" id="{{ content_id }}" data-pack-content>
                  <h4>Compris dans le pack</h4>
                  <ul class="pack-card__includes">
                    {% for include in pack.includes %}
                      {% assign include_label = include.label | default: include %}
                      {% assign include_href = include.href %}
                      {% if include_href %}
                        {% if include_href contains '://' %}
                          {% assign include_url = include_href %}
                        {% else %}
                          {% assign include_url = include_href | relative_url %}
                        {% endif %}
                        <li><a class="pack-chip" href="{{ include_url }}">{{ include_label }}</a></li>
                      {% else %}
                        <li><span class="pack-chip">{{ include_label }}</span></li>
                      {% endif %}
                    {% endfor %}
                  </ul>
                  {% if pack.notes %}
                  <ul class="pack-card__notes">
                    {% for note in pack.notes %}
                    <li>{{ note }}</li>
                    {% endfor %}
                  </ul>
                  {% endif %}
                </div>
                <button class="pack-card__toggle" type="button" data-pack-toggle aria-expanded="false" aria-controls="{{ content_id }}">
                  <span data-pack-toggle-label>Voir le détail</span>
                  <span class="pack-card__chevron" aria-hidden="true"></span>
                </button>
                {% endif %}
              </div>
              <footer class="pack-card__footer"></footer>
            </article>
          </li>
          {% endfor %}
        </ul>
      </div>
      <button class="pack-slider__control pack-slider__control--next" type="button" data-pack-next aria-label="Pack suivant">&rsaquo;</button>
      <div class="pack-slider__dots" data-pack-dots aria-label="Sélecteur de packs"></div>
    </div>
    <article class="pack-formula-card">
      <div class="pack-formula-card__content">
        <h2>Sélectionnez votre formule</h2>
        <p class="muted">Choisissez librement vos packs : lumières, son ou mix complet. Chaque formule est préparée et testée pour votre événement.</p>
        <div class="pack-formula-card__groups">
          <section class="pack-formula-card__group">
            <header>
              <span class="pack-formula-card__badge">Lumières</span>
              <h3>Packs Ambiance & Effets</h3>
            </header>
            <ul class="pack-formula-card__rules">
              <li><strong>Pack 1 – Ambiance 40</strong> : 1 pied + 3 jeux LED</li>
              <li><strong>Pack 2 – Ambiance 60</strong> : 2 pieds + 6 jeux LED</li>
              <li><strong>Pack 3 – Ambiance 100</strong> : 3 pieds + 9 jeux LED</li>
              <li><strong>Pack 4</strong> : Boule à facettes + projecteur</li>
              <li><strong>Pack 5</strong> : 5 barres LED multicolores</li>
            </ul>
          </section>
          <section class="pack-formula-card__group">
            <header>
              <span class="pack-formula-card__badge">Son</span>
              <h3>Diffusion & mixage</h3>
            </header>
            <ul class="pack-formula-card__rules">
              <li><strong>Pack 6</strong> : Sono Stage Line Triton</li>
              <li><strong>Pack 7</strong> : Sono FBT + amplificateur</li>
            </ul>
          </section>
        </div>
        <p class="muted">Besoin de plusieurs packs ? Mentionnez-les à la réservation, nous validons la compatibilité et organisons la logistique avec vous.</p>
      </div>
      <div class="pack-formula-card__actions">
        <a class="button button--primary" href="{{ site.forms.booking_google_form_url }}" target="_blank" rel="noopener">Sélectionner mes packs</a>
      </div>
    </article>
  </div>
</section>





