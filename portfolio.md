---
layout: portfolio
title: Portfolio
permalink: /portfolio/
---

<div class="container portfolio">
    <div class="row">
{% for item in site.data.projects %}
    <div class="col-md-12 portfolio-item">
        <h3>{{ item.title }}</h3>
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
