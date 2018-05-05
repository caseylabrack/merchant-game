let d3 = require("d3")
let {curry} = require("lodash")

const Earth = "Earth",
      Venus = "Venus"

let gameState = { view: "market", planet: Earth }
let markets =
[
  { planet: "Earth", goods:
    [
      { name: "twinkies", price: 100, initialQuantity: 3, currentQuantity: 3 },
      { name: "compliments", price: 1, initialQuantity: 10, currentQuantity: 10 },
      { name: "uranium", price: 800, initialQuantity: 3, currentQuantity: 3 }
    ]
  },
  { planet: "Venus", goods:
    [
      { name: "twinkies", price: 110, initialQuantity: 3, currentQuantity: 3 },
      { name: "compliments", price: 1, initialQuantity: 10, currentQuantity: 10 },
      { name: "uranium", price: 820, initialQuantity: 3, currentQuantity: 3 }
    ]
  }
]

let localMarket = markets.filter(z => z.planet===gameState.planet)[0]
localMarket.goods[0].selected = true

let ship = {
  money: 400,
  capacity: 4,
  cargo: [
    { name: "socks", tons: 1 },
    { name: "zukes", tons: 2 }
  ]
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
      ship.cargo.forEach( function (thing) {
        string += `${thing.tons} tons of ${thing.name}, `
      })
      return string
    })
}

document.addEventListener("keydown", (e) => {

  switch(e.key) {
    case " ":
    purchase(getSelectedItem)
    // console.log(canPurchase(selectItem(currentMarket(markets,gameState.planet),itemIndex),shipState))
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
let getSelectedItem = ({goods: g}) => g.filter(z => z.selected)[0]
// let canPurchase = ({currentQuantity:q,price:p},{money:m}) => m > p && q > 0
let getPropertyIsTrue = curry(function (arr,prop){
  return arr.filter(z => z[prop]===true)
})
let marketPropertyFinder = getPropertyIsTrue(localMarket.goods)
let canPurchase = function(ship,item){
  return ship.capacity > playerShipTonnage("tons")
}
// let shipsLoad = function ({cargo:c}){
//   c.reduce( function(sum,val){ return sum + val.tons},0)
// }
let sumPropertyVals = curry(function(arr,prop){
  return arr.reduce( function(sum,val){ return sum + val[prop]},0)
})
let playerCargoTotals = sumPropertyVals(ship.cargo)

// let marketSelector = selectWithProperty(localMarket.goods)

// let selectItem = ({goods:z},index) => z[index]
