let d3 = require("d3")
let { clamp, gt, map, prop, add, reduce, range } = require("ramda")

let gameState = { view: "market", planet: "Earth" }

let markets =
[
  { planet: "Earth", goods:
    [
      { name: "twinkies", price: 2, initialQuantity: 3, quantity: 3, supply: 30, demand: 28, marginalCost: 2 },
      { name: "compliments", price: 1, initialQuantity: 10, quantity: 10, supply: 5, demand: 5, marginalCost: 4 },
      { name: "uranium", price: 8, initialQuantity: 10, quantity: 10, supply: 10, demand: 11, marginalCost: 8 }
    ]
  },
  { planet: "Venus", goods:
    [
      { name: "twinkies", price: 2, initialQuantity: 3, quantity: 3 },
      { name: "compliments", price: 2, initialQuantity: 10, quantity: 10 },
      { name: "uranium", price: 9, initialQuantity: 3, quantity: 3 }
    ]
  }
]

let scarcityPremium = d3.scaleLinear().domain([0,10]).range([2,1.1]).clamp(true)
let quantitySanityRange = clamp(0,100)

function cycleGoods () {

  markets.forEach(function(market){

    market.goods.map(function(product){

      product.quantity = quantitySanityRange(product.quantity + product.supply - product.demand)

      product.price = Math.round(product.marginalCost * scarcityPremium(product.quantity))
      return product
    })
  })
}

let localMarket = markets.filter(z => z.planet===gameState.planet)[0].goods
localMarket.selected = true

let ship = {
  money: 4,
  mostMoney: 4,
  capacity: 4,
  cargo: []
}

updateMarket()
function updateMarket () {

  let marketRowsUpdating = d3.select("table#market")
    .selectAll("tr.marketItems")
    .data(localMarket)

  let marketRowsEntering = marketRowsUpdating
    .enter().append("tr").classed("marketItems", true)

  marketRowsEntering.append("td").classed("name", true)
  marketRowsEntering.append("td").classed("price", true)
  marketRowsEntering.append("td").classed("quantity", true)

  let marketRowsEnteringUpdating = marketRowsEntering.merge(marketRowsUpdating)
      .style("background-color", d => d.selected ? "yellow" : "white")

  marketRowsEnteringUpdating.select(".name").text(d => d.name)
  marketRowsEnteringUpdating.select(".price").text(d => d.price)
  marketRowsEnteringUpdating.select(".quantity").text(d => d.quantity)
}

function updateShipDisplay () {
  let shipInfo = []
  shipInfo.push(`you have ${ship.money}`)
  shipInfo.push(`in your cargo you have ${ship.cargo.map(z => z.tons + " tons of " + z.name).toString().replace(/,/g,", ")}`)

  let shipInfoRows = d3.select("#shipStatus").selectAll("p").data(shipInfo)

  let shipRowsEntering = shipInfoRows
    .enter()
      .append("p")

  let shipRowsEnterUpdate = shipRowsEntering.merge(shipInfoRows)
    .text(d => d)
}

updateShipVisual()
function updateShipVisual () {
  let data = d3.range(0,ship.money)
  let x = d3.scaleBand().domain(d3.range(0,ship.mostMoney)).rangeRound([0, 200]).padding(.05)

  let update = d3.select("svg#moneyStatus")
    .selectAll("rect")
    .data(data)

  let enter = update
    .enter()
      .append("rect")

  update.merge(enter)
        .attr("x", d => x(d))
        .attr("y", 10)
        .attr("width", x.bandwidth())
        .attr("height", 10)
        .style("fill", "green" )

  update.exit().remove()
}

updateShipCargo()
function updateShipCargo () {

  let x = d3.scaleBand().domain(range(0,ship.capacity)).rangeRound([0, 200]).padding(.05)

  let shipLoad = reduce(add,0,map(prop("tons"),ship.cargo))
  let data = map(gt(shipLoad),range(0,ship.capacity))

  let updating = d3.select("svg#cargoStatus")
    .selectAll("rect")
    .data(data)

  let entering = updating
    .enter()
      .append("rect")

  let updatingEntering = updating.merge(entering)
    .attr("x", (d,i) => x(i)).attr("y", 10).attr("width", x.bandwidth()).attr("height", 10)
    .style("stroke", "brown").style("stroke-width", 1)
    .transition()
    .style("fill", d => d ? "brown" : "white")
}

document.addEventListener("keydown", (e) => {

  switch(e.key) {
    case " ":
    purchase(getSelectedItem(localMarket))
    break;

    case "ArrowUp":
    scrollTable(localMarket, -1)
    break;

    case "ArrowDown":
    scrollTable(localMarket, 1)
    break;

    case "Tab":
    cycleGoods()
    break;
  }

  function scrollTable (g, direction){
    let updatedIndex = clamp(0, g.length-1, g.indexOf(getSelectedItem(g)) + direction) //index of new row
    g = g.map( (x,i) => { x.selected = i===updatedIndex; return x }) // set all other rows to false
  }

  updateMarket()
  updateShipVisual()
  updateShipCargo()
})

let getSelectedItem = g => g.filter(z => z.selected)[0]
let canPurchase = function(player,item){
  if(ship.capacity <= ship.cargo.reduce( (sum,val) => sum + val.tons, 0)) return false //ship is full
  if(ship.money < item.price) { return false } //can't afford it
  if(item.quantity <= 0) { return false } //none left
  return true
}
let purchase = function(item) {
  if(canPurchase(ship,item)){
    item.quantity -= 1
    if(ship.cargo.filter(z => z.name===item.name).length > 0){ //if already carrying this type of cargo
      ship.cargo.filter(z => z.name===item.name)[0].tons++
    } else {
      ship.cargo.push({name: item.name, tons: 1})
    }
    ship.money -= item.price
    return true
  } else { return false }
}
