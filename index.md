---
layout: default
title: Accueil
permalink: /
description: Location sono, location jeux de lumiére et packs DJ complets en Gironde avec livraison par zones, installation et assistance pour vos soires.
---

{% assign hero = site.branding.hero %}
{% assign hero_image = hero.image %}
{% if hero_image %}
  {% if hero_image contains '://' %}
    {% assign hero_src = hero_image %}
  {% else %}
    {% assign hero_src = hero_image | relative_url %}
  {% endif %}
{% endif %}

<section class="home-hero">
  <div class="home-hero__sky" aria-hidden="true">
    <span class="home-hero__orb home-hero__orb--one"></span>
    <span class="home-hero__orb home-hero__orb--two"></span>
    <span class="home-hero__orb home-hero__orb--three"></span>
  </div>
  <div class="container home-hero__grid">
    <div class="home-hero__copy">
      {% if hero.eyebrow %}<p class="home-hero__eyebrow">{{ hero.eyebrow }}</p>{% endif %}
      {% if hero.highlight_badge %}<span class="badge badge--glow home-hero__badge">{{ hero.highlight_badge }}</span>{% endif %}
      <h1>{{ hero.title }}</h1>
      <p class="home-hero__subtitle">{{ hero.subtitle }}</p>
      <div class="home-hero__actions">
        {% if hero.ctas.primary %}
          {% assign primary_url = hero.ctas.primary.url %}
          {% unless hero.ctas.primary.external %}
            {% assign primary_url = hero.ctas.primary.url | relative_url %}
          {% endunless %}
          <a class="button button--primary" href="{{ primary_url }}" {% if hero.ctas.primary.external %}target="_blank" rel="noopener"{% endif %}>{{ hero.ctas.primary.label }}</a>
        {% endif %}
        {% if hero.ctas.secondary %}
          {% assign secondary_url = hero.ctas.secondary.url %}
          {% unless hero.ctas.secondary.external %}
            {% assign secondary_url = hero.ctas.secondary.url | relative_url %}
          {% endunless %}
          <a class="button button--ghost" href="{{ secondary_url }}" {% if hero.ctas.secondary.external %}target="_blank" rel="noopener"{% endif %}>{{ hero.ctas.secondary.label }}</a>
        {% endif %}
        {% if hero.ctas.catalogue %}
          {% assign catalogue_url = hero.ctas.catalogue.url %}
          {% unless hero.ctas.catalogue.external %}
            {% assign catalogue_url = hero.ctas.catalogue.url | relative_url %}
          {% endunless %}
          <a class="button button--outline" href="{{ catalogue_url }}" {% if hero.ctas.catalogue.external %}target="_blank" rel="noopener"{% endif %}>{{ hero.ctas.catalogue.label }}</a>
        {% endif %}
      </div>
    </div>
    <div class="home-hero__visual">
      <div class="home-hero__visual-frame">
        {% if hero_src %}
        <img src="{{ hero_src }}" alt="{{ hero.title }}">
        {% else %}
        <div class="home-hero__visual-placeholder" aria-hidden="true"></div>
        {% endif %}
      </div>
    </div>
  </div>
</section>

{% assign differentiators = site.branding.differentiators.items %}
{% if differentiators %}
<section class="section home-differentiators">
  <div class="container home-differentiators__grid">
    <div class="home-differentiators__intro"></div>
    <div class="home-differentiators__cards">
      {% for diff in differentiators %}
      {% assign icon_char = diff.icon | default: '⭐' %}
      <article class="diff-card home-diff-card">
        <span class="home-diff-card__icon" aria-hidden="true">{{ icon_char }}</span>
        <div class="home-diff-card__content">
          <h3>{{ diff.title }}</h3>
          <p class="muted">{{ diff.text }}</p>
        </div>
      </article>
      {% endfor %}
    </div>
  </div>
</section>
{% endif %}
{% assign process = site.home.process %}
{% if process %}
<section class="section home-process">
  <div class="container">
    <div class="section-header section-header--center">
      <h2>{{ process.title }}</h2>
      <p class="muted">Un accompagnement complet, de la réservation à la reprise du matériel.</p>
    </div>
    <div class="process-steps home-process__steps">
      {% for step in process.steps %}
      <article class="process-step">
        <h3>{{ step.title }}</h3>
        <p class="muted">{{ step.description }}</p>
      </article>
      {% endfor %}
    </div>
  </div>
</section>
{% endif %}





