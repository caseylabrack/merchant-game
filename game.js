let d3 = require("d3")
let { clamp, gt, map, prop, add, reduce, range, clone, compose } = require("ramda")
let seedrandom = require('seedrandom')

let gameState = { view: "market", planet: "Earth" }

let rng = seedrandom("MikeBosstock")

let quantitySanityRange = clamp(0,100)
let scarcityPremium = d3.scaleLinear().domain([0,10]).range([2,1.1]).clamp(true)

let commodities = [
  {name: "purple dye", marginal: 6},
  {name: "salt", marginal: 2},
  {name: "fish sauce", marginal: 3},
  {name: "silk", marginal: 8}
]

let ports = ["Alexandria", "Athens", "Beirut", "Dubrovnik", "İzmir", "Rome", "Tangier"]

let markets = ports.map(function(portName){
  let m = {}
  m.name = portName
  m.goods = clone(commodities)

  m.goods = m.goods.map(function (product){

    product.supply = Math.round(rng()*100)
    product.demand = product.supply + Math.round(d3.randomUniform(-4,4)())
    product.quantity = Math.round(rng()*20)
    return updateProduct(product)
  })

  return m
})

function updateProduct (product) {
  product.quantity = quantitySanityRange(product.quantity + product.supply - product.demand)
  product.price = Math.round(product.marginal * scarcityPremium(product.quantity))
  product.supply += rng()*20 > 18 ? Math.round(d3.randomUniform(-2,2)) : 0 //small chance of shift every turn
  product.demand += rng()*20 > 18 ? Math.round(d3.randomUniform(-2,2)) : 0 //small chance of shift every turn
  return product
}

let localMarket = markets[Math.floor(rng()*markets.length)]
let localGoods = localMarket.goods
localGoods[0].selected = true

d3.select("#portTitle").select("p").text(localMarket.name)

let ship = {
  money: 4,
  mostMoney: 4,
  capacity: 4,
  cargo: []
}

const marketsChart = (function () {
   const svg = d3.select("#marketsChart svg"),
         margin = {top: 5, right: 20, bottom: 20, left: 5},
         width = svg.attr("width") - margin.left - margin.right,
         height = svg.attr("height") - margin.top - margin.bottom
         return svg.append("g").attr("transform", "translate("+margin.left+","+margin.top+")")
 })()

const xGroups = d3.scaleBand().domain(markets.map(z => z.name)).range([0,750]).padding(.1),
      xWithinGroup = d3.scaleBand().domain(markets[0].goods.map(z => z.name)).range([0,xGroups.bandwidth()]).padding(0),
      y = d3.scaleLinear().domain([-10,10]).range([0,150])

marketsChart.append("g").attr("class","axis axis-x").attr("transform", "translate(0,125)").call(d3.axisBottom(xGroups))

updateChart()
function updateChart() {

  let marketGs = marketsChart.selectAll(".markets")
    .data(markets)
    .enter()
      .append("g").classed("markets", true)
        .attr("transform", d => `translate(${xGroups(d.name)},0)`)

  marketGs
  .selectAll("rect")
    .data(d => d.goods)
    .enter()
      .append("rect")
        .attr("x", d => xWithinGroup(d.name))
        .attr("y", d => 130 - y(d.price))
        .attr("height", d => y(d.price))
        .attr("width", xWithinGroup.bandwidth())
        .style("fill", "red")

}


updateMarket()
function updateMarket () {

  let marketRowsUpdating = d3.select("table#market")
    .selectAll("tr.marketItems")
    .data(localGoods)

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
      scrollTable(localGoods, -1)
    break;

    case "ArrowDown":
      scrollTable(localGoods, 1)
    break;

    case "Tab":
      markets.map(market => market.goods.map(updateProduct))
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

let getSelectedItem = goods => goods.filter(z => z.selected)[0]
let canPurchase = function(player,item){
  if(ship.capacity <= ship.cargo.reduce( (sum,val) => sum + val.tons, 0)) return false //ship is full
  if(ship.money < item.price) { return false } //can't afford it
  if(item.quantity <= 0) { return false } //none left
  return true
}
let purchase = function(item) {
  if(canPurchase(ship,item)){
    item.quantity -= 1
    if(ship.cargo.some(z => z.name===item.name)){ //if already carrying this type of cargo
      ship.cargo.filter(z => z.name===item.name)[0].tons++
    } else {
      ship.cargo.push({name: item.name, tons: 1})
    }
    ship.money -= item.price
    return true
  } else { return false }
}
