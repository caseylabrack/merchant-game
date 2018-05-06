let d3 = require("d3")
let _ = require("lodash")

const Earth = "Earth",
      Venus = "Venus"

let gameState = { view: "market", planet: Earth }
let markets =
[
  { planet: "Earth", goods:
    [
      { name: "twinkies", price: 100, initialQuantity: 3, quantity: 3 },
      { name: "compliments", price: 1, initialQuantity: 10, quantity: 10 },
      { name: "uranium", price: 800, initialQuantity: 3, quantity: 3 }
    ]
  },
  { planet: "Venus", goods:
    [
      { name: "twinkies", price: 110, initialQuantity: 3, quantity: 3 },
      { name: "compliments", price: 1, initialQuantity: 10, quantity: 10 },
      { name: "uranium", price: 820, initialQuantity: 3, quantity: 3 }
    ]
  }
]

let localMarket = markets.filter(z => z.planet===gameState.planet)[0]
localMarket.goods[0].selected = true

let ship = {
  money: 400,
  capacity: 4,
  cargo: [
    // { name: "socks", tons: 1 },
    // { name: "zukes", tons: 2 }
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
      .text(d => d.quantity)

  let marketRowsEnteringUpdating = marketRowsEntering.merge(marketRowsUpdating)
      .style("background-color", d => d.selected ? "yellow" : "white")

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
    purchase(getSelectedItem(localMarket.goods))
    // console.log(canPurchase(selectItem(currentMarket(markets,gameState.planet),itemIndex),shipState))
    // markets = buyItem(itemIndex)
    break;

    case "ArrowUp":
    scrollTable(localMarket, -1)
    break;
    case "ArrowDown":
    scrollTable(localMarket, 1)
    break;
  }

  function scrollTable ({goods:g}, direction){
    let updatedIndex = _.clamp(g.indexOf(getSelectedItem(g)) + direction, 0, g.length-1)
    g = g.map( (x,i) => { x.selected = i===updatedIndex; return x })
  }

  updateMarket()
})

const compose = function(f, g) {
    return function(x) {
        return f(g(x));
    };
}

let deepCopy = d => JSON.parse(JSON.stringify(d))
let currentMarket = (markets,planet) => deepCopy(markets.filter(z => z.planet===planet)[0])
let getSelectedItem = g => g.filter(z => z.selected)[0]
let getPropertyIsTrue = _.curry(function (arr,prop){
  return arr.filter(z => z[prop]===true)
})
let marketPropertyFinder = getPropertyIsTrue(localMarket.goods)
let canPurchase = function(player,item){
  if(ship.capacity <= ship.cargo.reduce( (sum,val) => sum + val.tons, 0)) return false //ship is full
  if(ship.money < item.price) { return false } //can't afford it
  if(item.quantity <= 0) { return false } //none left
  return true
}
let purchase = function(item) {
  if(canPurchase(ship,item)){
    item.quantity -= 1
    ship.cargo.push(itemToCargo(item))
    return true
  } else { return false }
}
let itemToCargo = function(item) {
  let r = {}
  r.name = item.name
  r.pricePaid = item.price
  r.tons = 1
  return r
}
