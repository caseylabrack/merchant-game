let d3 = require("d3")

const Earth = "Earth",
      Venus = "Venus"

let gameState = { view: "market", planet: Earth }
let markets =
[
  { planet: "Earth", goods:
    [
      { name: "twinkies", price: 100, initialQuantity: 3, currentQuantity: 3},
      { name: "compliments", price: 1, initialQuantity: 10, currentQuantity: 10},
      { name: "uranium", price: 800, initialQuantity: 3, currentQuantity: 3}
    ]
  },
  { planet: "Venus", goods:
    [
      { name: "twinkies", price: 110, initialQuantity: 3, currentQuantity: 3},
      { name: "compliments", price: 1, initialQuantity: 10, currentQuantity: 10},
      { name: "uranium", price: 820, initialQuantity: 3, currentQuantity: 3}
    ]
  }
]

let shipState = {
  capacity: 10,
  money: 400,
  cargo: [
    // { name: "socks", tons: 1 },
    // { name: "zukes", tons: 2 }
  ],
  capacity: 4
}

let itemIndex = 0;

updateMarket()
function updateMarket () {

  let data = markets.filter(z => z.planet===gameState.planet)[0].goods

  let marketRowsUpdating = d3.select("table#market")
    .selectAll("tr.marketItems")
    .data(data)

  let marketRowsEntering = marketRowsUpdating
    .enter()
    .append("tr").classed("marketItems", true)

  marketRowsEntering
    .append("td")
      .text(d => d.name)

  marketRowsEntering
    .append("td")
      .text(d => d.price)

  marketRowsEntering
    .append("td")
      .text(d => d.currentQuantity)

  let marketRowsEnteringUpdating = marketRowsEntering.merge(marketRowsUpdating)
    .style("background-color", (d,i) => i === itemIndex ? "yellow" : "white")

  d3.select("#cargoStatus")
    .text( function (){
      let string = ""
      shipState.cargo.forEach( function (thing) {
        string += `${thing.tons} tons of ${thing.name}, `
      })
      return string
    })
}

document.addEventListener("keydown", (e) => {

  switch(e.key) {
    case " ":
    console.log(canPurchase(selectItem(currentMarket(markets,gameState.planet),itemIndex),shipState))
    // markets = buyItem(itemIndex)
    break;

    case "ArrowUp":
    case "ArrowDown":
    itemIndex = updateSelectIndex(e.key==="ArrowUp" ? itemIndex - 1 : itemIndex + 1)
    break;
  }

  updateMarket()
})

let updateSelectIndex = (e) => clampValue(e,0,markets.filter(z => z.planet===gameState.planet)[0].goods.length - 1)
let clampValue = (e, min, max) => Math.min(Math.max(e,0),max)
let deepCopy = d => JSON.parse(JSON.stringify(d))
let currentMarket = (markets,planet) => deepCopy(markets.filter(z => z.planet===planet)[0])
let selectItem = ({goods:z},index) => z[index]
let canPurchase = ({currentQuantity:q,price:p},{money:m}) => m > p && q > 0
