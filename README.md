# Asteroids 

El jugego clásico arcade **Asteroids** construido con HTML5 Canvas y JavaScript , organizado bajo el patrón MVC.

---

## Estructura

```
proyecto/
├── index.html
├── style.css
└── js/
    ├── model.js       — lógica del juego y estado
    ├── view.js        — renderizado en canvas
    └── controller.js  — input, game loop
```

---

## Controles

| Acción | Teclado |
|---|---|
| Rotar izquierda | `←` / `A` |
| Rotar derecha | `→` / `D` |
| Empuje adelante | `↑` / `W` |
| Empuje atrás | `↓` / `S` |
| Disparar | `Espacio` |

---

## Mecánicas

- Los asteroides grandes se dividen en 2 medianos, los medianos en 2 pequeños
- La nave parpadea y es invulnerable unos segundos tras explotar
- El juego guarda el **record** en `localStorage`
- Cada nivel añade un asteroide extra y aumenta la velocidad

## Puntuación

| Asteroide | Puntos |
|---|---|
| Grande | 20 |
| Mediano | 30 |
| Pequeño | 50 |

