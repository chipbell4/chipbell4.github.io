---
layout: portfolio
title: Portfolio
permalink: /portfolio/
---

<h1>Portfolio</h1>

<div class="container portfolio">
    <div class="row">
{% for item in site.data.projects %}
    <div class="col-md-6 portfolio-item">
        <h2>{{ item.title }}</h2>
        <p>
            <a href="{{ item.link }}" target="_blank">
                <img alt="{{ item.alt }}" src="{{ site.baseurl }}{{ item.img }}" />
            </a>
            {{ item.description }}
        </p>
    </div>
{% endfor %}
    </div>
</div>
