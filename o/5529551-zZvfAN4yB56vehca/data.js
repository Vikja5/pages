/* УСЛОВНЫЕ ДАННЫЕ (демо / пример работы). Реальную номенклатуру заказчик подставит сюда.
   Правится текстовым редактором, код менять не нужно.

   lines    - линейки (id, название)
   colors   - цвета (id, название, цвет плашки)
   comps    - виды компонентов: socket, switch, frame1, frame2, frame3 (frameN: рамка на N постов)
   products - артикулы:
       id, name, line, color
       items: из чего состоит ОДНА штука товара, например [{c:"socket",n:1},{c:"frame1",n:1}] = «розетка + рамка»
       packs: доступные упаковки: size (штук в упаковке: 1/2/3/5/10), price (цена упаковки, условные единицы)
*/
window.CATALOG = {
  note: "Условные данные: артикулы и цены придуманы для демо",
  currency: "усл. ед.",
  lines: [
    { id: "A", name: "Линейка «Альфа»" },
    { id: "B", name: "Линейка «Бета»" }
  ],
  colors: [
    { id: "white",    name: "Белый",     hex: "#f4f4f0" },
    { id: "cream",    name: "Кремовый",  hex: "#e8dcb8" },
    { id: "graphite", name: "Графит",    hex: "#4a4d52" }
  ],
  comps: {
    socket: "Розетка",
    switch: "Выключатель",
    frame1: "Рамка 1 пост",
    frame2: "Рамка 2 поста",
    frame3: "Рамка 3 поста"
  },
  posts: { frame1: 1, frame2: 2, frame3: 3 },
  products: [
    { id: "A-101", name: "Розетка Альфа, белая",           line: "A", color: "white",    items: [{ c: "socket", n: 1 }],
      packs: [{ size: 1, price: 100 }, { size: 5, price: 450 }, { size: 10, price: 850 }] },
    { id: "A-102", name: "Розетка Альфа, кремовая",        line: "A", color: "cream",    items: [{ c: "socket", n: 1 }],
      packs: [{ size: 1, price: 105 }, { size: 5, price: 470 }] },
    { id: "A-103", name: "Розетка Альфа, графит",          line: "A", color: "graphite", items: [{ c: "socket", n: 1 }],
      packs: [{ size: 1, price: 120 }, { size: 5, price: 540 }] },
    { id: "A-201", name: "Выключатель Альфа, белый",       line: "A", color: "white",    items: [{ c: "switch", n: 1 }],
      packs: [{ size: 1, price: 90 }, { size: 2, price: 170 }, { size: 10, price: 780 }] },
    { id: "A-202", name: "Выключатель Альфа, кремовый",    line: "A", color: "cream",    items: [{ c: "switch", n: 1 }],
      packs: [{ size: 1, price: 95 }, { size: 2, price: 180 }] },
    { id: "A-301", name: "Рамка Альфа 1 пост, белая",      line: "A", color: "white",    items: [{ c: "frame1", n: 1 }],
      packs: [{ size: 1, price: 40 }, { size: 5, price: 180 }] },
    { id: "A-302", name: "Рамка Альфа 2 поста, белая",     line: "A", color: "white",    items: [{ c: "frame2", n: 1 }],
      packs: [{ size: 1, price: 60 }, { size: 3, price: 165 }] },
    { id: "A-310", name: "Комплект Альфа: розетка + рамка 1 пост, белый", line: "A", color: "white",
      items: [{ c: "socket", n: 1 }, { c: "frame1", n: 1 }],
      packs: [{ size: 1, price: 130 }, { size: 2, price: 250 }, { size: 3, price: 360 }] },

    { id: "B-101", name: "Розетка Бета, белая",            line: "B", color: "white",    items: [{ c: "socket", n: 1 }],
      packs: [{ size: 1, price: 130 }, { size: 2, price: 250 }, { size: 3, price: 360 }, { size: 5, price: 590 }] },
    { id: "B-102", name: "Розетка Бета, кремовая",         line: "B", color: "cream",    items: [{ c: "socket", n: 1 }],
      packs: [{ size: 1, price: 135 }, { size: 10, price: 1150 }] },
    { id: "B-103", name: "Розетка Бета, графит",           line: "B", color: "graphite", items: [{ c: "socket", n: 1 }],
      packs: [{ size: 2, price: 290 }, { size: 10, price: 1300 }] },
    { id: "B-201", name: "Выключатель Бета, белый",        line: "B", color: "white",    items: [{ c: "switch", n: 1 }],
      packs: [{ size: 1, price: 115 }, { size: 3, price: 320 }] },
    { id: "B-301", name: "Рамка Бета 1 пост, графит",      line: "B", color: "graphite", items: [{ c: "frame1", n: 1 }],
      packs: [{ size: 1, price: 55 }, { size: 5, price: 240 }] },
    { id: "B-302", name: "Рамка Бета 2 поста, кремовая",   line: "B", color: "cream",    items: [{ c: "frame2", n: 1 }],
      packs: [{ size: 1, price: 75 }, { size: 3, price: 205 }] },
    { id: "B-320", name: "Набор Бета: 2 розетки + рамка 2 поста, графит", line: "B", color: "graphite",
      items: [{ c: "socket", n: 2 }, { c: "frame2", n: 1 }],
      packs: [{ size: 1, price: 330 }, { size: 2, price: 620 }] }
  ]
};
